# Iris 跨平台字体检查（2026-10-18）

## 2026-10-19：5.5.9 自定义字体作用域修复

- 参考 SillyTavern `release/public/scripts/power-user.js` 的 `applyCustomCSS()` 与 `release/public/style.css`：其用户 CSS 直接注入 style，正文及表单控件引用 `--mainFontFamily`。Iris 仍保留各页面作用域，避免线上、线下与论坛美化互相影响。
- 已复现 Iris 把 `:root`、`html`、`body` 改写为聊天容器内部的文档根元素选择器，导致字体变量声明及字体应用规则无法匹配。现将这些文档前缀映射到对应页面根容器，兼容 `html body`、`html:root > body` 及后续组件选择器。
- 修复 `#conversation` 被当成自身后代的作用域错误；选择器列表按括号、属性和引号层级拆分，不再破坏 `:is(.bubble,.offline-prose-body)` 等字体规则。
- 保留字体导入、字体分片及 Unicode 范围，保留组件和图标自身的 font-family；没有添加全局强制字体规则、诊断入口或清除用户数据。
- `node --test tests/font-loading.test.cjs`：11/11 通过。没有 Android 真机渲染数据；本次修复确认的自定义 CSS 缺陷，不将其描述为所有 Android 字体差异的唯一根因。

## 确认的问题与证据

1. `scopeBeautifyCss()` 原来只保留 media/supports/container。自定义 `@font-face` 被删除；`@import` 是分号结束的语句，原解析器却从后续 `{` 开始读取，连同导入后的第一条组件规则一起跳过。字体名存在于 CSS 不代表字体已注册。已用回归测试复现和修复。这是代码缺陷，不能据此断言某台 Android 的唯一根因。
2. HTML 同时异步加载 `lxgw-wenkai-webfont@1.1.0` 和 ZeoSeven 292。前者又有六个嵌套 @import，后者是 WenKai Regular 1.522；同家族/400/normal/同字符存在两套定义，且加载时间不确定。现在本地声明让 1.522 负责重叠字符，旧字体仅负责它原有的额外字符，保留 Light/Bold/Mono 各变体。
3. Great Vibes、Ma Shan Zheng 只有外部 Google Fonts 资源。启动时调用 `document.fonts.load()` 时，其异步 CSS 尚可能未注册任何字体，这时 Promise 不能证明该字体已加载。现在先通过普通同源 stylesheet 注册字体，再预载 Great Vibes；保留 `font-display: swap`。
4. 阅读字体导入在 MIME 为空时把所有格式标成 font/woff2。现在根据原扩展名分别使用 font/woff2、font/woff、font/ttf、font/otf；字体名称和用户已保存数据不变。
5. 美化预览以前的 CSP 不允许字体网络资源，且把用户 @import 放在基础规则之后（CSS 中无效）。现在仅该预览允许同源/HTTPS 字体及字体样式表；用户 CSS 独立放在新的 style 中，导入位于其最前。独立的心声沙箱限制保持不变。

## 字体来源与平台限制

原有下载字体：LXGW WenKai、LXGW WenKai Mono、Great Vibes、Ma Shan Zheng、Iris Kai（本地 WenKai Lite 1.522）。没有发现 Font Awesome 或自定义图标字体。SVG、Emoji、符号和 PDF.js 的标准字体不改动。

项目还有依赖操作系统的字体栈，例如 Snell Roundhand / Apple Chancery / Songti SC / KaiTi / Georgia。它们没有随项目分发，没有可用的原字体 Web 授权文件。保留原栈，未换成视觉不同的字体；Android 缺少它们时仍会回退。这一限制不能通过修复下载机制解决。要让这些组件也使用相同原字体，需要取得相应授权字体资源。

Great Vibes 为拉丁装饰字体，不包含中文；中文回退属于原设计，不能凭借一个 family 名称让其拥有中文字形。Ma Shan Zheng 原文件含 7015 个 Unicode 映射，WenKai Regular 当前有效映射为 46490 个；罕见字或 Emoji 仍可能按原回退链显示。

## CDN、MIME 与缓存

- 本次从当前网络访问原 Google Fonts、jsDelivr 和 ZeoSeven CSS 最终均取得 200。不能确认用户 Android 网络是否能同样访问。
- 下载中确实遇到文楷 CDN 的截断响应/IncompleteRead，重试取得完整内容；这是本次网络观察，不等于 Android 设备根因。
- ZeoSeven CSS 返回 text/css 和 Access-Control-Allow-Origin: *；Google Fonts CSS 同样允许跨域。已保存字体响应头于 sources.json。
- 当前正式域名的既有 iris-kai.woff2 HEAD 返回 200、font/woff2、Access-Control-Allow-Origin: *、Cache-Control: max-age=600。没有证据表明其服务端 MIME/CORS 错误。
- 内置字体现通过同源 assets/fonts/fonts.css?v=2 加载，资源 URL 不按 UA 切换。CSS 相对字体路径适用于自定义域名与 /333/ 子目录部署。新文件尚未部署，线上新路径的实际响应仍需发布后检查。
- 未发现项目 Service Worker 注册或 Cache API 字体缓存；PWA manifest 本身不提供字体缓存逻辑。没有清空浏览器缓存、localStorage、IndexedDB 或用户数据。

## 验证与范围

- `node --test tests/font-loading.test.cjs`：7/7 通过。覆盖自定义字体声明、import 顺序、选择器作用域、预览 CSP、字体路径/文件格式、同家族范围冲突及常用字符范围。
- 用临时 fontTools 逐个解析全部使用的字体，核对实际字重、cmap 和 unicode-range；原分片声明有 148 处包含文件中没有的字形（新版仅含一个 NUL，其他为旧版声明），已取交集，22 条完全空的范围不注册，文件仍保留。详见 coverage-audit.json。
- Great Vibes 与 Ma Shan Zheng 的 WOFF2 和原 TTF cmap 完全一致，字重均为 400；原 TTF 保留为兼容格式。
- 全量 tests/*.test.cjs：174/175 通过。唯一失败为 guide-content.test.cjs:131 对旧 data-music-ask 控件 API 说明的断言。用 git HEAD 的 guide-content.js 再次运行同一测试仍失败，属于既有问题；本次不修改业务指南。
- 未修改任何组件 font-family、字号、字重、颜色、行高、字距、换行和对齐规则；没有新增全局字体强制覆盖，也没有修改布局、底栏、安全区、滚动或动画。
- 本次没有浏览器实际 rendered fonts 数据，也没有 Android/iOS 真机或 PWA 实机结果。代码和字体文件检查不能代替排版视觉验证。

## 发布后设备检查

在 Android Chrome/WebView/PWA、iOS Safari/PWA、macOS Safari、Windows Chrome 检查：

1. 首次加载和已有安装两种情况，Network 中 fonts.css 与实际使用的 WOFF2 返回 200/304、正确 MIME，无 CORS/解码错误。
2. 在线/离线聊天、角色名、阅读正文、美化预览、音乐标题/with、调香签名等组件的 Rendered Fonts；computed font-family 只能证明声明，不能证明实际渲染字体。
3. 测试文字：线上线下角色音乐阅读调香 ABCabc 0123 ，。！？；装饰英文另用 Iris Music with，签名使用角色中文名。
4. 开关输入状态、进入长聊天/阅读、重开 PWA，确认字形稳定且原布局没有明显跳动。字体完成加载后的极小度量差异仍需设备验证。
5. 测试已保存的自定义 @import/@font-face 和阅读导入 WOFF2/WOFF/TTF/OTF；第三方自定义字体的可达性及授权仍由实际来源决定。

## 自定义页面字体的应用链路补充

代码确认：`#chatTitle .chat-character-name` 和 `.forum-page-subtitle` 的默认
`font-family` 使用 `!important`，会阻止常规的用户字体覆盖。只取消这些规则中
字体名称的强制优先级，默认字体、字号、字重及其余样式保持原样。

美化 CSS 的文档根规则现在支持两种应用方式：`body { font-family: ... }`
以及酒馆常见的 `:root { --mainFontFamily: ... }`。处理器在相同条件规则内，
为明确列出的文字组件生成低优先级字体应用规则，避免正文、标题、输入区因
各自的固定字体而完全不跟随页面字体。单组件自定义规则仍然优先；Font Awesome、
Material Icons 及常见图标字体类排除在应用范围之外。未指定页面字体时不生成
这些规则，也不替换系统字体或现有本地字体。

`@import`、字体分片和 `@font-face` 继续保留，预览与实际应用经过同一处理器。
更新教程中禁止外部字体的旧提示。没有新增诊断入口、依赖或缓存清理。

验证：字体与类名相关自动检查 19 项通过，JavaScript 语法及 diff 检查通过。
此结果确认应用链路与本地资源的代码行为，不能证明 Android 真机上的网络请求
和最终渲染已经正常；尚未进行 Android 真机验证，不能把固定声明覆盖认定为
所有 Android 设备字体失败的唯一原因。
