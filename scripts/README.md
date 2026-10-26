# 应用代码索引

按功能查找文件。页面样式集中在根目录的 [style.css](../style.css)。素材构建工具见 [tools/earth](../tools/earth/README.md)。

## 数据与启动

| 文件 | 用途 |
| --- | --- |
| [storage-bootstrap.js](storage-bootstrap.js) | 本地存储启动、恢复选择、保存队列与功能脚本加载顺序 |
| [backup-core.js](backup-core.js) | JSON／ZIP 备份、完整性检查、分类恢复与身份映射 |
| [importers.js](importers.js) | 角色资料与文档导入 |
| [profiles.js](profiles.js) | 用户资料列表、编辑与独立保存 |
| [characters.js](characters.js) | 角色资料列表、编辑、导入与独立保存 |

## 聊天与公共界面

| 文件 | 用途 |
| --- | --- |
| [app.js](app.js) | 主应用状态、聊天、线下叙事、心声、通话、短信、世界书、设置与各功能衔接 |
| [life-memory.js](life-memory.js) | 聊天事项与后续记忆的数据逻辑 |
| [mini-theater.js](mini-theater.js) | 小剧场作品、隔离渲染与交互 |
| [role-invitations.js](role-invitations.js) | 角色发出的音乐、阅读等互动邀请 |
| [guide-content.js](guide-content.js) | 悬浮助手的按钮说明与操作引导 |
| [layout-diagnostics.js](layout-diagnostics.js) | 界面布局检查辅助逻辑 |
| [vendor/](vendor) | 第三方二维码代码 |

## 经历中心

| 文件 | 用途 |
| --- | --- |
| [experiences.js](experiences.js) | 经历页面入口、分类导航、角色切换与时间线界面 |
| [timeline-core.js](timeline-core.js) | 人生时间线记录、来源校验、排序与合并 |
| [growth-core.js](growth-core.js) | 成长档案数据、阶段与经历关联 |
| [growth.js](growth.js) | 成长相册、阶段编辑与 API 填写界面 |
| [earth-core.js](earth-core.js) | 城市定位、路线数据与球面几何 |
| [earth.js](earth.js) | 地球绘制、航段列表、路线播放与旅行入口 |
| [people-core.js](people-core.js) | 人物档案、阶段评价与奖项数据 |
| [people.js](people.js) | 人物与成就的浏览、编辑和生成界面 |
| [if-world.js](if-world.js) | IF 开场、分支、世界与阶段设定、剧情操作、梦境摘要与封存 |

梦境如何进入普通聊天，以及角色如何回应梦境，位于 [app.js](app.js) 的 `ifDreamContext`。功能文档见 [docs/experiences](../docs/experiences/README.md)。

## 一起旅行

| 文件 | 用途 |
| --- | --- |
| [travel-map.js](travel-map.js) | 双人旅行地点、地图、分日安排与行程确认 |
| [travel-journal.js](travel-journal.js) | 旅行手账、每日记录与票面回忆 |
| [travel-billing.js](travel-billing.js) | 旅行费用记录、分摊与结算 |
| [travel-booking.js](travel-booking.js) | 出行、住宿方案、预订和已付款安排 |
| [travel-currency.js](travel-currency.js) | 旅行币种与金额精度处理 |

聊天中的旅行邀请、协商和页面入口衔接位于 [app.js](app.js)。

## 日常功能

| 模块 | 数据与逻辑 | 界面及其他文件 |
| --- | --- | --- |
| 论坛 | [forum-core.js](forum-core.js) | [forum.js](forum.js) |
| 商城、钱包与礼物 | [market-core.js](market-core.js) | [market.js](market.js) |
| 香水与经营 | [perfumery-core.js](perfumery-core.js) | [perfumery.js](perfumery.js) |
| 阅读 | [reading-core.js](reading-core.js) | [reading.js](reading.js)、[reading-import.js](reading-import.js)、[reading-search.js](reading-search.js)、[reading-content.js](reading-content.js) |
| 音乐 | [music-core.js](music-core.js) | [music.js](music.js)、[music-cloud.js](music-cloud.js) |
