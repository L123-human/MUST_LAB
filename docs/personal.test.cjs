const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const P = require('./personal.js');
// 20/21 项边界测试数据。
const dishes = Array.from({ length: 21 }, (_, i) => ({ id: i + 1 }));
function change(s, a, id, v) { return P.change(s, a, id, v, dishes); }

test('favorites are distinct, capped at 20; removal frees a slot without deleting feedback', () => {
  let s = P.empty();
  for (let id = 1; id <= 20; id++) s = change(s, 'favorite', id).state;
  assert.equal(s.favorites.length, 20);
  assert.match(change(s, 'favorite', 1).error, /重复/);
  assert.match(change(s, 'favorite', 21).error, /20/);
  s = change(s, 'mark', 1, 'like').state;
  s = change(s, 'unfavorite', 1).state;
  assert.equal(s.feedback[1].mark, 'like');
  assert.equal(change(s, 'favorite', 21).state.favorites.length, 20);
});
test('invalid dish and action are rejected without mutation', () => {
  const s = P.empty();
  for (const action of ['favorite', 'unfavorite', 'mark', 'text', 'clear-feedback']) {
    assert.ok(change(s, action, 999, 'like').error);
  }
  assert.ok(change(s, 'invalid', 1).error);
  assert.ok(change(s, 'mark', 1, 'invalid').error);
  assert.deepEqual(s, P.empty());
});
test('latest mark is exclusive; mark undo preserves text; clear feedback preserves favorite', () => {
  let s = change(P.empty(), 'favorite', 1).state;
  assert.equal(P.tier(s, 1), 0);
  s = change(s, 'text', 1, 'good').state;
  s = change(s, 'mark', 1, 'like').state;
  assert.equal(P.tier(s, 1), 1);
  s = change(s, 'mark', 1, 'not-interested').state;
  assert.equal(P.tier(s, 1), -1);
  s = change(s, 'mark', 1, '').state;
  assert.deepEqual(s.feedback[1], { mark: '', text: 'good' });
  s = change(s, 'clear-feedback', 1).state;
  assert.deepEqual(s.feedback, {});
  assert.deepEqual(s.favorites, [1]);
});
test('200 Unicode characters accepted, 201 rejected; blank text removes text only', () => {
  for (const char of ['a', '中', '😀']) {
    const s = change(P.empty(), 'text', 1, char.repeat(200)).state;
    assert.equal(P.textLength(s.feedback[1].text), 200);
    assert.ok(change(s, 'text', 1, char.repeat(201)).error);
    assert.equal(P.textLength(s.feedback[1].text), 200);
  }
  let s = change(P.empty(), 'mark', 1, 'like').state;
  s = change(s, 'text', 1, '   ').state;
  assert.deepEqual(s.feedback[1], { mark: 'like', text: '' });
});
test('stored data validation rejects malformed shapes and limits', () => {
  assert.ok(P.valid(P.empty()));
  for (const s of [null, {}, { favorites: [1, 1], feedback: {} }, { favorites: [], feedback: [] },
    { favorites: [], feedback: { 1: { mark: 'both', text: '' } } },
    { favorites: [], feedback: { 1: { mark: '', text: 'x'.repeat(201) } } }]) assert.ok(!P.valid(s));
});

function app() {
  const stored = new Map();
  const session = new Map();
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { textContent: '', innerHTML: '', style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, removeAttribute() {} });
    return elements.get(id);
  };
  const context = vm.createContext({ console, setTimeout: () => 0, clearTimeout() {},
    location: { hash: '' }, window: { addEventListener() {} },
    document: { querySelector: element, querySelectorAll: () => [], documentElement: { dataset: {} }, body: { addEventListener() {} } },
    localStorage: { getItem: (k) => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v) },
    sessionStorage: { getItem: (k) => session.get(k) ?? null, setItem: (k, v) => session.set(k, v), removeItem: (k) => session.delete(k) }
  });
  for (const file of ['menu.js', 'personal.js', 'personal-api.js', 'recommendation.js', 'main.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, file), 'utf8'), context);
  return { run: (s) => vm.runInContext(s, context), act: (s) => vm.runInContext('(async () => {' + s + '})()', context), stored, element };
}
test('guest cannot read/write demo records or affect recommendations', async () => {
  const a = app();
  assert.equal(await a.run('changePersonal("favorite", 1)'), false);
  assert.equal(a.stored.size, 0);
  a.stored.set('canteen_personal_demo_v1', JSON.stringify({ favorites: [1], feedback: { 13: { mark: 'like', text: '' } } }));
  await a.act('await readPersonal()');
  assert.equal(a.run('personal.favorites.length'), 0);
  assert.equal(a.run('PersonalRecords.tier(personal, 13)'), 0);
});
test('ranking: taste count > feedback > ID, cap 5, full menu uncapped', async () => {
  const a = app();
  a.run('DISHES.forEach(d => { d.available = true; d.verified = true; })');
  await a.act('prefs = { tastes: [], budget: "", excluded: [] }; await setDemo(true)');
  assert.equal(a.run('visibleDishes().length'), 5);
  assert.equal(a.run('visibleDishes(Infinity).length'), 13);
  assert.equal(a.run('visibleDishes()[0].id'), 1);
  await a.act('await changePersonal("mark", 13, "like"); await changePersonal("mark", 1, "not-interested")');
  assert.equal(a.run('visibleDishes()[0].id'), 13);
  assert.equal(a.run('visibleDishes(Infinity).at(-1).id'), 1);
  a.run('prefs.tastes = ["下饭"]');
  assert.equal(a.run('visibleDishes()[0].id'), 2); // 口味匹配优先于点赞。
  await a.act('prefs.tastes = []; await changePersonal("clear-feedback", 13); await changePersonal("clear-feedback", 1)');
  assert.equal(a.run('visibleDishes()[0].id'), 1);
});
test('liked dishes cannot bypass budget, ingredient exclusion, keyword or taste filters', async () => {
  const a = app();
  a.run('DISHES.forEach(d => { d.available = true; d.verified = true; })');
  await a.act('await setDemo(true); await changePersonal("mark", 13, "like"); prefs.budget = "10"');
  assert.equal(a.run('visibleDishes().some(d => d.id === 13)'), false);
  a.run('prefs.budget = ""; prefs.excluded = ["牛肉"]');
  assert.equal(a.run('visibleDishes().some(d => d.id === 13)'), false);
  a.run('prefs.excluded = []; ui.kw = "豆腐"');
  assert.equal(a.run('visibleDishes()[0].id'), 2);
  a.run('ui.kw = ""; ui.taste = "素食"');
  assert.equal(a.run('visibleDishes().some(d => d.id === 13)'), false);
  a.run('prefs.budget = "1"');
  assert.equal(a.run('visibleDishes().length'), 0);
  assert.equal(a.run('prefs.budget'), '1');
});
test('favorites, text and diet logs do not change ranking; log/calorie behavior retained', async () => {
  const a = app();
  a.run('DISHES.forEach(d => { d.available = true; d.verified = true; })');
  const before = a.run('visibleDishes(Infinity).map(d => d.id).join()');
  await a.act('await setDemo(true); await changePersonal("favorite", 13); await changePersonal("text", 13, "best"); addDishLog(dishById(13), 1.5)');
  assert.equal(a.run('visibleDishes(Infinity).map(d => d.id).join()'), before);
  assert.equal(a.run('todayLogs()[0].kcal'), 735);
  assert.equal(a.run('todayLogs()[0].protein'), 42);
  assert.equal(a.run('weekSeries().at(-1).kcal'), 735);
});
test('failed persistence retains memory and stored data; corrupt data is not overwritten', async () => {
  const a = app();
  await a.act('await setDemo(true); await changePersonal("favorite", 1)');
  const saved = a.stored.get('canteen_personal_demo_v1');
  a.run('localStorage.setItem = () => { throw new Error("quota"); }');
  assert.equal(await a.run('changePersonal("favorite", 2)'), false);
  assert.equal(a.run('personal.favorites.join()'), '1');
  assert.equal(a.stored.get('canteen_personal_demo_v1'), saved);
  a.stored.set('canteen_personal_demo_v1', '{broken');
  assert.equal(await a.run('changePersonal("favorite", 3)'), false);
  assert.equal(a.stored.get('canteen_personal_demo_v1'), '{broken');
  assert.match(a.element('#toast').textContent, /无法读取/);
});
test('new saved actions retain other tabs records and text is escaped in both views', async () => {
  const a = app();
  await a.act('await setDemo(true); await changePersonal("favorite", 1)');
  a.stored.set('canteen_personal_demo_v1', JSON.stringify({ favorites: [1, 2], feedback: {} }));
  await a.act('await changePersonal("favorite", 3); await changePersonal("text", 1, "<img src=x onerror=alert(1)>")');
  assert.equal(a.run('personal.favorites.join()'), '1,2,3');
  const panel = a.run('personalPanel(dishById(1))');
  assert.ok(panel.includes('&lt;img'));
  a.run('renderFavorites()');
  assert.ok(a.element('#view').innerHTML.includes('&lt;img'));
});

test('missing menu status is visible but excluded; status updates override likes', async () => {
  const a = app();
  assert.equal(a.run('visibleDishes().length'), 0);
  assert.equal(a.run('visibleDishes(Infinity).length'), 13);
  await a.act('await setDemo(true); await changePersonal("favorite", 1); await changePersonal("mark", 1, "like"); renderFavorites()');
  assert.match(a.element('#view').innerHTML, /可售状态待确认.*食材待核验/);
  a.run('DISHES[0].available = true');
  assert.equal(a.run('visibleDishes().length'), 0);
  a.run('DISHES[0].verified = true');
  assert.equal(a.run('visibleDishes()[0].id'), 1);
  a.run('DISHES[0].available = false; renderFavorites()');
  assert.equal(a.run('visibleDishes().length'), 0);
  assert.match(a.element('#view').innerHTML, /暂不可售/);
  a.run('DISHES[0].available = true; DISHES[0].verified = false');
  assert.equal(a.run('visibleDishes().length'), 0);
});

test('shared recommendation rejects unavailable, unverified, excluded and unknown prices before ranking', async () => {
  const a = app();
  await a.act(`DISHES.forEach(d => { d.available = true; d.verified = true; });
    DISHES[0].available = false; DISHES[1].verified = false;
    DISHES[2].price = null; DISHES[3].price = undefined;
    DISHES[4].price = NaN; DISHES[5].price = "19";
    prefs = { tastes: [], excluded: ["牛肉"], budget: "20" };
    await setDemo(true); for (const d of DISHES) await changePersonal("mark", d.id, "like");`);
  assert.equal(a.run('visibleDishes().map(d => d.id).join()'), '8,9');
  a.run('prefs.budget = "invalid"');
  assert.equal(a.run('visibleDishes().length'), 0);
  a.run('prefs.budget = "-1"');
  assert.equal(a.run('visibleDishes().length'), 0);
});

test('selected taste priority and feedback removal use the shared recommendation result', async () => {
  const a = app();
  await a.act(`DISHES.forEach(d => { d.available = true; d.verified = true; });
    await setDemo(true); prefs.tastes = ["下饭"]; ui.selectedTastes = ["清淡"];
    await changePersonal("mark", 1, "like"); await changePersonal("mark", 13, "like");`);
  assert.equal(a.run('visibleDishes()[0].id'), 13);
  await a.run('changePersonal("clear-feedback", 13)');
  assert.equal(a.run('visibleDishes()[0].id'), 3);
  assert.equal(a.run('visibleDishes().map(d => d.id).join()'), a.run('getRecommendation(DISHES, { preferredTastes: ["清淡"] }, personal).list.map(d => d.id).join()'));
  assert.equal(a.run('visibleDishes()[0].score'), 1);
});

test('removed dishes retain records and allow independent cleanup but reject new feedback', async () => {
  const a = app();
  await a.act('await setDemo(true); await changePersonal("favorite", 1); await changePersonal("text", 1, "keep"); DISHES.splice(0, 1); renderFavorites()');
  const html = a.element('#view').innerHTML;
  assert.match(html, /菜品 #1 已不在菜单中/);
  assert.match(html, /data-personal="unfavorite"/);
  assert.match(html, /data-personal="clear-feedback"/);
  assert.equal(await a.run('changePersonal("mark", 1, "like")'), false);
  assert.equal(await a.run('changePersonal("text", 1, "new")'), false);
  assert.equal(await a.run('changePersonal("favorite", 1)'), false);
  assert.equal(await a.run('changePersonal("unfavorite", 1)'), true);
  assert.equal(a.run('personal.feedback[1].text'), 'keep');
  assert.equal(await a.run('changePersonal("clear-feedback", 1)'), true);
  assert.equal(a.run('Object.keys(personal.feedback).length'), 0);
});

test('mock API requires demo opt-in and validates direct writes without changing rejected records', async () => {
  const a = app();
  await assert.rejects(a.run('PersonalApi.read()'), /开启本地演示/);
  await assert.rejects(a.run('PersonalApi.change("favorite", 1)'), /开启本地演示/);
  await a.run('setDemo(true)');
  const full = JSON.stringify({ favorites: Array.from({ length: 20 }, (_, i) => 101 + i), feedback: {} });
  a.stored.set('canteen_personal_demo_v1', full);
  await assert.rejects(a.run('PersonalApi.change("favorite", 1)'), /最多收藏 20/);
  await assert.rejects(a.run('PersonalApi.change("text", 1, "字".repeat(201))'), /最多 200/);
  await assert.rejects(a.run('PersonalApi.change("mark", 999, "like")'), /找不到/);
  assert.equal(a.stored.get('canteen_personal_demo_v1'), full);
  await a.run('PersonalApi.change("unfavorite", 101)');
  const saved = await a.run('PersonalApi.change("favorite", 1)');
  saved.favorites.length = 0;
  assert.equal((await a.run('PersonalApi.read()')).favorites.length, 20);
  await a.run('setDemo(false)');
  await assert.rejects(a.run('PersonalApi.read()'), /开启本地演示/);
});

test('late reads cannot overwrite newer records or restore data after demo exit', async () => {
  const a = app();
  await a.run('setDemo(true)');
  a.run('const reads = []; PersonalApi.read = () => new Promise(resolve => reads.push(resolve))');
  const older = a.run('readPersonal()');
  const newer = a.run('readPersonal()');
  a.run('reads[1]({ favorites: [2], feedback: {} })');
  assert.equal(await newer, true);
  a.run('reads[0]({ favorites: [1], feedback: {} })');
  assert.equal(await older, false);
  assert.equal(a.run('personal.favorites.join()'), '2');
  const pending = a.run('readPersonal()');
  await a.run('setDemo(false)');
  a.run('reads[2]({ favorites: [3], feedback: {} })');
  assert.equal(await pending, false);
  assert.equal(a.run('personal.favorites.length'), 0);
});

test('pending saves reject duplicate clicks, recover from failure and ignore an exited session', async () => {
  const a = app();
  await a.run('setDemo(true)');
  a.run('let resolveSave, rejectSave; PersonalApi.change = () => new Promise((resolve, reject) => { resolveSave = resolve; rejectSave = reject; })');
  const failed = a.run('changePersonal("favorite", 1)');
  assert.equal(await a.run('changePersonal("favorite", 2)'), false);
  a.run('rejectSave(new Error("mock 保存失败"))');
  assert.equal(await failed, false);
  assert.equal(a.run('personal.favorites.length'), 0);
  assert.equal(a.stored.size, 0);
  assert.equal(a.run('personalSaving'), false);
  assert.match(a.element('#toast').textContent, /mock 保存失败/);
  const pending = a.run('changePersonal("favorite", 1)');
  await a.run('setDemo(false)');
  await a.run('setDemo(true)');
  a.run('resolveSave({ favorites: [1], feedback: {} })');
  assert.equal(await pending, false);
  assert.equal(a.run('personal.favorites.length'), 0);
  assert.equal(a.run('personalSaving'), false);
});
