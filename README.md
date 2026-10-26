# Iris 小手机

角色聊天、线下故事与经历管理的网页应用。

## 先找哪个目录

| 目录或文件 | 负责的部分 |
| --- | --- |
| [index.html](index.html) | 页面入口、基础界面与资源加载入口 |
| [style.css](style.css) | 聊天、功能页面与弹窗的界面样式 |
| [scripts](scripts/README.md) | 应用功能代码，按模块查看文件用途 |
| [assets](assets/README.md) | 图片、字体、地图数据与第三方素材 |
| [config](config) | 安装清单与版本信息 |
| [docs](docs/README.md) | 功能设计、提示词与检查报告 |
| [tests](tests/README.md) | 自动测试与手动预览页面 |
| [tools](tools/README.md) | 地图素材、城市数据等维护工具 |
| [cloudflare](cloudflare/README.md) | 音乐服务与作者反馈的服务端代码 |
| [version.json](version.json) | 在线版本检查使用的版本信息 |
| [CNAME](CNAME) | GitHub Pages 自定义域名 |

## 按功能找文件

| 想查看的功能 | 主要位置 |
| --- | --- |
| 线上聊天、线下故事、心声、通话、短信、设置 | [scripts/app.js](scripts/app.js) |
| 用户资料、角色资料、保存资料 | [scripts/profiles.js](scripts/profiles.js)、[scripts/characters.js](scripts/characters.js) |
| 人生时间线、成长档案、地球地图、人物与成就、IF 世界 | [经历模块文件索引](scripts/README.md#经历中心) |
| IF 梦境摘要与聊天中的梦境记忆 | [scripts/if-world.js](scripts/if-world.js)、[scripts/app.js](scripts/app.js) |
| 一起旅行、地图、手账、账单与预订 | [旅行模块文件索引](scripts/README.md#一起旅行) |
| 世界书、API 路由、界面美化、悬浮助手 | [scripts/app.js](scripts/app.js)、[scripts/guide-content.js](scripts/guide-content.js) |
| 论坛、商城、经营、香水、阅读、音乐 | [日常功能文件索引](scripts/README.md#日常功能) |
| 本地保存、备份、导入和恢复 | [数据与启动文件索引](scripts/README.md#数据与启动) |

## 本地查看

在仓库根目录启动静态服务，然后访问终端显示的本地地址：

```sh
python3 -m http.server 8000
```

模型接口在应用内配置。检查方法见 [测试说明](tests/README.md)，提交命名和维护约定见 [协作说明](CONTRIBUTING.md)。
