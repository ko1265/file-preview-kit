# file-preview-kit

[English](README.md) | [中文](#中文)

`file-preview-kit` 是一个纯前端的 TypeScript 单仓库项目，目标是通过 Web Components 预览远程 URL 文件。这个项目从一开始就围绕浏览器端运行、清晰的包边界和插件化架构来设计，先打好 v0.1 基础，再逐步走向更完整的 v1。

## 范围

- 只做远程 URL 预览
- 以 Web Components 为主
- 纯浏览器运行，不做服务端转换
- 不支持编辑
- 不支持旧格式 `doc` / `xls` / `ppt`
- 当前支持：PDF、文本、Markdown、JSON、XML、YAML、CSV、代码、图片、音频、视频
- 基础支持 Open XML：`docx`、`xlsx`、`pptx`

## 仓库结构

- `packages/shared`：共享的文件预览契约和类型
- `packages/core`：归一化、注册表、服务层和内置插件
- `packages/web-components`：`file-preview` 自定义元素
- `apps/demo`：基于 Vite 的演示应用
- `tests`：核心行为的 Vitest 测试

## 已实现的预览能力

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

## 核心设计

1. `@file-preview-kit/shared` 定义文件源和插件契约。
2. `@file-preview-kit/core` 负责远程 URL 归一化、最佳插件选择和预览节点渲染。
3. `@file-preview-kit/web-components` 将核心服务包装成独立的 `file-preview` 自定义元素。

大体积格式处理器采用按需加载，这样使用方只会下载自己真正需要的格式代码。

## 远程请求配置

预览请求既可以在服务层统一配置，也可以在元素层单独配置。

```ts
import { FilePreviewService } from "@file-preview-kit/core";

const service = new FilePreviewService({
  defaultRequest: {
    credentials: "include",
    headers: {
      "X-App": "preview-demo"
    }
  }
});
```

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
```

## 开始使用

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## 示例

```ts
import { registerFilePreviewElement } from "@file-preview-kit/web-components";

registerFilePreviewElement();

const preview = document.createElement("file-preview");
preview.setAttribute("src", "https://example.com/readme.md");
document.body.append(preview);
```

## 文档

- 英文版：`README.md`
- 中文版：此文件

## CORS 说明

这个库会在浏览器里直接抓取远程内容，因此能否预览成功取决于目标 URL 是否允许跨域访问。媒体文件有时还能靠浏览器原生标签显示，但文本、二进制和 Office 预览通常更依赖 fetch 成功。

## 当前限制

- `docx`、`xlsx`、`pptx` 目前更偏“可读预览”，不是高保真版式还原
- 不支持编辑、批注或服务端转换
- `pdf.js` 会带来较大的可选 worker 资源

