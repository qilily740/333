# 测试与预览索引

## 按模块查找

| 文件名称或前缀 | 覆盖的部分 |
| --- | --- |
| `app-viewport`、`feature-navigation`、`function-menu-*` | 手机视口、功能入口与菜单语言 |
| `chat-*`、`image-selection`、`role-sticker-*`、`sticker-context-*` | 聊天回复、图片、表情、礼物与钱包 |
| `video-call`、`incoming-video`、`sms-user-switch` | 视频通话与短信身份切换 |
| `reflection-*` | 心声面板与头像入口 |
| `timeline-*`、`growth-*`、`earth-*`、`people-*` | 时间线、成长档案、地球地图与人物成就 |
| `if-*` | IF 剧情界面、成长绑定与梦境聊天上下文 |
| `travel-*` | 旅行地点安排与具体地点生成 |
| `market-*`、`role-money-*`、`transfer-*`、`gift-reaction-*` | 商城、币种、转账与礼物反应 |
| `forum-*`、`perfumery-*`、`reading-*`、`music-*` | 论坛、香水、阅读与音乐 |
| `mini-theater-*` | 小剧场生成、交互与生命周期 |
| `storage-recovery`、`timeline-backup`、`release-notice` | 存储恢复、备份与更新面板 |
| `font-loading`、`beautify-catalog`、`offline-*`、`guide-content` | 字体、美化、线下界面与助手说明 |
| `life-memory`、`role-invitations`、`iris-assistant-entry` | 事项记忆、互动邀请与内置助手 |

[timeline-app-integration.test.cjs](timeline-app-integration.test.cjs) 同时覆盖完整应用中的经历入口、旅行、预订、账单、角色切换和保存流程。[helpers/jsdom.cjs](helpers/jsdom.cjs) 为界面测试补齐文字编码等浏览器环境。

## 运行检查

在仓库根目录执行：

```sh
node --test tests/*.test.cjs
```

界面测试需要 `jsdom`，缺少时会跳过。可把依赖安装在临时目录，然后运行全部前端测试：

```sh
npm install --prefix /tmp/iris-test-deps --cache /tmp/iris-test-cache jsdom@26 --no-audit --no-fund
NODE_PATH=/tmp/iris-test-deps/node_modules node --test tests/*.test.cjs
```

服务端检查：

```sh
node --test cloudflare/*.test.cjs
```

## 手动预览

本地静态服务启动后，可以打开 [earth-preview.html](earth-preview.html) 查看地球演示，或打开 [mini-theater-browser.html](mini-theater-browser.html) 检查小剧场。

历史检查报告已归档至 [docs/quality](../docs/quality/README.md)。
