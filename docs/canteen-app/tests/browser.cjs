// Run against a local server; see notes/REQ-1.4-delivery.md.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const base = process.env.BASE_URL || 'http://127.0.0.1:8765';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    // Fonts are optional; do not let an external font service affect this local test.
    await context.route('https://fonts.**/*', route => route.abort());
    const visit = async hash => { await page.goto(base + '/#' + hash, { waitUntil: 'domcontentloaded' }); await page.locator('#view').waitFor(); };
    await visit('favorites');
    await page.getByRole('heading', { name: '请登录后使用' }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('canteen_personal_demo_v1')), null);
    await page.locator('#startPersonalDemo').click();
    await page.getByText('还没有收藏', { exact: true }).waitFor();
    await visit('menu');
    assert.equal(await page.locator('.dish').count(), 13);
    await visit('home');
    assert.equal(await page.locator('.dish').count(), 5);
    await visit('dish/13');
    await page.getByRole('button', { name: '收藏这道菜', exact: true }).click();
    await page.locator('#feedbackText').fill('这是一份尚未保存的反馈');
    await page.getByRole('button', { name: '点赞', exact: true }).click();
    assert.equal(await page.locator('#feedbackText').inputValue(), '这是一份尚未保存的反馈');
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
    // A second tab reads persisted favorites; storage events refresh the first tab.
    const second = await context.newPage();
    await second.goto(base + '/#favorites', { waitUntil: 'domcontentloaded' });
    await second.locator('#startPersonalDemo').click();
    await second.getByRole('button', { name: '取消收藏', exact: true }).click();
    await page.getByText('还没有收藏', { exact: true }).waitFor();
    assert.equal(await page.locator('.personal-record').count(), 1); // feedback survives
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
    await page.locator('#stopPersonalDemo').click();
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
    assert.deepEqual(errors, []);
    console.log('PASS: guest gate, demo opt-in/out, menu 13 / recommendation 5, favorites, exclusive marks/undo, drafts, 200/201 characters, escaped text, reload, cross-tab sync, responsive widths, diet log regression, no page errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exit(1); });
