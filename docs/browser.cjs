// 需启动本地服务器。
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:8765/docs';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // 不依赖外部字体服务。
    await context.route('https://fonts.**/*', route => route.abort());
    const visit = async hash => { await page.goto(base + '/#' + hash, { waitUntil: 'domcontentloaded' }); await page.locator('#view').waitFor(); };
    await visit('favorites');
    await page.locator('.welcome-dialog[open]').waitFor();
    await page.locator('[data-welcome-skip]').click();
    assert.equal(await page.evaluate(() => localStorage.getItem('canteen_prefs')), null);
    await page.getByRole('heading', { name: '请登录后使用' }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('canteen_personal_demo_v1')), null);
    await page.locator('#startPersonalDemo').click();
    await page.getByText('还没有收藏', { exact: true }).waitFor();
    await visit('menu');
    assert.equal(await page.locator('.dish').count(), 13);
    await visit('home');
    await page.getByText('演示菜单：菜品、价格、供应及核验状态均为模拟。', { exact: true }).waitFor();
    assert.equal(await page.locator('.dish').count(), 5);
    await visit('dish/13');
    await page.evaluate(() => {
      const change = PersonalApi.change;
      PersonalApi.change = async () => { PersonalApi.change = change; throw new Error('mock 保存失败'); };
    });
    await page.getByRole('button', { name: '收藏这道菜', exact: true }).click();
    assert.match(await page.locator('#toast').textContent(), /mock 保存失败/);
    assert.equal(await page.evaluate(() => localStorage.getItem('canteen_personal_demo_v1')), null);
    await page.getByRole('button', { name: '收藏这道菜', exact: true }).click();
    await page.locator('#feedbackText').fill('这是一份尚未保存的反馈');
    await page.getByRole('button', { name: '点赞', exact: true }).click();
    assert.equal(await page.locator('#feedbackText').inputValue(), '这是一份尚未保存的反馈');
    await page.evaluate(() => {
      const read = PersonalApi.read;
      PersonalApi.read = () => {
        PersonalApi.read = read;
        return new Promise(resolve => { window.finishDelayedRead = async () => resolve(await read()); });
      };
      route();
    });
    await page.getByRole('button', { name: '点赞', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: '点赞', exact: true }).getAttribute('aria-pressed'), 'false');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem(PersonalApi.storageKey)).feedback[13]?.mark || ''), '');
    await page.evaluate(() => window.finishDelayedRead());
    assert.equal(await page.getByRole('button', { name: '点赞', exact: true }).getAttribute('aria-pressed'), 'false');
    await page.getByRole('button', { name: '点赞', exact: true }).click();
    await page.getByRole('button', { name: '不感兴趣', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: '点赞', exact: true }).getAttribute('aria-pressed'), 'false');
    assert.equal(await page.getByRole('button', { name: '不感兴趣', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: '不感兴趣', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: '不感兴趣', exact: true }).getAttribute('aria-pressed'), 'false');
    await page.locator('#feedbackText').fill('字'.repeat(201));
    await page.getByRole('button', { name: '保存文字反馈', exact: true }).click();
    assert.match(await page.locator('#toast').textContent(), /最多 200/);
    await page.locator('#feedbackText').fill('<img src=x onerror=alert(1)> ' + '😀'.repeat(170));
    await page.getByRole('button', { name: '保存文字反馈', exact: true }).click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.welcome-dialog[open]').count(), 0);
    assert.ok((await page.locator('#feedbackText').inputValue()).startsWith('<img'));
    assert.equal(await page.locator('.personal-panel img').count(), 0);
    await page.getByRole('button', { name: '点赞', exact: true }).click();
    await visit('favorites');
    assert.equal(await page.locator('.personal-record').count(), 1);
    assert.equal(await page.locator('.feedback-copy img').count(), 0);
    assert.ok((await page.locator('.feedback-copy').textContent()).startsWith('<img'));
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal overflow at ' + width);
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: process.env.SCREENSHOT_DIR + '/favorites.png', fullPage: true, animations: 'disabled' });
    // 跨标签页同步。
    const second = await context.newPage();
    await second.goto(base + '/#favorites', { waitUntil: 'domcontentloaded' });
    await second.locator('#startPersonalDemo').click();
    await second.getByRole('button', { name: '取消收藏', exact: true }).click();
    await page.getByText('还没有收藏', { exact: true }).waitFor();
    assert.equal(await page.locator('.personal-record').count(), 1); // 反馈保留。
    await page.getByRole('button', { name: '清除全部反馈', exact: true }).click();
    assert.equal(await page.locator('.personal-record').count(), 0);
    await visit('dish/13');
    await page.locator('#plus').click();
    await page.locator('#addLog').click();
    await visit('stats');
    assert.ok((await page.locator('.log-item').textContent()).includes('735 kcal'));
    await page.locator('[data-del]').click();
    assert.equal(await page.locator('.log-item').count(), 0);
    await visit('dish/13');
    await page.getByRole('button', { name: '收藏这道菜', exact: true }).click();
    await visit('favorites');
    await page.evaluate(() => {
      const read = MenuApi.read;
      MenuApi.read = () => { MenuApi.read = read; return new Promise(resolve => { window.finishMenuRead = async () => resolve(await read()); }); };
    });
    await page.locator('#stopPersonalDemo').click();
    assert.equal(await page.locator('.personal-record').count(), 0);
    await page.evaluate(() => window.finishMenuRead());
    await page.getByRole('heading', { name: '请登录后使用' }).waitFor();
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.personal-record').count(), 0);
    assert.deepEqual(JSON.parse(await page.evaluate(() => localStorage.getItem('canteen_personal_demo_v1'))).favorites, [13]);
    await page.locator('#startPersonalDemo').click();
    assert.equal(await page.locator('.personal-record').count(), 1);
    const oldTheme = await page.locator('html').getAttribute('data-theme');
    await page.locator('#themeToggle').click();
    assert.notEqual(await page.locator('html').getAttribute('data-theme'), oldTheme);
    await visit('dish/13');
    await page.evaluate(() => window.scrollTo(0, 0));
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: process.env.SCREENSHOT_DIR + '/detail.png', fullPage: true, animations: 'disabled' });

    await page.getByRole('button', { name: '点赞', exact: true }).click();
    const recommendationPage = await context.newPage();
    recommendationPage.on('pageerror', e => errors.push(e.message));
    const recommendationUrl = new URL('../recommand1/', base + '/').href;
    await recommendationPage.goto(recommendationUrl, { waitUntil: 'domcontentloaded' });
    assert.match(await recommendationPage.locator('#feedback-status').textContent(), /游客模式/);
    assert.equal(await recommendationPage.locator('.item').count(), 5);
    assert.match(await recommendationPage.locator('#menu-status').textContent(), /演示菜单/);
    assert.match(await recommendationPage.locator('.item').first().textContent(), /农家小炒肉.*ID:1｜/);
    await recommendationPage.goto(base + '/#favorites', { waitUntil: 'domcontentloaded' });
    await recommendationPage.locator('#startPersonalDemo').click();
    await recommendationPage.goto(recommendationUrl, { waitUntil: 'domcontentloaded' });
    assert.match(await recommendationPage.locator('#feedback-status').textContent(), /本地演示/);
    assert.match(await recommendationPage.locator('.item').first().textContent(), /清汤牛腩粉.*ID:13｜/);
    await recommendationPage.locator('#inpTaste').fill('下饭');
    await recommendationPage.getByRole('button', { name: '生成推荐' }).click();
    assert.match(await recommendationPage.locator('.item').first().textContent(), /ID:1｜/);
    await recommendationPage.locator('#inpTaste').fill('');
    await recommendationPage.getByRole('button', { name: '生成推荐' }).click();
    await page.getByRole('button', { name: '点赞', exact: true }).click();
    await recommendationPage.waitForFunction(() => document.querySelector('.item')?.textContent.includes('ID:1｜'));
    await recommendationPage.evaluate(async () => { const menu = await MenuApi.read(); menu.dishes[0].available = false; menu.dishes[1].verified = false; MenuApi.read = async () => menu; return runRecommend(); });
    assert.match(await recommendationPage.locator('.item').first().textContent(), /ID:3｜/);
    assert.match(await recommendationPage.locator('.reject-log').textContent(), /暂不可供应/);
    assert.match(await recommendationPage.locator('.reject-log').textContent(), /食材待核验/);

    await page.locator('#feedbackText').fill('保留的反馈');
    await page.getByRole('button', { name: '保存文字反馈', exact: true }).click();
    await visit('favorites');
    const updatedMenu = await page.evaluate(() => MenuApi.read());
    const applyMenu = async () => {
      for (const target of [page, recommendationPage]) {
        await target.evaluate(menu => { MenuApi.read = async () => JSON.parse(JSON.stringify(menu)); }, updatedMenu);
      }
    };
    updatedMenu.dishes.find(d => d.id === 13).price = 25;
    await applyMenu();
    await page.locator('#refreshMenu').click();
    assert.match(await page.locator('.personal-record').textContent(), /¥25\.00/);
    await recommendationPage.locator('#inpTaste').fill('清淡,汤水,高蛋白');
    await recommendationPage.getByRole('button', { name: '生成推荐' }).click();
    assert.match(await recommendationPage.locator('.item').first().textContent(), /ID:13｜价格：25\.00元/);
    updatedMenu.dishes.find(d => d.id === 13).available = false;
    await applyMenu();
    await page.locator('#refreshMenu').click();
    assert.match(await page.locator('.personal-record').textContent(), /暂不可售/);
    await recommendationPage.getByRole('button', { name: '生成推荐' }).click();
    assert.ok(!(await recommendationPage.locator('.item').allTextContents()).some(text => text.includes('ID:13｜')));
    await recommendationPage.evaluate(() => {
      const read = MenuApi.read;
      MenuApi.read = async () => { MenuApi.read = read; throw new Error('offline'); };
    });
    await recommendationPage.getByRole('button', { name: '生成推荐' }).click();
    assert.match(await recommendationPage.locator('#menu-status').textContent(), /菜单读取失败/);
    assert.equal(await recommendationPage.locator('.item').count(), 0);
    await recommendationPage.getByRole('button', { name: '生成推荐' }).click();
    assert.equal(await recommendationPage.locator('.item').count(), 5);
    await page.evaluate(() => { MenuApi.read = async () => { throw new Error('offline'); }; });
    await page.locator('#refreshMenu').click();
    await page.getByText('菜单读取失败，请重试。收藏与反馈记录未删除。', { exact: true }).waitFor();
    assert.deepEqual(await page.evaluate(() => JSON.parse(localStorage.getItem(PersonalApi.storageKey)).favorites), [13]);
    await applyMenu();
    await page.locator('#refreshMenu').click();
    assert.match(await page.locator('.personal-record').textContent(), /保留的反馈/);
    updatedMenu.dishes = updatedMenu.dishes.filter(d => d.id !== 13);
    await applyMenu();
    await page.locator('#refreshMenu').click();
    assert.match(await page.locator('.personal-record').textContent(), /已不在菜单中/);
    await page.getByRole('button', { name: '取消收藏', exact: true }).click();
    assert.match(await page.locator('.personal-record').textContent(), /保留的反馈/);
    await page.getByRole('button', { name: '清除全部反馈', exact: true }).click();
    assert.equal(await page.locator('.personal-record').count(), 0);
    assert.deepEqual(errors, []);
    console.log('PASS: onboarding, guest/demo boundaries, favorites, marks/undo, drafts, text limits/escaping, reload, cross-tab sync, responsive widths, diet logs, shared C/D ranking, mock save failure, B menu refresh/failure/retry, price/status updates, stale record cleanup, no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
