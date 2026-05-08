# file-preview-kit

[English](#file-preview-kit) | [中文](#中文)

`file-preview-kit` is a pure-frontend TypeScript monorepo for remote file preview using Web Components. It is designed for browser-only rendering, clean package boundaries, and a plugin-driven architecture that can grow from a solid v0.1 base toward a more complete v1.

## Scope

- Remote URL preview only
- Web Components first
- Pure browser runtime, no server-side conversion
- No editing
- No legacy `doc` / `xls` / `ppt`
- Initial support: PDF, text, markdown, JSON, XML, YAML, CSV, code, images, audio, video
- Basic Open XML support: `docx`, `xlsx`, `pptx`

## Monorepo layout

- `packages/shared`: shared file preview contracts and types
- `packages/core`: normalization, registry, service layer, and built-in plugins
- `packages/web-components`: the `file-preview` custom element
- `apps/demo`: Vite-based demo app
- `tests`: Vitest coverage for core behavior

## Current previewers

- PDF: `pdf.js` canvas rendering with page navigation
- Markdown: rendered HTML with sanitization
- Structured text: plain text, JSON, XML, YAML, CSV
- Code: syntax-highlighted source preview
- Media: image, audio, video
- Office Open XML:
  - `docx`: HTML/text extraction via Mammoth
  - `xlsx`: worksheet rendering via SheetJS
  - `pptx`: slide text extraction via JSZip
- Fallback: a friendly unsupported state

## Core architecture

1. `@file-preview-kit/shared` defines the file source and plugin contracts.
2. `@file-preview-kit/core` normalizes remote URLs, resolves the best plugin, and renders preview nodes.
3. `@file-preview-kit/web-components` wraps the core service in a standalone `file-preview` custom element.

Heavy format handlers are lazy-loaded so consumers only download what they actually use.

## Remote request configuration

Preview fetches can be configured at both the service and element levels.

### Service-level defaults

```ts
import { FilePreviewService } from "@file-preview-kit/core";

const service = new FilePreviewService({
  defaultRequest: {
    credentials: "include",
    headers: {
      "X-App": "preview-demo"
    }
  },
  async fetcher(input, init, context) {
    return fetch(input, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers).entries()),
        "X-Preview-Source": context.source.normalizedName
      }
    });
  }
});
```

### Element-level request config

```ts
const preview = document.createElement("file-preview") as HTMLElement & {
  requestConfig?: {
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
    authToken?: string;
  };
};

preview.requestConfig = {
  credentials: "include",
  headers: {
    "X-Document-Scope": "private"
  },
  authToken: "token-value"
};
preview.setAttribute("src", "https://example.com/private.pdf");
```

For declarative usage, the element also supports:

- `headers='{"X-Test":"1"}'`
- `credentials="include"`
- `auth-token="..."`
- `auth-scheme="Bearer"`

## Getting started

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## Example

```ts
import { registerFilePreviewElement } from "@file-preview-kit/web-components";

registerFilePreviewElement();

const preview = document.createElement("file-preview");
preview.setAttribute("src", "https://example.com/readme.md");
document.body.append(preview);
```

## Extending the registry

```ts
import { FilePreviewService } from "@file-preview-kit/core";

const service = new FilePreviewService();

service.register({
  descriptor: {
    id: "custom-binary",
    kind: "unknown",
    label: "Custom",
    priority: 120,
    extensions: ["custom"]
  },
  canPreview({ source }) {
    return source.extension === "custom";
  },
  async render({ source }) {
    const node = document.createElement("div");
    node.textContent = `Rendered ${source.normalizedName}`;
    return node;
  }
});
```

## CORS notes

The library fetches remote content directly in the browser, so successful preview depends on the target URL allowing cross-origin access. Media elements may still work in some cases where text or binary fetches do not, but browser policy remains the main constraint for remote sources.

## Current limitations

- `docx`, `xlsx`, and `pptx` previews prioritize readable extracted content over layout fidelity
- No editing, annotations, or server-side conversion
- `pdf.js` worker bundling adds a large optional asset for PDF support

## Near-term roadmap

- Improve Office preview fidelity and pagination
- Add package-level README files and publish automation
- Add more behavioral and visual tests
- Continue refining large optional chunks such as PDF and spreadsheet preview

## 中文

`file-preview-kit` 是一个纯前端的 TypeScript 单仓库项目，目标是通过 Web Components 预览远程 URL 文件。这个项目从一开始就围绕浏览器端运行、清晰的包边界和插件化架构来设计，先打好 v0.1 基础，再逐步走向更完整的 v1。

### 范围

- 只做远程 URL 预览
- 以 Web Components 为主
- 纯浏览器运行，不做服务端转换
- 不支持编辑
- 不支持旧格式 `doc` / `xls` / `ppt`
- 当前支持：PDF、文本、Markdown、JSON、XML、YAML、CSV、代码、图片、音频、视频
- 基础支持 Open XML：`docx`、`xlsx`、`pptx`

### 仓库结构

- `packages/shared`：共享的文件预览契约和类型
- `packages/core`：归一化、注册表、服务层和内置插件
- `packages/web-components`：`file-preview` 自定义元素
- `apps/demo`：基于 Vite 的演示应用
- `tests`：核心行为的 Vitest 测试

### 已实现的预览能力

- PDF：使用 `pdf.js` 进行画布渲染，并支持翻页
- Markdown：渲染为 HTML，并做基础清洗
- 结构化文本：纯文本、JSON、XML、YAML、CSV
- 代码：带基础语法高亮的源码预览
- 媒体：图片、音频、视频
- Office Open XML：
  - `docx`：通过 Mammoth 提取 HTML/正文
  - `xlsx`：通过 SheetJS 渲染工作表
  - `pptx`：通过 JSZip 提取幻灯片文本
- 回退态：对不支持的文件显示友好提示

### 核心设计

1. `@file-preview-kit/shared` 定义文件源和插件契约。
2. `@file-preview-kit/core` 负责远程 URL 归一化、最佳插件选择和预览节点渲染。
3. `@file-preview-kit/web-components` 将核心服务包装成独立的 `file-preview` 自定义元素。

大体积格式处理器采用按需加载，这样使用方只会下载自己真正需要的格式代码。

### 远程请求配置

预览请求既可以在服务层统一配置，也可以在元素层单独配置。

#### 服务层默认配置

```ts
import { FilePreviewService } from "@file-preview-kit/core";

const service = new FilePreviewService({
  defaultRequest: {
    credentials: "include",
    headers: {
      "X-App": "preview-demo"
    }
  },
  async fetcher(input, init, context) {
    return fetch(input, {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers).entries()),
        "X-Preview-Source": context.source.normalizedName
      }
    });
  }
});
```

#### 元素层请求配置

```ts
const preview = document.createElement("file-preview") as HTMLElement & {
  requestConfig?: {
    credentials?: RequestCredentials;
    headers?: Record<string, string>;
    authToken?: string;
  };
};

preview.requestConfig = {
  credentials: "include",
  headers: {
    "X-Document-Scope": "private"
  },
  authToken: "token-value"
};
preview.setAttribute("src", "https://example.com/private.pdf");
```

声明式使用时，组件也支持：

- `headers='{"X-Test":"1"}'`
- `credentials="include"`
- `auth-token="..."`
- `auth-scheme="Bearer"`

### 开始使用

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

### 示例

```ts
import { registerFilePreviewElement } from "@file-preview-kit/web-components";

registerFilePreviewElement();

const preview = document.createElement("file-preview");
preview.setAttribute("src", "https://example.com/readme.md");
document.body.append(preview);
```

### 扩展示例

```ts
import { FilePreviewService } from "@file-preview-kit/core";

const service = new FilePreviewService();

service.register({
  descriptor: {
    id: "custom-binary",
    kind: "unknown",
    label: "Custom",
    priority: 120,
    extensions: ["custom"]
  },
  canPreview({ source }) {
    return source.extension === "custom";
  },
  async render({ source }) {
    const node = document.createElement("div");
    node.textContent = `Rendered ${source.normalizedName}`;
    return node;
  }
});
```

### CORS 说明

这个库会在浏览器里直接抓取远程内容，因此能否预览成功取决于目标 URL 是否允许跨域访问。媒体文件有时还能靠浏览器原生标签显示，但文本、二进制和 Office 预览通常更依赖 fetch 成功。

### 当前限制

- `docx`、`xlsx`、`pptx` 目前更偏“可读预览”，不是高保真版式还原
- 不支持编辑、批注或服务端转换
- `pdf.js` 会带来较大的可选 worker 资源

### 后续路线

- 提升 Office 预览的版式与分页能力
- 增加包级 README 和发布自动化
- 增加更多行为测试和视觉测试
- 继续优化 PDF、表格等大体积可选模块的拆分策略
