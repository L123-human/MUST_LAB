# 食堂好味道原型

在仓库根目录运行 `python3 -m http.server 8765 --bind 127.0.0.1`，访问 `http://127.0.0.1:8765/docs/`。

首页“收藏与反馈”入口可开启本地演示。数据保存在此浏览器，真实账户待接入。

`personal-api.js` 为本地异步 mock：`PersonalApi.read()` 和 `change(action, dishId, value)` 均返回 `{ favorites, feedback }` 的 Promise，失败时拒绝。沿用 `personal.js` 的动作和原有演示数据；A 接入时替换读写实现及演示开关，使用真实会话。不提供账户隔离或跨设备保存。

- 规则测试：`node --test docs/personal.test.cjs`
- 浏览器测试：启动服务器并安装 Playwright、Chrome 后运行 `node docs/browser.cjs`。

`docs/menu.js` 保留原有 13 道样例菜。B 尚未提供 `available`、`verified`，这些菜可浏览和收藏，暂不进入推荐。C 页面 `/recommand1/` 共用菜单和推荐规则；测试中的核验状态仅为夹具。

需求与待联调事项见 [REQ-1.4](REQ-1.4-delivery.md)。
