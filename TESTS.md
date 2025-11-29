 # BanSimulator 测试计划

 本文件包含黑盒（功能/用户流程）与白盒（代码/事件绑定）测试用例，以及快速运行说明。目的是给出可执行的检查步骤，帮助验证当前修改是否满足需求。

 ## 运行前准备

 - 推荐在项目根目录启动本地静态服务器（因为直接用 `file://` 加载可能引起脚本/资源限制）：

   PowerShell 示例：

 ```powershell
 # 使用 Python 内置 HTTP 服务器（Python 3）
 cd C:\Users\hanyu\Desktop\my-projrcts\my-projects\bansimulator
 python -m http.server 8080
 # 或者使用 npx http-server（需要 node）
 npx http-server . -p 8080
 ```

 - 如果要运行自动化脚本（Puppeteer），请安装依赖：

 ```powershell
 npm install
 npm test
 ```

 自动化脚本会期望站点可通过 `http://localhost:8080/index.html` 访问。

 ---

 ## 黑盒测试（手动 / QA）

 每条用例都按：目标 → 步骤 → 期望结果 格式说明。

 1. 登录基础
    - 目标：确认登录页是默认页并能成功登录。
    - 步骤：打开 `index.html`；确认看到昵称输入和“开始体验”按钮；输入昵称（如 `user1`）并点击“开始体验”。
    - 期望：页面显示主菜单（`menu-screen` 可见），昵称预填/显示正确。

 2. 被封账号登陆流程
    - 目标：本地存储中若有 `banned=true`，登录时弹出申诉提示并按 admin/非 admin 分支处理。
    - 步骤：在 localStorage（键 `fengjin_user_data`）写入被封帐号数据；刷新页面；尝试登录。
    - 期望：若为普通账号，出现确认框并跳转到申诉/客服页面；若昵称为 `admin`，允许解封并进入主菜单。

 3. 游戏超时封号
    - 目标：启动游戏并在配置时间（默认 60s）到达后触发封号流程。
    - 步骤：在 `game-screen` 启动游戏，等待到达超时时间或用开发者工具直接调用 `window.gameManager.endGame('timeout')`。
    - 期望：触发 `AuthManager.banCurrentUser()`，localStorage 中用户对象 `banned=true`，并且用户被登出回登录页或显示封禁页面。

 4. 投诉/客服流
    - 目标：游戏结束后点击“是的，我要投诉”进入客服页面并能发送申诉消息。
    - 步骤：触发游戏结束（或直接切换到投诉页面），点击“是的，我要投诉”，在客服输入框输入文本并点击发送。
    - 期望：客服对话出现客服回复，且 localStorage 中为该用户创建 `supportTickets`（若提交了申诉）。

 5. 抽奖/邀请流
    - 目标：邀请/抽奖按钮存在且可操作，抽奖记录保存。
    - 步骤：进入 `invite-screen`，点击 `simulate-invite`、点击 `spin-button`（前提为足够货币），查看抽奖历史。
    - 期望：货币变化、抽奖记录写入 `fengjin_game_state` 与 `fengjin_lottery_history`。UI 显示更新。

 6. 设置与返回按钮
    - 目标：设置按钮、返回菜单按钮、封禁页“返回登录”按钮等都能工作。
    - 步骤：点击 `menu-settings-btn`、`back-to-menu`、`back-to-menu-settings`、`banned-back-login` 等。
    - 期望：相应屏幕显示/导航正确，未抛异常。

 ---

 ## 白盒测试（代码/静态检查 + 自动化）

 1. 事件绑定与防抖
    - 检查 `script.js` 中使用 `__clickHandler` / `__menuClickHandler` 的元素是否都存在对应的解绑/绑定逻辑。
    - 验证 `bindComplaintEvents()` 使用了事件委托，能在元素动态添加后仍然生效。

 2. 存储结构检查
    - 验证 localStorage 键：`fengjin_user_data`, `fengjin_game_state`, `fengjin_lottery_history` 的结构与默认值一致。

 3. 关键函数路径
    - `AuthManager.handleLogin()`：确认被封分支、开发者分支、普通登录分支都覆盖，且有错误处理。
    - `AuthManager.banCurrentUser()` / `unbanCurrentUser()`：检查其会写入 `banHistory` 并调用通知/登出。
    - `GameManager.endGame('timeout')`：检查是否最终调用 `AuthManager.banCurrentUser()`。

 4. 自动化检查（Puppeteer 脚本）
    - 我们在 `tests/ui_test.js`（项目内）提供了一个基础脚本，会对关键元素存在性与基本交互做快速检查。
    - 使用方法：

 ```powershell
 # 在项目根运行（先启动静态服务器）
 npm install
 npm test
 ```

 脚本会返回非零退出码以示失败，并在控制台打印步骤通过/失败信息。

 ---

 ## 报告与下一步

 - 我已在仓库内新增自动化脚本（如果你希望我现在也运行它，需要你授权我运行 shell 命令；否则请在本地执行 `npm install` 并启动本地服务器后运行 `npm test`）。
 - 如果测试中发现问题，我可以提交针对性修复补丁并再次运行测试。

 ---

 如需我现在执行自动化脚本（在你的环境内启动 npm install / 本地静态服务器并运行），请确认授权，我会给出精确的 PowerShell 命令并运行它们。
