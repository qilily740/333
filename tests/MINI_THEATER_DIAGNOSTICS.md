# 线下随机小剧场的本地诊断

本次代码排查未找到真实 AI 生成样本。聊天数据位于浏览器 IndexedDB，项目内测试样例都是人工构造；不能据此判断某个实际作品的失败原因。

以下操作由用户在正在使用的 Iris 页面开发者控制台手动执行。Codex 不启动浏览器或预览。

1. 启用：`IrisMiniTheater.enableDiagnostics()`。立即生效，无需刷新。默认不开启。`window.__IRIS_DEV__ = true` 等价。
2. 保持启用，再在线下模式生成一个新回复，并展开它的小剧场，操作无法响应的按钮。
3. 查看当前聊天的小剧场键：`IrisMiniTheater.diagnosticKeys()`。返回顺序对应当前聊天渲染顺序。
4. 导出最后一个：`IrisMiniTheater.downloadDiagnostics(IrisMiniTheater.diagnosticKeys().at(-1))`。如有多个，传入相应键。
5. 停用：`window.__IRIS_DEV__ = false`。

下载是本地 JSON 文件，不向网络上传。不包含 API Key、完整角色提示词、完整聊天记录或正式正文。包含单个作品的源码，因此该作品自身的虚构姓名、文本等仍可能在文件中；分享前请检查。

导出内容：

- `rendererVersion`：当前诊断实现版本，应为 `mini-diagnostics-3`。缺少此字段/方法说明页面加载的代码没有更新。项目已有 `iris-release` 查询参数会传递给脚本和样式，可手动使用一个新值再刷新以排除资源缓存；不要清空聊天存储。
- `rawExtractedHtml`、`originalHtml`、`finalSrcdoc`：分别为 API 原始回复中提取的作品、当前保存并使用的作品、实际赋给该 iframe 的文档。未展开时 finalSrcdoc 为 null。可逐阶段比较是否截断、转义、改动脚本与配色。
- `generation`：生成时内置提示词指纹、实际发送的小剧场指令指纹与数量。启用诊断后新生成的回复还记录实际发送的“小剧场”提示词块。历史回复没有这些字段，不能倒推出其使用了哪个版本。
- `scripts`、`inlineHandlers`：真实原始脚本源码及类型、async/defer 属性、内联事件。模块和 IIFE 的私有函数不能被全局 onclick 直接访问；本工具不擅自把私有函数导出。
- `runtime`：对应 iframe 的加载、DOM ready 和错误分类记录；最多保存 50 项，不包含错误原文、堆栈或用户输入。

限制：DOM ready 只说明诊断脚本运行到了 DOMContentLoaded，不代表作品脚本执行成功。事件绑定缺失是延迟到 load 后的提示性检查，不能证明某个按钮的业务逻辑正确。CSP 若连诊断脚本也拦截，只能报告“加载后没有 ready”，不能准确归因。iframe error 事件在浏览器中可能不触发。

深色 UI 的判定：先看 rawExtractedHtml 的作品 CSS。如果本来就是深色，属于 AI 输出；若原始浅色而 finalSrcdoc 被改成深色，应排查转换；若 generation 指纹为旧版本或缺失，可能是历史作品，不能当作最新提示词生成结果。Iris 当前注入的基础 CSS 不设作品容器颜色，主页面样式不穿透 iframe。但 html/body 背景被按现有需求强制透明；若 AI 把视觉背景只写在 body 上而没有内容容器，外层聊天背景会透出。这项已正常的透明规则未作修改。

非浏览器测试：

```
node tests/mini-theater.test.cjs
node tests/mini-theater-interaction.test.cjs
node --experimental-vm-modules tests/mini-theater-lifecycle.test.cjs
node tests/mini-theater-instance.test.cjs
node tests/mini-theater-request.test.cjs
```

这些测试使用 DOM 桩和 Node VM；未运行真实浏览器 DOM、CSP、布局命中测试或触屏操作。模块测试验证模块作用域，不代表浏览器模块加载已验证。
