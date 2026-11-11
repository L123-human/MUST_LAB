/* 食堂好味道：校园食堂菜品推荐 + 卡路里计算（纯前端，可直接打开） */

// 摊位图片沿用项目 assets
const STALLS = [
  { name: "川湘小炒", img: "assets/chuan.jpg" },
  { name: "粤味烧腊", img: "assets/shaola.jpg" },
  { name: "面食工坊", img: "assets/mian.jpg" },
  { name: "轻食沙拉", img: "assets/qingshi.jpg" },
  { name: "现煮汤粉", img: "assets/tangfen.jpg" }
];

/* 热量与宏量为常见份量估算，仅用于界面演示 */
const DISHES = [
  { id: 1, name: "农家小炒肉", stall: 0, price: 18, portion: "中份", tastes: ["微辣", "下饭"], ingredients: ["猪肉", "辣椒", "蒜"], kcal: 420, protein: 28, fat: 26, carb: 14, available: true, verified: true, verifiedAt: "2026-10-12" },
  { id: 2, name: "麻婆豆腐", stall: 0, price: 12, portion: "中份", tastes: ["中辣", "下饭"], ingredients: ["豆腐", "辣椒", "花椒"], kcal: 280, protein: 16, fat: 16, carb: 12, available: true, verified: true, verifiedAt: "2026-10-12" },
  { id: 3, name: "醋溜土豆丝", stall: 0, price: 9, portion: "小份", tastes: ["清淡", "素食", "少油"], ingredients: ["土豆", "醋", "辣椒"], kcal: 160, protein: 3, fat: 4, carb: 28, available: false, verified: true, verifiedAt: "2026-09-28" },
  { id: 4, name: "烧鸭饭", stall: 1, price: 20, portion: "中份", tastes: ["下饭", "高蛋白"], ingredients: ["鸭肉", "青菜", "米饭"], kcal: 680, protein: 32, fat: 22, carb: 82, available: true, verified: true, verifiedAt: "2026-10-18" },
  { id: 5, name: "白切鸡饭", stall: 1, price: 18, portion: "中份", tastes: ["清淡", "高蛋白"], ingredients: ["鸡肉", "姜", "米饭"], kcal: 560, protein: 34, fat: 12, carb: 74, available: true, verified: true, verifiedAt: "2026-10-18" },
  { id: 6, name: "叉烧饭", stall: 1, price: 19, portion: "中份", tastes: ["甜口", "下饭"], ingredients: ["猪肉", "青菜", "米饭"], kcal: 720, protein: 30, fat: 24, carb: 88, available: true, verified: true, verifiedAt: "2026-10-18" },
  { id: 7, name: "红烧牛肉面", stall: 2, price: 20, portion: "大份", tastes: ["微辣", "汤水"], ingredients: ["牛肉", "面条", "青菜"], kcal: 640, protein: 32, fat: 18, carb: 78, available: true, verified: true, verifiedAt: "2026-10-20" },
  { id: 8, name: "番茄鸡蛋面", stall: 2, price: 13, portion: "中份", tastes: ["清淡", "汤水"], ingredients: ["番茄", "鸡蛋", "面条"], kcal: 430, protein: 18, fat: 10, carb: 64, available: true, verified: true, verifiedAt: "2026-10-20" },
  { id: 9, name: "葱油拌面", stall: 2, price: 12, portion: "中份", tastes: ["清淡", "少油"], ingredients: ["面条", "葱", "酱油"], kcal: 480, protein: 14, fat: 12, carb: 76, available: true, verified: false, verifiedAt: null },
  { id: 10, name: "牛油果鸡胸沙拉", stall: 3, price: 26, portion: "一份", tastes: ["清淡", "高蛋白", "少油"], ingredients: ["鸡胸肉", "牛油果", "生菜"], kcal: 390, protein: 32, fat: 18, carb: 16, available: true, verified: true, verifiedAt: "2026-10-22" },
  { id: 11, name: "藜麦蔬菜碗", stall: 3, price: 22, portion: "一份", tastes: ["清淡", "素食", "少油"], ingredients: ["藜麦", "生菜", "玉米"], kcal: 340, protein: 12, fat: 8, carb: 48, available: true, verified: false, verifiedAt: null },
  { id: 12, name: "番茄牛肉汤粉", stall: 4, price: 18, portion: "大份", tastes: ["中辣", "汤水"], ingredients: ["牛肉", "番茄", "米粉"], kcal: 520, protein: 26, fat: 12, carb: 70, available: true, verified: true, verifiedAt: "2026-10-15" },
  { id: 13, name: "清汤牛腩粉", stall: 4, price: 20, portion: "大份", tastes: ["清淡", "汤水", "高蛋白"], ingredients: ["牛肉", "米粉", "萝卜"], kcal: 490, protein: 28, fat: 10, carb: 66, available: true, verified: true, verifiedAt: "2026-10-15" },
  { id: 14, name: "鱼香肉丝", stall: 0, price: 16, portion: "中份", tastes: ["微辣", "下饭"], ingredients: ["猪肉", "木耳", "胡萝卜"], kcal: 380, protein: 24, fat: 20, carb: 18, available: true, verified: true, verifiedAt: "2026-10-12" },
  { id: 15, name: "宫保鸡丁", stall: 0, price: 17, portion: "中份", tastes: ["微辣", "下饭"], ingredients: ["鸡肉", "花生", "辣椒"], kcal: 410, protein: 30, fat: 22, carb: 16, available: true, verified: true, verifiedAt: "2026-10-12" },
  { id: 16, name: "烧鹅饭", stall: 1, price: 22, portion: "中份", tastes: ["下饭", "高蛋白"], ingredients: ["鹅肉", "青菜", "米饭"], kcal: 710, protein: 34, fat: 24, carb: 84, available: false, verified: true, verifiedAt: "2026-10-18" },
  { id: 17, name: "阳春面", stall: 2, price: 10, portion: "中份", tastes: ["清淡", "汤水"], ingredients: ["面条", "葱", "高汤"], kcal: 360, protein: 12, fat: 6, carb: 62, available: true, verified: true, verifiedAt: "2026-10-20" },
  { id: 18, name: "凯撒沙拉", stall: 3, price: 24, portion: "一份", tastes: ["清淡", "高蛋白", "少油"], ingredients: ["生菜", "鸡胸肉", "奶酪"], kcal: 320, protein: 26, fat: 14, carb: 12, available: true, verified: true, verifiedAt: "2026-10-22" },
  { id: 19, name: "酸辣汤粉", stall: 4, price: 15, portion: "大份", tastes: ["微辣", "汤水"], ingredients: ["米粉", "豆腐", "辣椒"], kcal: 440, protein: 14, fat: 8, carb: 72, available: true, verified: true, verifiedAt: "2026-10-15" },
  { id: 20, name: "干煸四季豆", stall: 0, price: 11, portion: "小份", tastes: ["微辣", "素食"], ingredients: ["四季豆", "猪肉", "蒜"], kcal: 220, protein: 8, fat: 14, carb: 16, available: true, verified: true, verifiedAt: "2026-10-12" }
];

const TASTES = ["清淡", "微辣", "高蛋白", "少油", "素食", "汤水", "下饭"];
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
  logs: "canteen_logs",
  dishes: "canteen_dishes",
  reports: "canteen_reports",
  role: "canteen_role"
};

const REPORT_STATUS_LABEL = {
  pending: "Pending",
  corrected: "Corrected",
  nochange: "No change required"
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
let prefs = load(LS.prefs, { tastes: ["清淡", "高蛋白"], excluded: [], budget: "" });
let logs = load(LS.logs, []);
let role = load(LS.role, { type: "user", stall: 0 });
let reports = load(LS.reports, []);
let dishes = loadDishes();
let ui = {
  kw: "", taste: "", stall: "", priceMin: "", priceMax: "",
  meal: "lunch", factor: 1, aiText: "", aiHits: null, aiMode: "food",
  adminTab: "menu", reportDesc: "", formTastes: [],
  adminFilterStall: "", adminOnlyOff: false, forceRolePick: false
};
let menuFilterInited = false;
let adminFormDraft = null;

function cloneDish(d) {
  return Object.assign({}, d, {
    tastes: (d.tastes || []).slice(),
    ingredients: (d.ingredients || []).slice()
  });
}

function loadDishes() {
  const saved = load(LS.dishes, null);
  if (Array.isArray(saved) && saved.length) {
    return saved.map(cloneDish);
  }
  return DISHES.map((d) => cloneDish(Object.assign({ updatedAt: null, img: "" }, d)));
}

/* 菜单写操作统一入口，方便以后换后端 */
function saveDishes() {
  save(LS.dishes, dishes);
}

function persistReports() {
  save(LS.reports, reports);
}

function persistRole() {
  save(LS.role, role);
}

function roleLabel() {
  if (role.type === "admin") return "管理员";
  if (role.type === "stallOwner") {
    const s = STALLS[role.stall];
    return "商家 · " + (s ? s.name : "");
  }
  return "同学（已登录）";
}

function isStaff() {
  return role.type === "admin" || role.type === "stallOwner";
}

function needsAdminRolePick() {
  return ui.forceRolePick || !isStaff();
}

function isLoggedIn() {
  return role.type === "user" || role.type === "stallOwner" || role.type === "admin";
}

function canEditStall(stallIdx) {
  if (role.type === "admin") return true;
  if (role.type === "stallOwner") return Number(stallIdx) === Number(role.stall);
  return false;
}

function nextDishId() {
  return dishes.reduce((m, d) => Math.max(m, d.id), 0) + 1;
}

function nextReportId() {
  return reports.reduce((m, r) => Math.max(m, r.id), 0) + 1;
}

/* 菜品 updatedAt：YYYY-MM-DD HH:mm */
function nowStamp() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0") + " " +
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0");
}

function formatUpdatedAt(v) {
  if (!v) return "尚未修改";
  return String(v).replace("T", " ").slice(0, 16);
}

function ingredientsEqual(a, b) {
  const norm = (list) => (list || []).map((x) => String(x).trim()).filter(Boolean).join("\0");
  return norm(a) === norm(b);
}

function parseIngredientInput(raw) {
  return String(raw || "").split(/[,，、]/).map((s) => s.trim()).filter(Boolean);
}

function isValidPrice(raw) {
  const s = String(raw == null ? "" : raw).trim();
  if (!s) return false;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return false;
  const n = Number(s);
  return Number.isFinite(n) && n > 0;
}

function formatPrice(n) {
  return Number(n).toFixed(2);
}

function initMenuFiltersOnce() {
  if (menuFilterInited) return;
  ui.priceMax = prefs.budget !== "" && prefs.budget != null ? String(prefs.budget) : "";
  menuFilterInited = true;
}

function todayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
function todayLogs() {
  const key = todayKey();
  return logs.filter((item) => item.day === key);
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
  return dishes.find((d) => d.id === Number(id));
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

/* ---------- 菜单筛选（REQ-1.2） ---------- */
function parsePriceRange() {
  const minRaw = String(ui.priceMin == null ? "" : ui.priceMin).trim();
  const maxRaw = String(ui.priceMax == null ? "" : ui.priceMax).trim();
  if (!minRaw && !maxRaw) return { ok: true, min: null, max: null };
  const min = minRaw === "" ? null : Number(minRaw);
  const max = maxRaw === "" ? null : Number(maxRaw);
  if (minRaw !== "" && (!Number.isFinite(min) || min < 0)) return { ok: false };
  if (maxRaw !== "" && (!Number.isFinite(max) || max < 0)) return { ok: false };
  if (min != null && max != null && min > max) return { ok: false };
  return { ok: true, min, max };
}

function clearMenuFilters() {
  ui.kw = "";
  ui.taste = "";
  ui.stall = "";
  ui.priceMin = "";
  ui.priceMax = prefs.budget !== "" && prefs.budget != null ? String(prefs.budget) : "";
}

/* 纯排序：available 优先 → 摊位名升序 → id 升序；不依赖 DOM / ui */
function sortDishes(list) {
  return list.slice().sort((a, b) => {
    const av = a.available === false ? 1 : 0;
    const bv = b.available === false ? 1 : 0;
    if (av !== bv) return av - bv;
    const na = STALLS[a.stall].name;
    const nb = STALLS[b.stall].name;
    return na.localeCompare(nb, "zh") || a.id - b.id;
  });
}

function visibleDishes() {
  const kw = ui.kw.trim();
  const price = parsePriceRange();
  // 价格区间无效时不改动列表：调用方应拦截；此处跳过价格条件以免误清空
  const filtered = dishes.filter((d) => {
    if (kw && !d.name.includes(kw) && !STALLS[d.stall].name.includes(kw)) return false;
    if (ui.taste && !d.tastes.includes(ui.taste)) return false;
    if (ui.stall !== "" && String(d.stall) !== String(ui.stall)) return false;
    if (price.ok) {
      if (price.min != null && d.price < price.min) return false;
      if (price.max != null && d.price > price.max) return false;
    }
    if (prefs.budget && d.price > Number(prefs.budget)) return false;
    if (prefs.excluded.some((ing) => d.ingredients.includes(ing))) return false;
    return true;
  });
  return sortDishes(filtered);
}
function matchReason(d) {
  const hit = d.tastes.filter((t) => prefs.tastes.includes(t));
  if (!hit.length) return "";
  return "口味相符：" + hit.join("、");
}

function dishImgSrc(d) {
  if (d.img) return d.img;
  const stall = STALLS[d.stall];
  return stall && stall.img ? stall.img : "";
}

function dishMedia(d, kind) {
  const src = dishImgSrc(d);
  const cls = kind === "hero" ? "detail-hero-media" : "dish-thumb";
  if (!src) {
    return '<div class="img-ph ' + cls + '" role="img" aria-label="' + esc(d.name) + '"></div>';
  }
  return '<img class="' + cls + '" src="' + esc(src) + '" alt="' + esc(d.name) +
    '" onerror="this.onerror=null;this.outerHTML=\'<div class=&quot;img-ph ' + cls +
    '&quot; role=&quot;img&quot; aria-label=&quot;' + esc(d.name) + '&quot;></div>\'">';
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
function renderHome() {
  setTab("home");
  showTop(true);
  initMenuFiltersOnce();
  const list = todayLogs();
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
  const dishes = visibleDishes();
  const week = weekSeries();
  const pilotNames = STALLS.slice(0, 3).map((s) => s.name).join(" / ");

  view.innerHTML =
    '<p class="pilot-note">试运营范围：' + esc(pilotNames) + "</p>" +
    '<div class="week" role="list" aria-label="本周日期">' +
      week.map((d) =>
        '<button class="day-pill' + (d.today ? " on" : "") + '" type="button" disabled>' +
          '<span>' + d.label + '</span><span class="num">' + d.num + "</span></button>"
      ).join("") +
    "</div>" +
    '<a class="cal-card" href="#stats">' +
      '<div><div class="label">今日热量</div>' +
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
    '<div class="chips" role="list" aria-label="口味筛选">' +
      '<button class="chip' + (ui.taste === "" ? " on" : "") + '" data-taste="" type="button">全部</button>' +
      TASTES.map((t) => '<button class="chip' + (ui.taste === t ? " on" : "") + '" data-taste="' + esc(t) + '" type="button">' + esc(t) + "</button>").join("") +
    "</div>" +
    '<div class="chips" role="list" aria-label="摊位筛选">' +
      '<button class="chip' + (ui.stall === "" ? " on" : "") + '" data-stall="" type="button">全部摊位</button>' +
      STALLS.map((s, i) =>
        '<button class="chip' + (String(ui.stall) === String(i) ? " on" : "") + '" data-stall="' + i + '" type="button">' + esc(s.name) + "</button>"
      ).join("") +
    "</div>" +
    '<div class="price-range">' +
      '<span class="price-range-label">价格</span>' +
      '<input id="priceMin" type="number" min="0" step="0.01" inputmode="decimal" placeholder="最低" value="' + esc(ui.priceMin) + '" aria-label="最低价格">' +
      '<span class="price-range-sep">–</span>' +
      '<input id="priceMax" type="number" min="0" step="0.01" inputmode="decimal" placeholder="最高" value="' + esc(ui.priceMax) + '" aria-label="最高价格">' +
      '<button class="btn btn-soft" id="doPriceFilter" type="button">筛选</button>' +
    "</div>" +
    '<div class="section-head"><h2>菜单浏览</h2><a href="#settings">调整偏好</a></div>' +
    '<div class="list">' +
      (dishes.length ? dishes.map(dishCard).join("") :
        '<div class="empty"><strong>没有符合条件的菜品，试试放宽筛选条件</strong>' +
          '<button class="btn btn-ghost" id="clearFilters" type="button" style="margin-top:14px">清空筛选</button></div>') +
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
  const reason = matchReason(d);
  const badges =
    (!d.available ? '<span class="badge badge-off">暂不可售</span>' : "") +
    (!d.verified ? '<span class="badge badge-unverified">配料未核验</span>' : "");
  return '<a class="card dish' + (d.available ? "" : " is-unavailable") + '" href="#dish/' + d.id + '">' +
    '<div class="dish-media">' +
      (badges ? '<div class="dish-badges">' + badges + "</div>" : "") +
      dishMedia(d, "thumb") +
    "</div>" +
    '<div class="dish-body">' +
      '<div class="dish-name"><span>' + esc(d.name) + '</span><span class="price">¥' + formatPrice(d.price) + "</span></div>" +
      '<div class="meta">' + esc(STALLS[d.stall].name) + " · " + esc(d.portion) + "</div>" +
      '<div class="kcal-row"><span class="kcal-badge">+' + d.kcal + " kcal</span>" +
        '<span class="macro-dots">' +
          '<span class="dp">P' + d.protein + "</span>" +
          '<span class="dc">C' + d.carb + "</span>" +
          '<span class="df">F' + d.fat + "</span>" +
        "</span></div>" +
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

  const verifyText = d.verifiedAt ? d.verifiedAt : "未核验";
  const availText = d.available ? "在售" : "暂不可售";

  view.innerHTML =
    '<div class="detail-page">' +
      '<div class="detail-hero">' +
        dishMedia(d, "hero") +
        '<div class="veil"></div>' +
        '<a class="back-fab" href="#home" aria-label="返回首页">←</a>' +
      "</div>" +
      '<div class="detail-sheet">' +
        '<h1 class="detail-title">' + esc(d.name) + "</h1>" +
        '<p class="detail-sub">' + esc(STALLS[d.stall].name) + " · " + esc(d.portion) + " · ¥" + formatPrice(d.price) + "</p>" +
        '<div class="tags" style="margin-bottom:14px">' + d.tastes.map((t) => '<span class="tag">' + esc(t) + "</span>").join("") + "</div>" +
        '<div class="panel detail-info">' +
          '<div class="meta">配料：' + esc(d.ingredients.join("、")) + "</div>" +
          '<div class="meta">是否可用：' + esc(availText) + "</div>" +
          '<div class="meta">核验日期：' + esc(verifyText) + "</div>" +
        "</div>" +
        '<div class="nutri-card">' +
          '<div class="ring-light" style="--p:' + ringPct + '"><div class="inner"><b>' + kcal + "</b><small>kcal</small></div></div>" +
          '<div class="nutri-side">' +
            '<div class="unit">当前份量估算</div><div class="big">' + portionLabel(factor) + "</div>" +
            barRow("蛋白质", protein, maxP) +
            barRow("碳水", carb, maxC) +
            barRow("脂肪", fat, maxF) +
          "</div>" +
        "</div>" +
        '<div class="panel"><div class="reason">热量按常见份量估算，未做实验室检测。</div></div>' +
        '<div class="stepper">' +
          '<button type="button" id="minus" aria-label="减少份量">−</button>' +
          '<div class="grow">' + portionLabel(factor) + "</div>" +
          '<button type="button" id="plus" aria-label="增加份量">+</button>' +
        "</div>" +
        '<div class="meal-pick">' + MEALS.map((m) =>
          '<button class="chip' + (ui.meal === m.id ? " on" : "") + '" data-meal="' + m.id + '" type="button">' + m.name + "</button>"
        ).join("") + "</div>" +
        '<button class="btn btn-block" id="addLog" type="button">记入今日' + mealName(ui.meal) + "</button>" +
        '<div class="panel report-box">' +
          '<strong>报告菜单错误</strong>' +
          '<p class="meta" style="margin:6px 0 10px">当前菜品：' + esc(d.name) + " · " + esc(STALLS[d.stall].name) + "</p>" +
          (isLoggedIn()
            ? '<div class="field"><label for="reportDesc">错误描述</label>' +
              '<textarea id="reportDesc" rows="3" placeholder="例如：价格已涨到 22 元 / 配料少了花生">' + esc(ui.reportDesc) + "</textarea></div>" +
              '<button class="btn btn-ghost btn-block" id="submitReport" type="button">提交错误报告</button>'
            : '<p class="meta">请先在设置页模拟登录后再上报。</p>') +
        "</div>" +
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
    '<h1 class="h1">设置</h1><p class="desc">偏好会改变首页排序，忌口和预算会过滤菜品。</p>' +
    '<div class="setting-block"><strong>菜单管理</strong>' +
      '<p class="desc" style="margin-bottom:10px">维护菜品上下架与核验。当前角色：' + esc(roleLabel()) + "</p>" +
      '<a class="btn btn-block" href="#admin">进入菜单管理</a>' +
    "</div>" +
    '<div class="setting-block"><div class="field"><label for="goal">每日热量目标（kcal）</label>' +
      '<input id="goal" type="number" min="800" max="4000" value="' + esc(goal) + '"></div>' +
      '<div class="field"><label for="budget">单份预算上限（元，可空）</label>' +
      '<input id="budget" type="number" min="1" max="999" placeholder="不限制" value="' + esc(prefs.budget) + '"></div>' +
      '<button class="btn btn-block" id="saveGoal" type="button">保存目标与预算</button></div>' +
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

/* ---------- REQ-1.5 菜单管理（维护） ---------- */
function renderAdminGate() {
  setTab("settings");
  showTop(true);
  view.innerHTML =
    '<h1 class="h1">菜单管理</h1>' +
    '<p class="desc">请选择角色后继续（纯前端模拟，不做真登录）。</p>' +
    '<div class="setting-block role-pick">' +
      '<strong>选择角色</strong>' +
      '<p class="desc" style="margin-bottom:10px">商家需指定所属摊位；管理员可管理全部摊位。</p>' +
      '<button class="btn btn-block" type="button" data-role="admin">管理员</button>' +
      '<p class="meta" style="margin:14px 0 8px">商家 · 选择所属摊位</p>' +
      '<div class="chips">' +
        STALLS.map((s, i) =>
          '<button class="chip" type="button" data-role="stallOwner" data-rolestall="' + i + '">' + esc(s.name) + "</button>"
        ).join("") +
      "</div>" +
      '<a class="btn btn-ghost btn-block" href="#settings" style="margin-top:12px">返回设置</a>' +
    "</div>";
}

function adminNav(active) {
  return '<div class="admin-tabs">' +
    '<a class="chip' + (active === "menu" ? " on" : "") + '" href="#admin">菜品维护</a>' +
    '<a class="chip' + (active === "reports" ? " on" : "") + '" href="#admin/reports">错误报告</a>' +
  "</div>";
}

function adminListFilter(list) {
  return list.filter((d) => {
    if (ui.adminFilterStall !== "" && String(d.stall) !== String(ui.adminFilterStall)) return false;
    if (ui.adminOnlyOff && d.available !== false) return false;
    return true;
  });
}

function renderAdminList() {
  if (needsAdminRolePick()) return renderAdminGate();
  setTab("settings");
  showTop(true);
  ui.adminTab = "menu";
  const list = adminListFilter(sortDishes(dishes.slice()));
  view.innerHTML =
    '<h1 class="h1">菜单管理</h1>' +
    '<p class="desc">' + esc(roleLabel()) + '</p>' +
    adminNav("menu") +
    '<div class="admin-toolbar">' +
      '<button class="btn" id="adminNew" type="button">新增菜品</button>' +
      '<button class="btn btn-ghost" id="switchRole" type="button">切换角色</button>' +
      '<a class="btn btn-ghost" href="#settings">返回设置</a>' +
    "</div>" +
    '<div class="chips" role="list" aria-label="摊位筛选">' +
      '<button class="chip' + (ui.adminFilterStall === "" ? " on" : "") + '" type="button" data-admin-stall="">全部摊位</button>' +
      STALLS.map((s, i) =>
        '<button class="chip' + (String(ui.adminFilterStall) === String(i) ? " on" : "") +
          '" type="button" data-admin-stall="' + i + '">' + esc(s.name) + "</button>"
      ).join("") +
    "</div>" +
    '<div class="chips" style="padding-top:0">' +
      '<button class="chip' + (ui.adminOnlyOff ? " on" : "") + '" type="button" id="toggleOnlyOff">' +
        (ui.adminOnlyOff ? "仅看下架 · 开" : "仅看下架") +
      "</button>" +
    "</div>" +
    '<div class="admin-list">' +
      (list.length ? list.map((d) => {
        const stallName = STALLS[d.stall] ? STALLS[d.stall].name : "?";
        const can = canEditStall(d.stall);
        return '<div class="admin-row' + (d.available ? "" : " is-off") + '">' +
          '<div class="admin-row-main">' +
            '<div class="dish-name"><span>' + esc(d.name) + '</span><span class="price">¥' + formatPrice(d.price) + "</span></div>" +
            '<div class="meta">' + esc(stallName) + "</div>" +
            '<div class="meta">在售：' + (d.available ? "是" : "否") +
              " · 核验：" + (d.verified ? ("是（" + esc(d.verifiedAt || "—") + "）") : "否") +
            "</div>" +
            '<div class="meta">最后修改：' + esc(formatUpdatedAt(d.updatedAt)) + "</div>" +
          "</div>" +
          '<div class="admin-row-actions">' +
            '<button class="btn btn-soft" type="button" data-admin-edit="' + d.id + '"' + (can ? "" : " disabled") + ">编辑</button>" +
            '<button class="btn btn-ghost" type="button" data-toggle-avail="' + d.id + '"' + (can ? "" : " disabled") + ">" +
              (d.available ? "下架" : "上架") + "</button>" +
            '<button class="btn btn-ghost" type="button" data-toggle-verify="' + d.id + '"' + (can ? "" : " disabled") + ">" +
              (d.verified ? "取消核验" : "核验") + "</button>" +
          "</div>" +
        "</div>";
      }).join("") : '<div class="empty"><strong>没有符合条件的菜品</strong>试试调整筛选。</div>') +
    "</div>";
}

function emptyDishDraft(stallIdx) {
  return {
    id: null,
    name: "",
    stall: stallIdx,
    price: "",
    portion: "中份",
    img: "",
    tastes: [],
    ingredients: [],
    available: true,
    verified: false,
    verifiedAt: null,
    kcal: 400,
    protein: 20,
    fat: 12,
    carb: 40
  };
}

function renderAdminForm(editId) {
  if (needsAdminRolePick()) return renderAdminGate();
  setTab("settings");
  showTop(true);
  const isNew = editId == null || editId === "new";
  let draft = adminFormDraft;
  if (!draft) {
    if (isNew) {
      const stall = role.type === "stallOwner" ? Number(role.stall) : 0;
      draft = emptyDishDraft(stall);
    } else {
      const found = dishById(editId);
      if (!found) {
        toast("菜品不存在，可能已被删除");
        location.hash = "#admin";
        return;
      }
      if (!canEditStall(found.stall)) {
        toast("无权操作该摊位");
        location.hash = "#admin";
        return;
      }
      draft = cloneDish(found);
    }
    adminFormDraft = draft;
  }
  ui.formTastes = (draft.tastes || []).slice();
  const stallDisabled = role.type === "stallOwner";

  view.innerHTML =
    '<h1 class="h1">' + (isNew ? "新增菜品" : "编辑菜品") + "</h1>" +
    '<p class="desc">' + esc(roleLabel()) + "</p>" +
    '<div class="panel admin-form">' +
      '<div class="field"><label for="fName">菜名 *</label>' +
        '<input id="fName" value="' + esc(draft.name) + '" placeholder="例如：农家小炒肉"></div>' +
      '<div class="field"><label for="fStall">摊位 *</label>' +
        '<select id="fStall"' + (stallDisabled ? " disabled" : "") + ">" +
          STALLS.map((s, i) =>
            '<option value="' + i + '"' + (Number(draft.stall) === i ? " selected" : "") + ">" + esc(s.name) + "</option>"
          ).join("") +
        "</select></div>" +
      '<div class="field"><label for="fPrice">价格 *</label>' +
        '<input id="fPrice" type="number" min="0.01" step="0.01" inputmode="decimal" value="' +
          esc(draft.price === "" || draft.price == null ? "" : draft.price) + '" placeholder="例如：18.00"></div>' +
      '<div class="field"><label for="fPortion">份量</label>' +
        '<input id="fPortion" value="' + esc(draft.portion || "") + '" placeholder="中份"></div>' +
      '<div class="field"><label>口味标签</label><div class="chips" id="formTastes">' +
        TASTES.map((t) =>
          '<button class="chip' + (ui.formTastes.includes(t) ? " on" : "") + '" type="button" data-form-taste="' + esc(t) + '">' + esc(t) + "</button>"
        ).join("") +
      "</div></div>" +
      '<div class="field"><label for="fIngredients">配料（逗号分隔）</label>' +
        '<input id="fIngredients" value="' + esc((draft.ingredients || []).join("，")) + '" placeholder="猪肉，辣椒，蒜"></div>' +
      '<div class="switch-row">' +
        '<label class="switch-lab"><input type="checkbox" id="fAvailable"' + (draft.available !== false ? " checked" : "") + "> 可用（在售）</label>" +
        '<label class="switch-lab"><input type="checkbox" id="fVerified"' + (draft.verified ? " checked" : "") + "> 已核验</label>" +
      "</div>" +
      '<button class="btn btn-block" id="saveDish" type="button">保存</button>' +
      '<button class="btn btn-ghost btn-block" id="cancelDish" type="button" style="margin-top:8px">取消</button>' +
    "</div>";
}

function readAdminForm() {
  const stallEl = $("#fStall");
  const stall = role.type === "stallOwner"
    ? Number(role.stall)
    : (stallEl ? Number(stallEl.value) : NaN);
  return {
    name: ($("#fName") && $("#fName").value || "").trim(),
    stall: stall,
    priceRaw: ($("#fPrice") && $("#fPrice").value || "").trim(),
    portion: ($("#fPortion") && $("#fPortion").value || "").trim() || "中份",
    tastes: ui.formTastes.slice(),
    ingredients: parseIngredientInput($("#fIngredients") && $("#fIngredients").value),
    available: !!($("#fAvailable") && $("#fAvailable").checked),
    verified: !!($("#fVerified") && $("#fVerified").checked)
  };
}

function saveAdminDish(editId) {
  const isNew = editId == null || editId === "new";
  const form = readAdminForm();
  if (!form.name || form.priceRaw === "" || form.stall === "" || form.stall == null || Number.isNaN(Number(form.stall))) {
    toast("请填写菜名、摊位和价格");
    return false;
  }
  if (!isValidPrice(form.priceRaw)) {
    toast("价格无效，请填写大于 0 且最多两位小数的金额");
    return false;
  }
  if (!canEditStall(form.stall)) {
    toast("无权操作该摊位");
    return false;
  }
  const price = Number(form.priceRaw);
  const dup = dishes.some((d) =>
    Number(d.stall) === Number(form.stall) &&
    d.name === form.name &&
    (isNew || d.id !== Number(editId))
  );
  if (dup) {
    toast("该摊位已存在同名菜品");
    return false;
  }

  const stamp = nowStamp();
  let unverifiedByIngredients = false;
  if (isNew) {
    const item = {
      id: nextDishId(),
      name: form.name,
      stall: Number(form.stall),
      price: price,
      portion: form.portion,
      img: "",
      tastes: form.tastes,
      ingredients: form.ingredients,
      available: form.available,
      verified: form.verified,
      verifiedAt: form.verified ? todayKey() : null,
      updatedAt: stamp,
      kcal: 400,
      protein: 20,
      fat: 12,
      carb: 40
    };
    dishes.push(item);
  } else {
    const idx = dishes.findIndex((d) => d.id === Number(editId));
    if (idx < 0) {
      toast("菜品不存在，可能已被删除");
      return false;
    }
    const prev = dishes[idx];
    if (!canEditStall(prev.stall) || !canEditStall(form.stall)) {
      toast("无权操作该摊位");
      return false;
    }
    const ingredientsChanged = !ingredientsEqual(prev.ingredients, form.ingredients);
    let verified = prev.verified;
    let verifiedAt = prev.verifiedAt || null;

    // 普通字段变更不改核验；主动开关才改；已核验后改配料则作废核验
    if (ingredientsChanged && prev.verified) {
      verified = false;
      verifiedAt = null;
      unverifiedByIngredients = true;
    } else if (form.verified && !prev.verified) {
      verified = true;
      verifiedAt = todayKey();
    } else if (!form.verified && prev.verified) {
      verified = false;
      verifiedAt = null;
    }

    dishes[idx] = Object.assign(cloneDish(prev), {
      name: form.name,
      stall: Number(form.stall),
      price: price,
      portion: form.portion,
      tastes: form.tastes,
      ingredients: form.ingredients,
      available: form.available,
      verified: verified,
      verifiedAt: verifiedAt,
      updatedAt: stamp
    });
  }

  saveDishes();
  adminFormDraft = null;
  if (unverifiedByIngredients) {
    toast("配料已变更，需重新核验后方可进入推荐");
    setTimeout(() => toast("已保存，菜单将使用最新数据"), 1900);
  } else {
    toast("已保存，菜单将使用最新数据");
  }
  location.hash = "#admin";
  return true;
}

function toggleDishAvailable(id) {
  const idx = dishes.findIndex((d) => d.id === Number(id));
  if (idx < 0) {
    toast("菜品不存在，可能已被删除");
    return false;
  }
  const d = dishes[idx];
  if (!canEditStall(d.stall)) {
    toast("无权操作该摊位");
    return false;
  }
  const next = d.available === false;
  dishes[idx] = Object.assign(cloneDish(d), {
    available: next,
    updatedAt: nowStamp()
  });
  saveDishes();
  toast(next ? "已上架" : "已下架，该菜品不再进入推荐");
  renderAdminList();
  return true;
}

function toggleDishVerified(id) {
  const idx = dishes.findIndex((d) => d.id === Number(id));
  if (idx < 0) {
    toast("菜品不存在，可能已被删除");
    return false;
  }
  const d = dishes[idx];
  if (!canEditStall(d.stall)) {
    toast("无权操作该摊位");
    return false;
  }
  const turnOn = !d.verified;
  dishes[idx] = Object.assign(cloneDish(d), {
    verified: turnOn,
    verifiedAt: turnOn ? todayKey() : null,
    updatedAt: nowStamp()
  });
  saveDishes();
  toast("已保存，菜单将使用最新数据");
  renderAdminList();
  return true;
}

function renderAdminReports() {
  if (needsAdminRolePick()) return renderAdminGate();
  setTab("settings");
  showTop(true);
  ui.adminTab = "reports";
  const sorted = reports.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  view.innerHTML =
    '<h1 class="h1">错误报告</h1>' +
    '<p class="desc">' + esc(roleLabel()) + " · 上报不会直接改菜单</p>" +
    adminNav("reports") +
    (sorted.length ? sorted.map((r) => {
      const d = dishById(r.dishId);
      const name = d ? d.name : ("菜品#" + r.dishId);
      const stall = d && STALLS[d.stall] ? STALLS[d.stall].name : "";
      const status = REPORT_STATUS_LABEL[r.status] || r.status;
      const pending = r.status === "pending";
      return '<div class="panel report-card" data-report-id="' + r.id + '">' +
        '<div class="dish-name"><span>' + esc(name) + '</span><span class="status-pill status-' + esc(r.status) + '">' + esc(status) + "</span></div>" +
        '<div class="meta">' + esc(stall) + " · 上报于 " + esc(r.createdAt) + "</div>" +
        '<p class="report-desc">' + esc(r.description) + "</p>" +
        (r.explanation ? '<p class="meta">处理说明：' + esc(r.explanation) + "</p>" : "") +
        (pending && role.type === "admin"
          ? '<div class="field" style="margin-top:10px"><label for="exp-' + r.id + '">处理说明</label>' +
            '<textarea id="exp-' + r.id + '" rows="2" placeholder="说明处理结果">' + esc(r.explanation || "") + "</textarea></div>" +
            '<div class="admin-toolbar">' +
              '<button class="btn btn-soft" type="button" data-resolve="' + r.id + '" data-status="corrected">标记 Corrected</button>' +
              '<button class="btn btn-ghost" type="button" data-resolve="' + r.id + '" data-status="nochange">No change required</button>' +
            "</div>"
          : (pending && role.type === "stallOwner"
            ? '<p class="meta" style="margin-top:8px">仅管理员可处理报告状态。</p>'
            : (r.resolvedAt ? '<div class="meta">处理于 ' + esc(r.resolvedAt) + "</div>" : ""))) +
      "</div>";
    }).join("") : '<div class="empty"><strong>暂无错误报告</strong>用户可在菜品详情页提交。</div>');
}

function submitDishReport(dishId) {
  if (!isLoggedIn()) {
    toast("请先在设置页模拟登录");
    return false;
  }
  const desc = ($("#reportDesc") && $("#reportDesc").value || "").trim();
  ui.reportDesc = desc;
  if (!desc) {
    toast("请填写错误描述");
    return false;
  }
  if (!dishById(dishId)) {
    toast("找不到这道菜");
    return false;
  }
  reports.push({
    id: nextReportId(),
    dishId: Number(dishId),
    description: desc,
    status: "pending",
    explanation: "",
    createdAt: nowStamp(),
    resolvedAt: null
  });
  persistReports();
  ui.reportDesc = "";
  toast("已提交错误报告");
  renderDetail(dishId);
  return true;
}

function resolveReport(reportId, status) {
  if (role.type !== "admin") {
    toast("仅管理员可处理报告");
    return false;
  }
  const r = reports.find((item) => item.id === Number(reportId));
  if (!r || r.status !== "pending") {
    toast("报告不存在或已处理");
    return false;
  }
  const expEl = $("#exp-" + r.id);
  const explanation = (expEl && expEl.value || "").trim();
  if (status === "corrected") {
    const d = dishById(r.dishId);
    if (!d || !d.updatedAt || String(d.updatedAt) < String(r.createdAt)) {
      toast("请先更新菜品数据再标记已更正");
      return false;
    }
  }
  r.status = status;
  r.explanation = explanation;
  r.resolvedAt = nowStamp();
  persistReports();
  toast(status === "corrected" ? "已标记为 Corrected" : "已标记为 No change required");
  renderAdminReports();
  return true;
}

let currentDish = null;

function route() {
  const hash = (location.hash || "#home").slice(1);
  // 重新触发进入动画
  view.style.animation = "none";
  void view.offsetWidth;
  view.style.animation = "";

  if (hash.startsWith("dish/")) {
    const id = Number(hash.split("/")[1]);
    if (currentDish !== id) {
      ui.factor = 1;
      ui.reportDesc = "";
      currentDish = id;
    }
    renderDetail(id);
    return;
  }
  currentDish = null;

  if (hash === "admin" || hash === "admin/") {
    adminFormDraft = null;
    return renderAdminList();
  }
  if (hash === "admin/reports") {
    adminFormDraft = null;
    return renderAdminReports();
  }
  if (hash === "admin/new") {
    if (!adminFormDraft || adminFormDraft.id != null) {
      adminFormDraft = null;
    }
    return renderAdminForm("new");
  }
  if (hash.startsWith("admin/edit/")) {
    const id = Number(hash.split("/")[2]);
    if (!adminFormDraft || adminFormDraft.id !== id) {
      adminFormDraft = null;
    }
    return renderAdminForm(id);
  }

  adminFormDraft = null;
  if (hash === "stats") return renderStats();
  if (hash === "ai") return renderAi();
  if (hash === "settings") return renderSettings();
  renderHome();
}

function snapshotInputs() {
  const kw = $("#kw");
  if (kw) ui.kw = kw.value;
  const priceMin = $("#priceMin");
  if (priceMin) ui.priceMin = priceMin.value;
  const priceMax = $("#priceMax");
  if (priceMax) ui.priceMax = priceMax.value;
  const ai = $("#aiText");
  if (ai) ui.aiText = ai.value;
  const reportDesc = $("#reportDesc");
  if (reportDesc) ui.reportDesc = reportDesc.value;
}

function applyMenuFilter() {
  snapshotInputs();
  if (!parsePriceRange().ok) {
    toast("价格区间无效，请检查最小值和最大值");
    return false;
  }
  renderHome();
  return true;
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
document.body.addEventListener("click", (e) => {
  snapshotInputs();

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

  const roleBtn = e.target.closest("[data-role]");
  if (roleBtn) {
    const type = roleBtn.dataset.role;
    if (type === "admin") role = { type: "admin", stall: 0 };
    else if (type === "stallOwner") role = { type: "stallOwner", stall: Number(roleBtn.dataset.rolestall || 0) };
    else role = { type: "user", stall: 0 };
    ui.forceRolePick = false;
    persistRole();
    toast("已切换为" + roleLabel());
    if ((location.hash || "").slice(1).startsWith("admin")) {
      location.hash = "#admin";
      renderAdminList();
    } else {
      route();
    }
    return;
  }

  const formTaste = e.target.closest("[data-form-taste]");
  if (formTaste) {
    const t = formTaste.dataset.formTaste;
    if (ui.formTastes.includes(t)) ui.formTastes = ui.formTastes.filter((x) => x !== t);
    else ui.formTastes = ui.formTastes.concat(t);
    if (adminFormDraft) {
      const live = readAdminForm();
      adminFormDraft = Object.assign({}, adminFormDraft, live, {
        price: live.priceRaw,
        tastes: ui.formTastes.slice()
      });
    }
    const hash = (location.hash || "").slice(1);
    if (hash === "admin/new") renderAdminForm("new");
    else if (hash.startsWith("admin/edit/")) renderAdminForm(Number(hash.split("/")[2]));
    return;
  }

  const adminStall = e.target.closest("[data-admin-stall]");
  if (adminStall) {
    ui.adminFilterStall = adminStall.dataset.adminStall;
    renderAdminList();
    return;
  }

  const adminEdit = e.target.closest("[data-admin-edit]");
  if (adminEdit) {
    if (adminEdit.disabled) return;
    const id = Number(adminEdit.dataset.adminEdit);
    const d = dishById(id);
    if (!d) { toast("菜品不存在，可能已被删除"); return; }
    if (!canEditStall(d.stall)) { toast("无权操作该摊位"); return; }
    adminFormDraft = null;
    location.hash = "#admin/edit/" + id;
    return;
  }

  const toggleAvail = e.target.closest("[data-toggle-avail]");
  if (toggleAvail) {
    if (toggleAvail.disabled) return;
    toggleDishAvailable(toggleAvail.dataset.toggleAvail);
    return;
  }

  const toggleVerify = e.target.closest("[data-toggle-verify]");
  if (toggleVerify) {
    if (toggleVerify.disabled) return;
    toggleDishVerified(toggleVerify.dataset.toggleVerify);
    return;
  }

  const resolveBtn = e.target.closest("[data-resolve]");
  if (resolveBtn) {
    resolveReport(resolveBtn.dataset.resolve, resolveBtn.dataset.status);
    return;
  }

  const taste = e.target.closest("[data-taste]");
  if (taste) {
    snapshotInputs();
    if (!parsePriceRange().ok) {
      toast("价格区间无效，请检查最小值和最大值");
      return;
    }
    ui.taste = taste.dataset.taste;
    renderHome();
    return;
  }
  const stall = e.target.closest("[data-stall]");
  if (stall) {
    snapshotInputs();
    if (!parsePriceRange().ok) {
      toast("价格区间无效，请检查最小值和最大值");
      return;
    }
    ui.stall = stall.dataset.stall;
    renderHome();
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
    renderSettings();
    return;
  }
  const ex = e.target.closest("[data-ex]");
  if (ex) {
    const name = ex.dataset.ex;
    if (prefs.excluded.includes(name)) prefs.excluded = prefs.excluded.filter((t) => t !== name);
    else if (prefs.excluded.length >= 5) { toast("忌口最多 5 项"); return; }
    else prefs.excluded = prefs.excluded.concat(name);
    save(LS.prefs, prefs);
    renderSettings();
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
  if (e.target.id === "doSearch" || e.target.id === "doPriceFilter") {
    applyMenuFilter();
    return;
  }
  if (e.target.id === "clearFilters") {
    clearMenuFilters();
    renderHome();
    return;
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
    ui.aiHits = dishes.filter((d) => ui.aiText.includes(d.name));
    renderAi();
  }
  if (e.target.id === "switchRole") {
    ui.forceRolePick = true;
    adminFormDraft = null;
    renderAdminGate();
    return;
  }
  if (e.target.id === "toggleOnlyOff") {
    ui.adminOnlyOff = !ui.adminOnlyOff;
    renderAdminList();
    return;
  }
  if (e.target.id === "adminNew") {
    if (needsAdminRolePick()) { toast("请先选择商家或管理员角色"); return; }
    adminFormDraft = null;
    location.hash = "#admin/new";
    return;
  }
  if (e.target.id === "saveDish") {
    const hash = (location.hash || "").slice(1);
    if (hash === "admin/new") saveAdminDish("new");
    else if (hash.startsWith("admin/edit/")) saveAdminDish(Number(hash.split("/")[2]));
    return;
  }
  if (e.target.id === "cancelDish") {
    adminFormDraft = null;
    location.hash = "#admin";
    return;
  }
  if (e.target.id === "submitReport") {
    const id = Number((location.hash || "").split("/")[1]);
    submitDishReport(id);
    return;
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

window.addEventListener("hashchange", route);

applyTheme(load(LS.theme, "warm"));
if (!location.hash) location.hash = "#home";
else route();
