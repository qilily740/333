# Iris 字体资源与许可证

这些文件是项目原来使用的字体，不是替代字体。保留原有字体资源、字号、字重、样式及排版规则。5.7.2 在依赖 Snell Roundhand / Apple Chancery 的英文组件中，将原有 Great Vibes 网页字体加入系统花体之后、通用字体之前的后备位置；系统字体仍优先，用户指定的组件字体不被强制覆盖。

- `lxgw-1.522/`：原 `https://fontsapi.zeoseven.com/292/main/result.css` 中的 **LXGW WenKai Regular 1.522**，完整保留 237 个 WOFF2 分片和 Unicode 范围。移除 `local()`，确保各系统优先使用相同文件。许可见 `OFL-LXGW-WenKai-1.522.txt`。
- `lxgw-legacy/`：原 `lxgw-wenkai-webfont@1.1.0` 的 WenKai Light 300、Bold 700、WenKai Mono Light/Regular/Bold，以及新版 Regular 没有覆盖的旧版字符。所有保留声明对应的分片均已保存；Regular 重叠字符由原本后加载的 1.522 版本负责，消除同字重、同字符的版本冲突。对原声明中超出实际 cmap 的字符范围按文件字形表取交集，空范围不再注册；原字体文件仍完整保留。字体许可见 `OFL-LXGW-Webfont-1.1.0.txt`；CSS 包装代码许可见 `LICENSE-LXGW-Webfont.txt`。
- `great-vibes/`：原 Google Fonts CSS 返回的 Great Vibes Regular 字体；保留原 TTF，并转换为 WOFF2 优先加载。许可见 `OFL-Great-Vibes.txt`。
- `ma-shan-zheng/`：原 Google Fonts CSS 返回的 Ma Shan Zheng Regular 字体；保留原 TTF，并转换为 WOFF2 优先加载。许可见 `OFL-Ma-Shan-Zheng.txt`。
- `iris-kai.woff2`：项目原有 LXGW WenKai Lite Regular 1.522，继续以原名 `Iris Kai` 在 `style.css` 声明，作为文楷备用字体。原有 `OFL-LXGW-WenKai.txt` 保留。

`fonts.css` 不含外部请求、嵌套 @import 或平台条件，只注册字体，不选择页面组件。分片仍由浏览器按实际字符按需请求，不会一次性下载所有字体。`sources.json` 记录源 URL、文件大小、SHA-256 以及采集时响应头，供完整性核对。格式转换不修改轮廓、字形映射、名称或设计字重。字体检查工具仅安装在临时目录，不是项目运行依赖。

`Snell Roundhand`、`Apple Chancery`、`Songti SC`、`Georgia`、`KaiTi` 等系统字体不在这个目录。项目没有可分发的相应文件或授权，本次保留其原有回退链，不用另一种字体冒充；没有这些系统字体的设备仍可能呈现不同视觉效果。

缓存：`index.html` 通过 `assets/fonts/fonts.css?v=2` 注册字体，字体分片保留源文件名；字体内容升级应更新 CSS 查询版本及发生变动的字体文件名。项目未发现 Service Worker 注册或应用字体 Cache API，不清除任何用户数据。
