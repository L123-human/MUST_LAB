# 食堂好味道原型

在此目录运行 `python3 -m http.server 8765 --bind 127.0.0.1`，访问 `http://127.0.0.1:8765/`。

底部“收藏”入口可开启本地演示。数据保存在此浏览器，真实账户待接入。

- 规则测试：`node --test tests/personal.test.cjs`
- 浏览器测试：启动服务器并安装 Playwright、Chrome 后运行 `node tests/browser.cjs`

需求与待联调事项见 [REQ-1.4](notes/REQ-1.4-delivery.md)。
