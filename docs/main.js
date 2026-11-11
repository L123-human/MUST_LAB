/* 食堂好味道：校园食堂菜品推荐 + 卡路里计算（纯前端，可直接打开） */

const TASTES = ["日式", "韩式", "川湘", "粤式", "炸物", "烤肉", "面食", "盖饭", "轻食", "清淡", "微辣", "中辣", "麻辣", "酸甜", "甜口", "浓郁", "高蛋白", "少油", "素食", "汤水", "下饭"];
const MEALS = [
  { id: "breakfast", name: "早餐" },
  { id: "lunch", name: "午餐" },
  { id: "dinner", name: "晚餐" },
  { id: "snack", name: "加餐" }
];
const EXCLUDES = ["香菜", "葱", "蒜", "花生", "鸡蛋", "牛肉", "猪肉", "虾"];
const WEEK_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

const LS = {
  theme: "canteen_theme",
  goal: "canteen_goal",
  prefs: "canteen_prefs",
  logs: "canteen_logs"
};

const $ = (sel) => document.querySelector(sel);
const view = $("#view");
const topBar = $("#topBar");

/* ---------- 本地存储 ---------- */
function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

let goal = load(LS.goal, 2000);
let prefs = load(LS.prefs, { tastes: [], excluded: [], budget: "" });
let logs = load(LS.logs, []);
let ui = { kw: "", taste: "", selectedTastes: [], meal: "lunch", factor: 1, aiText: "", aiHits: null, aiMode: "food", feedbackDrafts: {}, day: "" };

function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function todayLogs() {
  const key = todayKey();
  return logs.filter((item) => item.day === key);
}
/* 当前选中的日期，空字符串表示“今天” */
function activeDay() {
  return ui.day || todayKey();
}
function dayLogs() {
  const key = activeDay();
  return logs.filter((item) => item.day === key);
}
function isTodaySelected() {
  return activeDay() === todayKey();
}
function sumKcal(list) {
  return list.reduce((n, item) => n + (item.kcal || 0), 0);
}
function sumMacro(list, key) {
  return list.reduce((n, item) => n + (item[key] || 0), 0);
}
function mealName(id) {
  const found = MEALS.find((m) => m.id === id);
  return found ? found.name : "加餐";
}
function dishById(id) {
  return DISHES.find((d) => d.id === id);
}

/* 按热量目标估算三大营养素日上限（演示用） */
function macroGoals() {
  return {
    protein: Math.round(goal * 0.2 / 4),
    carb: Math.round(goal * 0.5 / 4),
    fat: Math.round(goal * 0.3 / 9)
  };
}

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

/* ---------- 主题 ---------- */
function applyTheme(theme) {
  const next = theme === "health" ? "health" : "warm";
  document.documentElement.dataset.theme = next;
  $("#themeLabel").textContent = next === "health" ? "健康" : "普通";
  $("#themeToggle").setAttribute("aria-checked", next === "health" ? "true" : "false");
  $("#greetHi").textContent = greeting() + (next === "health" ? " · 轻负担" : "");
}
function toggleTheme() {
  const next = document.documentElement.dataset.theme === "health" ? "warm" : "health";
  save(LS.theme, next);
  applyTheme(next);
  toast(next === "health" ? "已切换到健康主题" : "已切换到普通主题");
}

/* ---------- REQ-1.4 收藏与反馈 ---------- */
let personal = PersonalRecords.empty();
let personalError = "";
let demoActive = PersonalApi.active();
let personalRequest = 0;
let personalSession = 0;
let personalSaving = false;

async function readPersonal() {
  const request = ++personalRequest;
  personalError = "";
  personal = PersonalRecords.empty();
  if (!demoActive) return true;
  try {
    const saved = await PersonalApi.read();
    if (request !== personalRequest) return false;
    personal = saved;
  } catch (error) {
    if (request !== personalRequest) return false;
    personalError = error.message;
  }
  return true;
}

function setDemo(active) {
  try {
    if (active) sessionStorage.setItem(PersonalApi.sessionKey, "yes");
    else sessionStorage.removeItem(PersonalApi.sessionKey);
  } catch (_) { toast("无法开启本地演示，请允许浏览器存储。"); return; }
  demoActive = active;
  personalSession++;
  ui.feedbackDrafts = {};
  const pending = route();
  toast(active ? "已进入本地演示；请勿保存敏感信息。" : "已退出演示；本地数据仍保留。");
  return pending;
}

async function changePersonal(action, id, value) {
  if (!demoActive) { toast("请登录后使用；当前可到收藏页开启本地演示。"); return false; }
  if (personalSaving) return false;
  personalSaving = true;
  const session = personalSession;
  document.querySelectorAll("[data-personal]").forEach(button => { button.disabled = true; });
  try {
    const saved = await PersonalApi.change(action, id, value);
    if (session !== personalSession) return false;
    personalRequest++;
    personal = saved;
    personalError = "";
    return true;
  } catch (error) {
    if (session === personalSession) toast(error.message);
    return false;
  } finally {
    personalSaving = false;
    document.querySelectorAll("[data-personal]").forEach(button => { button.disabled = false; });
  }
}

function personalPanel(d) {
  if (!demoActive) return '<section class="panel"><h2>收藏与反馈</h2><p class="desc">请登录后使用。账户功能待接入，可先试用本地演示。</p><a class="btn btn-soft" href="#favorites">前往收藏与反馈</a></section>';
  if (personalError) return '<div class="panel" role="alert">' + esc(personalError) + '</div>';
  const favorite = personal.favorites.includes(d.id);
  const item = personal.feedback[d.id] || { mark: "", text: "" };
  // 保留未保存的文字。
  const draft = ui.feedbackDrafts[d.id] ?? item.text;
  return '<section class="panel personal-panel"><h2>收藏与反馈</h2>' +
    '<p class="desc">本地演示 · 仅保存在此浏览器，共用设备可见。收藏不代表点赞。</p>' +
    '<div class="personal-actions"><button class="btn btn-soft" type="button" data-personal="' + (favorite ? 'unfavorite' : 'favorite') + '" data-id="' + d.id + '" aria-pressed="' + favorite + '">' + (favorite ? '取消收藏' : '收藏这道菜') + '</button>' +
    ['like', 'not-interested'].map((mark) => '<button class="chip' + (item.mark === mark ? ' on' : '') + '" type="button" data-personal="mark" data-value="' + mark + '" data-id="' + d.id + '" aria-pressed="' + (item.mark === mark) + '">' + (mark === 'like' ? '点赞' : '不感兴趣') + '</button>').join('') + '</div>' +
    '<p class="meta">再次点击所选标记可撤销；标记仅影响口味同分菜品的顺序。</p>' +
    '<div class="field"><label for="feedbackText">文字反馈（可选，最多 200 字符，不参与排序）</label>' +
    '<textarea id="feedbackText" rows="3" data-dish-id="' + d.id + '" aria-describedby="feedbackCount">' + esc(draft) + '</textarea>' +
    '<span id="feedbackCount" class="meta">' + PersonalRecords.textLength(draft) + ' / 200</span></div>' +
    '<div class="personal-actions"><button class="btn" type="button" data-personal="text" data-id="' + d.id + '">保存文字反馈</button>' +
    '<button class="btn btn-ghost" type="button" data-personal="clear-feedback" data-id="' + d.id + '">清除全部反馈</button></div></section>';
}

function renderFavorites() {
  setTab("favorites");
  showTop(true);
  let html = '<h1 class="h1">收藏与反馈</h1>';
  if (!demoActive) {
    view.innerHTML = html + '<div class="panel"><h2>请登录后使用</h2><p class="desc">账户功能尚未接入。本地演示可试用收藏和反馈，数据仅存于此浏览器，共用设备可见，不会发送给食堂。</p><button class="btn" type="button" id="startPersonalDemo">进入本地演示</button></div>';
    return;
  }
  html += '<p class="desc">本地演示 · 共用设备可见 · ' + personal.favorites.length + ' / 20 项收藏</p><button class="btn btn-ghost" type="button" id="stopPersonalDemo">退出本地演示</button>';
  if (personalError) { view.innerHTML = html + '<p role="alert">' + esc(personalError) + '</p>'; return; }
  function recordCard(id, isFavorite) {
    const d = dishById(id);
    const item = personal.feedback[id] || { mark: "", text: "" };
    const title = d ? '<a href="#dish/' + id + '"><strong>' + esc(d.name) + '</strong></a>' : '<strong>菜品 #' + id + ' 已不在菜单中</strong>';
    const info = d ? esc(STALLS[d.stall].name) + ' · ' + (Number.isFinite(d.price) ? '¥' + d.price.toFixed(2) : '价格待确认') + ' · ' + esc(dishStatus(d)) : '原记录保留，可取消收藏或清除反馈。';
    return '<article class="panel personal-record">' + title + '<p class="meta">' + info + '</p>' +
      '<p>' + (item.mark === 'like' ? '已点赞' : item.mark === 'not-interested' ? '不感兴趣' : '未标记') + '</p>' +
      (item.text ? '<p class="feedback-copy">' + esc(item.text) + '</p>' : '') +
      '<div class="personal-actions">' + (d ? '<a class="btn btn-soft" href="#dish/' + id + '">查看与编辑</a>' : '') +
      (isFavorite ? '<button class="btn btn-ghost" type="button" data-personal="unfavorite" data-id="' + id + '">取消收藏</button>' : '') +
      (personal.feedback[id] ? '<button class="btn btn-ghost" type="button" data-personal="clear-feedback" data-id="' + id + '">清除全部反馈</button>' : '') + '</div></article>';
  }
  html += '<div class="section-head"><h2>我的收藏</h2><a href="#menu">浏览菜单</a></div>' +
    (personal.favorites.length ? personal.favorites.map((id) => recordCard(id, true)).join('') : '<div class="empty"><strong>还没有收藏</strong>进入菜品详情，收藏想再次查看的菜。</div>');
  const others = Object.keys(personal.feedback).map(Number).filter((id) => !personal.favorites.includes(id));
  html += '<div class="section-head"><h2>其他菜品反馈</h2></div>' +
    (others.length ? others.map((id) => recordCard(id, false)).join('') : '<p class="desc">暂无其他反馈。取消收藏不会删除反馈。</p>');
  view.innerHTML = html;
}

/* ---------- 推荐逻辑 ---------- */
function visibleDishes(limit = 5) {
  const kw = ui.kw.trim();
  const dishes = DISHES.filter(d =>
    (!kw || d.name.includes(kw) || STALLS[d.stall].name.includes(kw)) &&
    (!ui.taste || d.tastes.includes(ui.taste)));
  const tastes = ui.selectedTastes.length ? ui.selectedTastes : prefs.tastes;
  if (limit === Infinity) {
    return rankDishes(dishes.filter(d =>
      (!prefs.budget || (Number.isFinite(d.price) && d.price >= 0 && d.price <= Number(prefs.budget))) &&
      !prefs.excluded.some(ing => d.ingredients.includes(ing))), tastes, personal);
  }
  return getRecommendation(dishes, {
    maxBudget: prefs.budget, excludeIngredients: prefs.excluded, preferredTastes: tastes
  }, personal).list;
}

function dishStatus(d) {
  return (d.available === true ? "可售" : d.available === false ? "暂不可售" : "可售状态待确认") +
    " · " + (d.verified === true ? "食材已核验" : "食材待核验");
}

function toast(msg) {
  const el = $("#toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 1800);
}

function setTab(name) {
  document.querySelectorAll(".tabbar a").forEach((a) => {
    const on = a.dataset.tab === name;
    if (on) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function showTop(show) {
  topBar.classList.toggle("is-hidden", !show);
}

/* 本周 7 天（含今天）热量汇总，用于统计柱状图 */
function weekSeries() {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    const kcal = sumKcal(logs.filter((item) => item.day === key));
    days.push({
      key,
      label: WEEK_LABELS[d.getDay()],
      num: d.getDate(),
      kcal,
      today: i === 0
    });
  }
  return days;
}

/* ---------- 页面渲染 ---------- */
function renderHome(menu = false) {
  setTab("home");
  showTop(true);
  const list = dayLogs();
  const eaten = sumKcal(list);
  const pct = goal ? Math.min(100, Math.round(eaten / goal * 100)) : 0;
  const left = Math.max(0, goal - eaten);
  const mg = macroGoals();
  const pEaten = Math.round(sumMacro(list, "protein"));
  const cEaten = Math.round(sumMacro(list, "carb"));
  const fEaten = Math.round(sumMacro(list, "fat"));
  const pLeft = Math.max(0, mg.protein - pEaten);
  const cLeft = Math.max(0, mg.carb - cEaten);
  const fLeft = Math.max(0, mg.fat - fEaten);
  const dishes = visibleDishes(menu ? Infinity : 5);
  const week = weekSeries();

  view.innerHTML =
    '<div class="week" role="list" aria-label="本周日期">' +
      week.map((d) =>
        '<button class="day-pill' + (((ui.day === "" && d.today) || ui.day === d.key) ? " on" : "") + '" type="button" data-day="' + d.key + '" aria-pressed="' + (((ui.day === "" && d.today) || ui.day === d.key) ? "true" : "false") + '">' +
          '<span>' + d.label + '</span><span class="num">' + d.num + "</span></button>"
      ).join("") +
    "</div>" +
    '<a class="cal-card" href="#stats">' +
      '<div><div class="label">' + (isTodaySelected() ? '今日热量' : '当日热量') + '</div>' +
      '<div class="nums">' + eaten + ' <span>/ ' + goal + ' kcal</span></div>' +
      '<div class="hint">还剩约 ' + left + ' kcal · 点此看明细</div></div>' +
      '<div class="ring" style="--p:' + pct + '"><span>' + pct + '%</span></div>' +
    "</a>" +
    '<div class="macros-row">' +
      macroMini("p", pLeft, mg.protein, "蛋白质") +
      macroMini("c", cLeft, mg.carb, "碳水") +
      macroMini("f", fLeft, mg.fat, "脂肪") +
    "</div>" +
    '<div class="search"><input id="kw" placeholder="搜菜名或摊位，例如白切鸡" value="' + esc(ui.kw) + '" aria-label="搜索菜名或摊位">' +
      '<button class="btn" id="doSearch" type="button">搜索</button></div>' +
     '<p class="desc">标签可多选，匹配越多越靠前。预算与忌口始终生效。</p><button class="btn btn-soft" type="button" data-open-onboarding>搜索标签 / 分类选择</button><div class="chips" role="list">' +
      '<button class="chip' + (!(ui.selectedTastes || []).length ? " on" : "") + '" data-taste="" type="button">使用已保存偏好</button>' +
      TASTES.filter(t => DISHES.some(d => d.tastes.includes(t))).map((t) => '<button class="chip' + ((ui.selectedTastes || []).includes(t) ? " on" : "") + '" data-taste="' + esc(t) + '" type="button">' + esc(t) + "</button>").join("") +
    "</div>" +
    '<div class="section-head"><h2>' + (menu ? '菜单浏览' : '今日推荐 · 最多 5 道') + '</h2><a href="#settings">调整偏好</a></div>' +
    '<p class="desc"><a href="' + (menu ? '#home' : '#menu') + '">' + (menu ? '返回推荐' : '浏览全部匹配菜品') + '</a> · <a href="#favorites">收藏与反馈</a></p>' +
    '<div class="list">' +
      (dishes.length ? dishes.map(dishCard).join("") :
        '<div class="empty"><strong>没有符合条件的菜</strong>' + (menu ? '请调整搜索条件或偏好。' : '仅推荐可售且食材已核验的菜品；请浏览菜单查看状态，或调整预算、忌口后重试。') + '</div>') +
    "</div>";
}

function macroMini(cls, left, goalVal, label) {
  const used = Math.max(0, goalVal - left);
  const p = goalVal ? Math.min(100, Math.round(used / goalVal * 100)) : 0;
  return '<div class="macro-card ' + cls + '">' +
    '<div class="m-val">' + left + '<span class="m-unit">g</span></div>' +
    '<div class="m-label">' + label + "剩余</div>" +
    '<div class="macro-arc"><i style="--p:' + p + '%"></i></div></div>';
}

function dishCard(d) {
  const reason = d.reason;
  return '<a class="card dish" href="#dish/' + d.id + '">' +
    '<img src="' + STALLS[d.stall].img + '" alt="' + esc(d.name) + '">' +
    '<div class="dish-body">' +
      '<div class="dish-name"><span>' + esc(d.name) + '</span><span class="price">¥' + d.price + "</span></div>" +
      '<div class="meta">' + esc(STALLS[d.stall].name) + " · " + esc(d.portion) + "</div>" +
      '<div class="kcal-row"><span class="kcal-badge">+' + d.kcal + " kcal</span>" +
        '<span class="macro-dots">' +
          '<span class="dp">P' + d.protein + "</span>" +
          '<span class="dc">C' + d.carb + "</span>" +
          '<span class="df">F' + d.fat + "</span>" +
        "</span></div>" +
      '<p class="meta">' + esc(dishStatus(d)) + '</p>' +
      '<div class="tags">' + d.tastes.slice(0, 3).map((t) => '<span class="tag">' + esc(t) + "</span>").join("") + "</div>" +
      (reason ? '<div class="reason">' + esc(reason) + "</div>" : "") +
    "</div></a>";
}

function renderDetail(id) {
  setTab("home");
  showTop(false);
  const d = dishById(id);
  if (!d) {
    showTop(true);
    view.innerHTML = '<a class="btn btn-ghost" href="#home" style="margin-bottom:12px">返回首页</a><div class="empty"><strong>找不到这道菜</strong>请回到首页重新选择。</div>';
    return;
  }
  const factor = ui.factor;
  const kcal = Math.round(d.kcal * factor);
  const protein = Math.round(d.protein * factor);
  const fat = Math.round(d.fat * factor);
  const carb = Math.round(d.carb * factor);
  // 圆环按「相对一份标准」展示，便于看份量变化
  const ringPct = Math.min(100, Math.round(factor / 2 * 100));
  const maxP = Math.round(d.protein * 2) || 1;
  const maxC = Math.round(d.carb * 2) || 1;
  const maxF = Math.round(d.fat * 2) || 1;

  view.innerHTML =
    '<div class="detail-page">' +
      '<div class="detail-hero">' +
        '<img src="' + STALLS[d.stall].img + '" alt="' + esc(d.name) + '">' +
        '<div class="veil"></div>' +
        '<a class="back-fab" href="#home" aria-label="返回首页">←</a>' +
      "</div>" +
      '<div class="detail-sheet">' +
        '<h1 class="detail-title">' + esc(d.name) + "</h1>" +
        '<p class="detail-sub">' + esc(STALLS[d.stall].name) + " · " + esc(d.portion) + " · ¥" + d.price + "</p>" +
        '<p class="meta">' + esc(dishStatus(d)) + '</p>' +
        '<div class="tags" style="margin-bottom:14px">' + d.tastes.map((t) => '<span class="tag">' + esc(t) + "</span>").join("") + "</div>" +
        '<div class="nutri-card">' +
          '<div class="ring-light" style="--p:' + ringPct + '"><div class="inner"><b>' + kcal + "</b><small>kcal</small></div></div>" +
          '<div class="nutri-side">' +
            '<div class="unit">当前份量估算</div><div class="big">' + portionLabel(factor) + "</div>" +
            barRow("蛋白质", protein, maxP) +
            barRow("碳水", carb, maxC) +
            barRow("脂肪", fat, maxF) +
          "</div>" +
        "</div>" +
        '<div class="panel"><div class="meta">食材：' + esc(d.ingredients.join("、")) + "</div>" +
          '<div class="reason" style="margin-top:6px">热量按常见份量估算，未做实验室检测。</div></div>' +
        '<div class="stepper">' +
          '<button type="button" id="minus" aria-label="减少份量">−</button>' +
          '<div class="grow">' + portionLabel(factor) + "</div>" +
          '<button type="button" id="plus" aria-label="增加份量">+</button>' +
        "</div>" +
        '<div class="meal-pick">' + MEALS.map((m) =>
          '<button class="chip' + (ui.meal === m.id ? " on" : "") + '" data-meal="' + m.id + '" type="button">' + m.name + "</button>"
        ).join("") + "</div>" +
        '<button class="btn btn-block" id="addLog" type="button">记入今日' + mealName(ui.meal) + "</button>" +
        personalPanel(d) +
      "</div>" +
    "</div>";
}

function barRow(label, val, max) {
  const p = Math.min(100, Math.round(val / max * 100));
  return '<div class="bar-row"><div class="lbl"><span>' + label + "</span><span>" + val + "g</span></div>" +
    '<div class="track"><i style="--p:' + p + '%"></i></div></div>';
}

function portionLabel(factor) {
  if (factor === 0.5) return "半份";
  if (factor === 1.5) return "一份半";
  if (factor === 2) return "两份";
  return "一份";
}

function renderStats() {
  setTab("stats");
  showTop(true);
  const list = todayLogs();
  const eaten = sumKcal(list);
  const pct = goal ? Math.min(100, Math.round(eaten / goal * 100)) : 0;
  const left = goal - eaten;
  const week = weekSeries();
  const maxWeek = Math.max(goal, ...week.map((d) => d.kcal), 1);

  const groups = MEALS.map((m) => {
    const items = list.filter((item) => item.meal === m.id);
    const total = sumKcal(items);
    const body = items.length ? items.map((item) =>
      '<div class="log-item"><div><div>' + esc(item.name) + "</div><div class=\"meta\">" + esc(item.portionText) + "</div></div>" +
      "<div>" + item.kcal + ' kcal <button type="button" data-del="' + item.uid + '">移除</button></div></div>'
    ).join("") : '<div class="meta" style="padding:6px 0">还没有记录</div>';
    return '<section class="meal-card"><h3><span>' + m.name + '</span><span>' + total + " kcal</span></h3>" + body + "</section>";
  }).join("");

  view.innerHTML =
    '<h1 class="h1">今日统计</h1><p class="desc">' + todayKey() + " · 只统计你记入的菜</p>" +
    '<section class="stat-hero">' +
      '<div class="top-line"><b>' + eaten + '</b><span>目标 ' + goal + " kcal</span></div>" +
      '<div class="progress"><i style="--p:' + pct + '%"></i></div>' +
      '<div class="meta">' + (left >= 0 ? "还剩约 " + left + " kcal" : "已超出约 " + (-left) + " kcal") + " · " + pct + "%</div>" +
    "</section>" +
    '<div class="section-head"><h2>近 7 天</h2></div>' +
    '<div class="panel" style="padding-bottom:12px">' +
      '<div class="week-chart">' +
        week.map((d) => {
          const h = Math.max(8, Math.round(d.kcal / maxWeek * 92));
          return '<div class="col"><div class="bar' + (d.today ? " on" : "") + '" style="height:' + h + 'px" title="' + d.kcal + ' kcal"></div><span>' + d.label + "</span></div>";
        }).join("") +
      "</div></div>" +
    groups +
    (list.length ? '<button class="btn btn-ghost btn-block" id="clearToday" type="button">清空今日记录</button>' : "");
}

function renderAi() {
  setTab("ai");
  showTop(true);
  const hits = ui.aiHits;
  let result = "";
  if (hits) {
    result = hits.length
      ? '<div class="panel"><strong style="display:block;margin-bottom:4px">识别到这些菜</strong>' + hits.map((d) =>
          '<div class="ai-hit"><div><div>' + esc(d.name) + '</div><div class="meta">约 ' + d.kcal + " kcal · " + esc(STALLS[d.stall].name) + "</div></div>" +
          '<button class="btn btn-soft" type="button" data-add="' + d.id + '">记入</button></div>'
        ).join("") + "</div>"
      : '<div class="empty"><strong>没有对上菜单</strong>请写出完整菜名，例如「白切鸡饭」。</div>';
  }

  const modes = [
    { id: "food", label: "扫菜品", path: "M4 7h16M4 12h10M4 17h14" },
    { id: "qr", label: "二维码", path: "M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h2v2h-2zM17 17h2v2h-2z" },
    { id: "label", label: "配料表", path: "M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" },
    { id: "nutri", label: "营养素", path: "M12 4v16M6 10l6-4 6 4M6 14l6 4 6-4" }
  ];

  view.innerHTML =
    '<h1 class="h1">AI 录入</h1>' +
    '<p class="desc">浏览器内按菜名匹配菜单，不上传服务器。</p>' +
    '<div class="scan-frame">' +
      '<img src="assets/qingshi.jpg" alt="扫描示意">' +
      '<div class="scan-corners"><span class="tl"></span><span class="tr"></span><span class="bl"></span><span class="br"></span></div>' +
      '<div class="scan-line"></div>' +
    "</div>" +
    '<div class="scan-modes">' +
      modes.map((m) =>
        '<button class="scan-mode' + (ui.aiMode === m.id ? " on" : "") + '" type="button" data-aimode="' + m.id + '">' +
          '<span class="ico"><svg viewBox="0 0 24 24"><path d="' + m.path + '"/></svg></span>' +
          esc(m.label) + "</button>"
      ).join("") +
    "</div>" +
    '<div class="panel"><div class="field"><label for="aiText">说说吃了什么</label>' +
      '<textarea id="aiText" rows="3" placeholder="例如：午餐吃了白切鸡饭和醋溜土豆丝">' + esc(ui.aiText) + "</textarea></div>" +
      '<div class="chips">' +
        ["午餐 白切鸡饭", "晚餐 红烧牛肉面", "加餐 牛油果鸡胸沙拉"].map((s) =>
          '<button class="chip" type="button" data-sample="' + esc(s) + '">' + esc(s) + "</button>"
        ).join("") +
      "</div>" +
      '<div class="meal-pick" style="margin-top:8px">' + MEALS.map((m) =>
        '<button class="chip' + (ui.meal === m.id ? " on" : "") + '" data-meal="' + m.id + '" type="button">' + m.name + "</button>"
      ).join("") + "</div>" +
      '<button class="btn btn-block" id="parseAi" type="button">识别并计算热量</button></div>' +
    result;
}

function renderSettings() {
  setTab("settings");
  showTop(true);
  view.innerHTML =
    '<h1 class="h1">设置</h1><button class="btn btn-soft" type="button" data-open-onboarding>调整我的偏好</button><p class="desc">修改后请点击保存。口味影响排序，忌口和预算过滤菜品；热量目标仅保存在本机。</p>' +
    '<div class="setting-block"><div class="field"><label for="goal">每日热量目标（kcal）</label>' +
      '<input id="goal" type="number" min="800" max="4000" value="' + esc(goal) + '"></div>' +
      '<div class="field"><label for="budget">单份预算上限（元，可空）</label>' +
      '<input id="budget" type="number" min="1" max="999" placeholder="不限制" value="' + esc(prefs.budget) + '"></div>' +
      '<button class="btn btn-block" id="saveGoal" type="button">保存偏好与目标</button></div>' +
    '<div class="setting-block"><strong>喜欢的口味</strong><div class="chips">' +
      TASTES.map((t) => '<button class="chip' + (prefs.tastes.includes(t) ? " on" : "") + '" data-pref="' + esc(t) + '" type="button">' + esc(t) + "</button>").join("") +
    "</div></div>" +
    '<div class="setting-block"><strong>忌口食材</strong><div class="chips">' +
      EXCLUDES.map((t) => '<button class="chip' + (prefs.excluded.includes(t) ? " on" : "") + '" data-ex="' + esc(t) + '" type="button">' + esc(t) + "</button>").join("") +
    '</div><div class="meta" style="margin-top:8px">含这些食材的菜不会出现在首页。</div></div>' +
    '<div class="setting-block"><strong>主题配色</strong>' +
      '<p class="desc" style="margin-bottom:10px">普通为米白 + 暖橙；健康为浅绿 + 鲜绿。也可点顶部开关。</p>' +
      '<button class="btn btn-block" id="themeFromSettings" type="button">切换到' +
      (document.documentElement.dataset.theme === "health" ? "普通主题" : "健康主题") + "</button></div>";
}

let currentDish = null;

async function route() {
  if (!await readPersonal()) return;
  const hash = (location.hash || "#home").slice(1);
  // 重新触发进入动画
  view.style.animation = "none";
  void view.offsetWidth;
  view.style.animation = "";

  if (hash.startsWith("dish/")) {
    const id = Number(hash.split("/")[1]);
    if (currentDish !== id) {
      ui.factor = 1;
      currentDish = id;
    }
    renderDetail(id);
    return;
  }
  currentDish = null;
  if (hash === "favorites") return renderFavorites();
  if (hash === "menu") return renderHome(true);
  if (hash === "stats") return renderStats();
  if (hash === "ai") return renderAi();
  if (hash === "settings") return renderSettings();
  renderHome();
}

function snapshotInputs() {
  const feedback = $("#feedbackText");
  if (feedback) ui.feedbackDrafts[feedback.dataset.dishId] = feedback.value;
  const kw = $("#kw");
  if (kw) ui.kw = kw.value;
  const ai = $("#aiText");
  if (ai) ui.aiText = ai.value;
}

function addDishLog(dish, factor) {
  const item = {
    uid: Date.now() + Math.floor(Math.random() * 1000),
    day: todayKey(),
    dishId: dish.id,
    name: dish.name,
    meal: ui.meal,
    kcal: Math.round(dish.kcal * factor),
    protein: Math.round(dish.protein * factor),
    fat: Math.round(dish.fat * factor),
    carb: Math.round(dish.carb * factor),
    portionText: portionLabel(factor)
  };
  logs.push(item);
  save(LS.logs, logs);
  toast("已记入" + mealName(ui.meal) + " · " + item.kcal + " kcal");
}

/* ---------- 事件委托 ---------- */
document.body.addEventListener("click", async (e) => {
  snapshotInputs();
  if (e.target.closest("#startPersonalDemo")) { setDemo(true); return; }
  if (e.target.closest("#stopPersonalDemo")) { setDemo(false); return; }
  const actionButton = e.target.closest("[data-personal]");
  if (actionButton) {
    const id = Number(actionButton.dataset.id);
    const action = actionButton.dataset.personal;
    let value = actionButton.dataset.value;
    if (action === "mark" && actionButton.getAttribute("aria-pressed") === "true") value = "";
    if (action === "text") value = $("#feedbackText").value;
    if (await changePersonal(action, id, value)) {
      if ((action === "text" && ui.feedbackDrafts[id] === value) || action === "clear-feedback") delete ui.feedbackDrafts[id];
      await route();
      const messages = { favorite: "已收藏（不影响推荐排序）", unfavorite: "已取消收藏，反馈仍保留", mark: "反馈已更新，推荐将按新标记排序", text: "文字反馈已保存（不参与排序）", "clear-feedback": "全部反馈已清除，排序影响已撤销" };
      toast(messages[action]);
    }
    return;
  }

  // 主题开关（含内部轨道/圆钮）
  if (e.target.closest("#themeToggle")) {
    toggleTheme();
    return;
  }

  const aimode = e.target.closest("[data-aimode]");
  if (aimode) {
    ui.aiMode = aimode.dataset.aimode;
    renderAi();
    return;
  }

  const taste = e.target.closest("[data-taste]");
  if (taste) {
    const tag = taste.dataset.taste; ui.selectedTastes = !tag ? [] : (ui.selectedTastes || []).includes(tag) ? ui.selectedTastes.filter(x => x !== tag) : [...(ui.selectedTastes || []), tag]; ui.taste = "";
    renderHome(location.hash === "#menu");
    return;
  }
  const dayPill = e.target.closest("[data-day]");
  if (dayPill) {
    ui.day = dayPill.dataset.day === todayKey() ? "" : dayPill.dataset.day;
    renderHome(location.hash === "#menu");
    return;
  }
  const meal = e.target.closest("[data-meal]");
  if (meal) {
    ui.meal = meal.dataset.meal;
    route();
    return;
  }
  const sample = e.target.closest("[data-sample]");
  if (sample) {
    ui.aiText = sample.dataset.sample;
    const box = $("#aiText");
    if (box) box.value = ui.aiText;
    return;
  }
  const pref = e.target.closest("[data-pref]");
  if (pref) {
    const name = pref.dataset.pref;
    prefs.tastes = prefs.tastes.includes(name) ? prefs.tastes.filter((t) => t !== name) : prefs.tastes.concat(name);
    save(LS.prefs, prefs);
    pref.classList.toggle("on", prefs.tastes.includes(name));
    return;
  }
  const ex = e.target.closest("[data-ex]");
  if (ex) {
    const name = ex.dataset.ex;
    if (prefs.excluded.includes(name)) prefs.excluded = prefs.excluded.filter((t) => t !== name);
    else if (prefs.excluded.length >= 5) { toast("忌口最多 5 项"); return; }
    else prefs.excluded = prefs.excluded.concat(name);
    save(LS.prefs, prefs);
   ex.classList.toggle("on", prefs.excluded.includes(name));
    return;
  }
  const del = e.target.closest("[data-del]");
  if (del) {
    logs = logs.filter((item) => String(item.uid) !== del.dataset.del);
    save(LS.logs, logs);
    renderStats();
    return;
  }
  const add = e.target.closest("[data-add]");
  if (add) {
    const d = dishById(Number(add.dataset.add));
    if (d) addDishLog(d, 1);
    return;
  }
  if (e.target.id === "doSearch") {
    ui.kw = $("#kw").value;
    renderHome(location.hash === "#menu");
  }
  if (e.target.id === "minus") {
    ui.factor = Math.max(0.5, Math.round((ui.factor - 0.5) * 10) / 10);
    const id = Number((location.hash || "").split("/")[1]);
    const keep = ui.factor;
    renderDetail(id);
    ui.factor = keep;
  }
  if (e.target.id === "plus") {
    ui.factor = Math.min(2, Math.round((ui.factor + 0.5) * 10) / 10);
    const id = Number((location.hash || "").split("/")[1]);
    const keep = ui.factor;
    renderDetail(id);
    ui.factor = keep;
  }
  if (e.target.id === "addLog") {
    const id = Number((location.hash || "").split("/")[1]);
    const d = dishById(id);
    if (d) addDishLog(d, ui.factor);
  }
  if (e.target.id === "parseAi") {
    ui.aiText = $("#aiText").value.trim();
    ui.aiHits = DISHES.filter((d) => ui.aiText.includes(d.name));
    renderAi();
  }
  if (e.target.id === "saveGoal") {
    const n = Number($("#goal").value);
    const b = $("#budget").value.trim();
    if (!n || n < 800 || n > 4000) { toast("目标请填 800 到 4000"); return; }
    if (b && (Number(b) <= 0 || Number(b) > 999)) { toast("预算请填 1 到 999，或留空"); return; }
    goal = Math.round(n);
    prefs.budget = b;
    save(LS.goal, goal);
    save(LS.prefs, prefs);
    toast("已保存");
  }
  if (e.target.id === "clearToday") {
    const key = todayKey();
    logs = logs.filter((item) => item.day !== key);
    save(LS.logs, logs);
    renderStats();
    toast("已清空今日记录");
  }
  if (e.target.id === "themeFromSettings") toggleTheme();
});

document.body.addEventListener("input", (e) => {
  if (e.target.id === "feedbackText") {
    ui.feedbackDrafts[e.target.dataset.dishId] = e.target.value;
    const count = PersonalRecords.textLength(e.target.value);
    $("#feedbackCount").textContent = count + " / 200" + (count > 200 ? " · 超出限制，不能保存" : "");
    e.target.setAttribute("aria-invalid", String(count > 200));
  }
});
window.addEventListener("storage", (e) => {
  if (e.key === PersonalApi.storageKey || e.key === null) { snapshotInputs(); route(); }
});
window.addEventListener("hashchange", () => {
  route();
  window.scrollTo(0, 0);
});

applyTheme(load(LS.theme, "warm"));
if (!location.hash) location.hash = "#home";
else route();

