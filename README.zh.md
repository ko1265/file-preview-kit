# file-preview-kit

[English](README.md) | [中文](#file-preview-kit)

`file-preview-kit` 是一个纯前端 TypeScript 单仓库，用于通过 Web Components 预览远程 URL 文件。项目坚持浏览器端运行、清晰的包边界和插件式架构，目前正在围绕实用的 `v0.2` 做发布前加固。

## 能力范围

- 只做远程 URL 预览
- 以 Web Components 为主
- 纯浏览器运行，不做服务端转换
- 不支持编辑
- 不支持旧版 `doc` / `xls` / `ppt`
- 内置支持 PDF、文本、Markdown、JSON、XML、YAML、CSV、代码、图片、音频、视频、`docx`、`xlsx`、`pptx`

## 包结构

- `@file-preview-kit/shared`：共享类型与预览契约
- `@file-preview-kit/core`：URL 归一化、插件注册表、服务层与内置预览器
- `@file-preview-kit/web-components`：`file-preview` 自定义元素

## 安装

使用自定义元素：

```bash
pnpm add @file-preview-kit/web-components
```

直接使用服务层和插件注册表：

```bash
pnpm add @file-preview-kit/core
```

## 预览器

- PDF：基于 `pdf.js` 的 canvas 渲染，支持翻页、缩放和新标签打开原文件
- Markdown：渲染为已清洗的 HTML
- 结构化文本：纯文本、JSON、XML、YAML、CSV
- 代码：基础语法高亮
- 媒体：图片、音频、视频
- Office Open XML：
  - `docx`：通过 Mammoth 提取并清洗 HTML / 正文，同时显示转换警告
  - `xlsx`：通过 SheetJS 渲染结构化工作表表格，并为稳定性限制工作表、行数和列数
  - `pptx`：通过 JSZip 提取幻灯片文本
- 回退态：对暂不支持的文件显示友好提示

## 快速开始

```ts
import { registerFilePreviewElement } from "@file-preview-kit/web-components";

registerFilePreviewElement();

const preview = document.createElement("file-preview");
preview.setAttribute("src", "https://example.com/readme.md");
document.body.append(preview);
```

## 请求配置

预览请求既可以在服务层统一配置，也可以在元素实例上单独配置。

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

如果需要做动态鉴权或按文件定制请求，可以提供 `resolveRequest`：

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
- 元素属性和 `requestConfig` 属性会合并；如果两边都提供，属性值 `requestConfig` 优先
- `resolveRequest` 会在默认请求与单文件请求合并后运行，适合做 token 刷新或按 URL 动态调整鉴权
- `authToken` 只会为基于 `fetch` 的预览自动注入 `Authorization`；如果你在 `headers` 里显式写了 `Authorization`，显式值优先

## Office 预览边界

- `docx`、`xlsx`、`pptx` 都是“可读预览”，不是版式高保真还原
- `xlsx` 预览为了稳定性会限制可见工作表标签、行数和列数，这些限制可通过 `requestConfig.office.workbook` 调整
- `docx` 输出在插入前会经过清洗，危险 HTML 会被移除
- `pptx` 当前重点是抽取幻灯片文本，不追求布局或嵌入媒体还原

## 本地开发

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
pnpm pack:check
```

## 发布说明

- 可发布包为 `@file-preview-kit/shared`、`@file-preview-kit/core`、`@file-preview-kit/web-components`
- 包元数据已包含 repository、bugs、homepage 链接
- 通过 `pnpm pack:check` 验证 tarball 生成

## 文档

- 英文： [README.md](README.md)
- 中文：当前文件

## 说明

- 远程预览仍然依赖浏览器的 CORS 行为
- 浏览器凭据和请求头不能绕过目标 URL 自身不允许的跨域限制
- PDF 支持会引入较大的可选 `pdf.js` worker 资源
- Office 预览优先保证可读性，而不是追求版式还原
