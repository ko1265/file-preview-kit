# file-preview-kit

[English](README.md) | [中文](#file-preview-kit)

`file-preview-kit` 是一个纯前端 TypeScript monorepo，用 Web Components 做远程文件预览。它围绕浏览器端渲染、清晰的包边界和可组合的插件式架构设计，目前已经收口到项目的 `v1.0` 稳定基线。

## 重要：远程文件源要求

`file-preview-kit` 会直接在浏览器里抓取并预览文件，所以远程文件 URL 必须是“浏览器可读取”的，而不只是“能在新标签页打开”。

把宿主应用部署到 `https` 并不会自动消除跨域限制。生产环境里更稳妥的方案是：

- 与宿主应用同源的文件
- 由你控制的对象存储或 CDN，并正确配置 `CORS`
- 由后端代理转发第三方文件，并用你自己的域名重新提供

如果文件源存在以下情况，远程预览仍然可能失败并返回 `failed to fetch`：

- 缺少或过于严格的 `CORS` 响应头
- `http` / `https` 协议不匹配
- 不适合浏览器直接抓取的鉴权方式
- 不稳定的第三方端点或防盗链策略

如果你的产品需要稳定的远程预览能力，请预先设计一层受控的文件分发方案。

## 覆盖范围

- 只做远程 URL 预览
- 以 Web Components 为优先接入方式
- 纯浏览器运行，不做服务端转换
- 不支持编辑
- 不支持旧格式 `doc` / `xls` / `ppt`
- 内置支持 PDF、文本、Markdown、JSON、XML、YAML、CSV、代码、图片、音频、视频、`docx`、`xlsx`、`pptx`

## 包

- `@ko1265/file-preview-kit-shared`：共享预览协议与类型
- `@ko1265/file-preview-kit-core`：归一化、插件注册表、服务层和内置插件
- `@ko1265/file-preview-kit-web-components`：`file-preview` 自定义元素
- `@ko1265/file-preview-kit-react`：仓库内的 v2.0 React 适配候选包
- `@ko1265/file-preview-kit-vue`：仓库内的 v2.0 Vue 适配候选包
- `@ko1265/file-preview-kit-svelte`：仓库内的 v2.0 Svelte action 适配候选包

React、Vue 和 Svelte 适配包只有在完成真实 npm 发布与 registry 验证之后，才会列为已发布 npm 包。

Angular 当前仍是基于 Web Component 的文档化接入路径，还不是独立适配包。见 [Framework Integration Notes](docs/frameworks/README.md)。

## 安装

安装自定义元素：

```bash
pnpm add @ko1265/file-preview-kit-web-components
```

直接使用服务层与插件注册：

```bash
pnpm add @ko1265/file-preview-kit-core
```

## 浏览器端说明

`@ko1265/file-preview-kit-web-components` 是浏览器端 / client-only 包。

- 不要在纯 Node.js 路径里直接执行它
- 在 Next.js、Nuxt 或其它 SSR 应用里，应把它放在明确的 client boundary 之后使用

## 预览能力

- PDF：基于 `pdf.js` 的 canvas 渲染，带页码导航、缩放和新标签页打开
- Markdown：渲染为经过清洗的 HTML
- 结构化文本：纯文本、JSON、XML、YAML、CSV
- 代码：带语法高亮的源码预览
- 媒体：图片、音频、视频
- Office Open XML：
  - `docx`：通过 Mammoth 提取并清洗 HTML / 文本，同时把转换警告展示出来
  - `xlsx`：通过 SheetJS 把工作表渲染成结构化表格，并做 sheet / 行列截断保证稳定性
  - `pptx`：通过 JSZip 提取幻灯片文本
- Fallback：友好的“不支持”状态

## 开源依赖说明

`file-preview-kit` 有意建立在成熟开源组件之上，而不是重复造轮子。

关键上游依赖包括：

- `pdf.js`：PDF 渲染
- `Mammoth`：`docx` 提取
- `SheetJS`：`xlsx` 解析
- `JSZip`：基于压缩包的 Office 格式处理，例如 `pptx`
- `marked`、`DOMPurify`、`highlight.js`：Markdown 和代码展示

## 公开 demo

当前 demo 聚焦于一组足够代表发布面的场景：

- 远程公开 README 预览
- 带 `requestConfig` 的鉴权形态请求
- Office `docx`、`xlsx`、`pptx` 提取预览
- 图片、音频、视频等原生媒体预览

Office demo 使用本地静态样例，避免发布截图依赖不稳定的第三方文件源。

## 快速开始

```ts
import { registerFilePreviewElement } from "@ko1265/file-preview-kit-web-components";

registerFilePreviewElement();

const preview = document.createElement("file-preview");
preview.setAttribute("src", "https://example.com/readme.md");
document.body.append(preview);
```

## 请求配置

预览请求既可以在服务层统一配置，也可以在元素实例上单独配置。

元素属性适合简单 HTML 嵌入：

即使你只是在 HTML 或模板里写 `<file-preview>`，仍然需要在应用启动时先执行一次 `registerFilePreviewElement()`；否则浏览器只会把它当成一个未注册的自定义标签。

```html
<file-preview
  src="https://example.com/private.pdf"
  credentials="include"
  auth-token="token-value"
  auth-scheme="Bearer"
  headers='{"X-Document-Scope":"private"}'
></file-preview>
```

```ts
import { FilePreviewService } from "@ko1265/file-preview-kit-core";

const service = new FilePreviewService({
  defaultRequest: {
    credentials: "include",
    headers: {
      "X-App": "preview-demo"
    }
  }
});
```

如果需要按文件动态调整请求，可提供 `resolveRequest`：

```ts
const service = new FilePreviewService({
  async resolveRequest(source, request) {
    return {
      ...(request ?? {}),
      authScheme: "Bearer",
      headers: {
        ...(request?.headers ?? {}),
        Authorization: `Bearer token-for-${source.normalizedName}`
      }
    };
  }
});
```

```ts
const preview = document.createElement("file-preview") as HTMLElement & {
  requestConfig?: {
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
    authToken?: string;
    authScheme?: string;
    office?: {
      workbook?: {
        maxSheets?: number;
        maxRows?: number;
        maxColumns?: number;
      };
    };
  };
};

preview.requestConfig = {
  credentials: "include",
  headers: {
    "X-Document-Scope": "private"
  },
  authToken: "token-value",
  authScheme: "Bearer",
  office: {
    workbook: {
      maxSheets: 4,
      maxRows: 60,
      maxColumns: 10
    }
  }
};
```

## API 边界

- `requestConfig` 只作用于基于 `fetch` 的预览器，例如文本、Markdown、代码、JSON/XML/YAML/CSV、PDF、`docx`、`xlsx`、`pptx`
- 原生媒体预览器（`img`、`audio`、`video`）直接使用文件 URL，不会附带自定义请求头或鉴权 token
- 元素属性与 `requestConfig` 属性会合并；如果两边都提供，以 `requestConfig` 中对应值为准
- 元素属性覆盖简单请求字段（`headers`、`credentials`、`auth-token`、`auth-scheme`），`requestConfig` 提供完整的嵌套配置面，例如 `office.workbook`
- `resolveRequest` 会在默认请求和单文件请求合并后执行，适合做 token 刷新或按 URL 调整鉴权
- `authToken` 只会为基于 `fetch` 的预览自动注入 `Authorization`；如果你已经在 `headers` 里显式写了 `Authorization`，显式值优先
- 自定义元素会在元素自身上触发 `file-preview:loadstart`、`file-preview:load` 和 `file-preview:error`

最小事件监听示例：

```ts
preview.addEventListener("file-preview:loadstart", () => {
  console.log("preview loading");
});

preview.addEventListener("file-preview:load", () => {
  console.log("preview loaded");
});

preview.addEventListener("file-preview:error", (event) => {
  console.error("preview failed", (event as CustomEvent).detail);
});
```

## Office 预览边界

- `docx`、`xlsx`、`pptx` 都是“可读预览”，不是版式高保真的 Office 渲染器
- `xlsx` 为了稳定性会限制可见工作表标签、行数和列数，可通过 `requestConfig.office.workbook` 调整
- `docx` 输出会在插入前做清洗，危险 HTML 会被移除
- `pptx` 当前侧重提取幻灯片文本，不追求版式或嵌入媒体

## 本地开发

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
pnpm pack:verify
pnpm smoke:consumer
```

`pnpm smoke:consumer` 会构建可发布包、打本地 tarball、安装到一个干净 sample app 里，并在适配包纳入当前范围时验证外部消费者能导入 core、Web Component 和本地适配包公开入口。

## 发布状态

- 仓库现在以 `v1.0.0` 基线公开。
- 最新已发布到 npm 的公开包版本是 `1.0.0`，覆盖 shared、core、Web Components、React、Vue 和 Svelte。
- `0.1.0` 已完成首次公开 npm 发布；框架适配包随 `1.0.0` 发布。
- 当前仓库内容代表项目的 `v1.0` 稳定基线
- 后续版本应优先聚焦于针对性修复和文档跟进，而不是扩大能力面

## 文档

- 英文：[README.md](README.md)
- 中文：当前文件
