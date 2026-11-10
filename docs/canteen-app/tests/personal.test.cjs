const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const P = require('../personal.js');
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
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, { textContent: '', innerHTML: '', style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {} }, setAttribute() {}, removeAttribute() {} });
    return elements.get(id);
  };
  const context = vm.createContext({ console, setTimeout: () => 0, clearTimeout() {},
    location: { hash: '' }, window: { addEventListener() {} },
    document: { querySelector: element, querySelectorAll: () => [], documentElement: { dataset: {} }, body: { addEventListener() {} } },
    localStorage: { getItem: (k) => stored.get(k) ?? null, setItem: (k, v) => stored.set(k, v) },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} }
  });
  for (const file of ['personal.js', 'main.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context);
  return { run: (s) => vm.runInContext(s, context), stored, element };
}
test('guest cannot read/write demo records or affect recommendations', () => {
  const a = app();
  assert.equal(a.run('changePersonal("favorite", 1)'), false);
  assert.equal(a.stored.size, 0);
  a.stored.set('canteen_personal_demo_v1', JSON.stringify({ favorites: [1], feedback: { 13: { mark: 'like', text: '' } } }));
  a.run('readPersonal()');
  assert.equal(a.run('personal.favorites.length'), 0);
  assert.equal(a.run('PersonalRecords.tier(personal, 13)'), 0);
});
test('ranking: taste count > feedback > ID, cap 5, full menu uncapped', () => {
  const a = app();
  a.run('prefs = { tastes: [], budget: "", excluded: [] }; demoActive = true');
  assert.equal(a.run('visibleDishes().length'), 5);
  assert.equal(a.run('visibleDishes(Infinity).length'), 13);
  assert.equal(a.run('visibleDishes()[0].id'), 1);
  a.run('changePersonal("mark", 13, "like"); changePersonal("mark", 1, "not-interested")');
  assert.equal(a.run('visibleDishes()[0].id'), 13);
  assert.equal(a.run('visibleDishes(Infinity).at(-1).id'), 1);
  a.run('prefs.tastes = ["下饭"]');
  assert.equal(a.run('visibleDishes()[0].id'), 2); // 口味匹配优先于点赞。
  a.run('prefs.tastes = []; changePersonal("clear-feedback", 13); changePersonal("clear-feedback", 1)');
  assert.equal(a.run('visibleDishes()[0].id'), 1);
});
test('liked dishes cannot bypass budget, ingredient exclusion, keyword or taste filters', () => {
  const a = app();
  a.run('demoActive = true; changePersonal("mark", 13, "like"); prefs.budget = "10"');
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
test('favorites, text and diet logs do not change ranking; log/calorie behavior retained', () => {
  const a = app();
  const before = a.run('visibleDishes(Infinity).map(d => d.id).join()');
  a.run('demoActive = true; changePersonal("favorite", 13); changePersonal("text", 13, "best"); addDishLog(dishById(13), 1.5)');
  assert.equal(a.run('visibleDishes(Infinity).map(d => d.id).join()'), before);
  assert.equal(a.run('todayLogs()[0].kcal'), 735);
  assert.equal(a.run('todayLogs()[0].protein'), 42);
  assert.equal(a.run('weekSeries().at(-1).kcal'), 735);
});
test('failed persistence retains memory and stored data; corrupt data is not overwritten', () => {
  const a = app();
  a.run('demoActive = true; changePersonal("favorite", 1)');
  const saved = a.stored.get('canteen_personal_demo_v1');
  a.run('localStorage.setItem = () => { throw new Error("quota"); }');
  assert.equal(a.run('changePersonal("favorite", 2)'), false);
  assert.equal(a.run('personal.favorites.join()'), '1');
  assert.equal(a.stored.get('canteen_personal_demo_v1'), saved);
  a.stored.set('canteen_personal_demo_v1', '{broken');
  assert.equal(a.run('changePersonal("favorite", 3)'), false);
  assert.equal(a.stored.get('canteen_personal_demo_v1'), '{broken');
  assert.ok(a.run('personalError'));
});
test('new saved actions retain other tabs records and text is escaped in both views', () => {
  const a = app();
  a.run('demoActive = true; changePersonal("favorite", 1)');
  a.stored.set('canteen_personal_demo_v1', JSON.stringify({ favorites: [1, 2], feedback: {} }));
  a.run('changePersonal("favorite", 3); changePersonal("text", 1, "<img src=x onerror=alert(1)>")');
  assert.equal(a.run('personal.favorites.join()'), '1,2,3');
  const panel = a.run('personalPanel(dishById(1))');
  assert.ok(panel.includes('&lt;img'));
  a.run('renderFavorites()');
  assert.ok(a.element('#view').innerHTML.includes('&lt;img'));
});
