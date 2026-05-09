# file-preview-kit

[English](README.md) | [中文](#file-preview-kit)

`file-preview-kit` 是一个纯前端的 TypeScript 单仓库，用 Web Components 进行远程文件预览。它强调浏览器端渲染、清晰的包边界和插件式架构，目前正围绕实用的 `v1.0-prep` 发布阶段做加固。

## 重要：远程文件源要求

`file-preview-kit` 会直接在浏览器里抓取可预览文件。因此，远程文件 URL 必须是浏览器可读取的，而不只是“在另一个标签页里能打开”。把宿主应用部署到 `https` 也不会自动消除跨域限制。

为了更稳定地用于生产环境，建议优先使用：

- 与宿主应用同源的文件
- 由你控制的对象存储或 CDN，并配置正确的 `CORS` 响应头
- 由后端代理转发第三方文件，并以应用自身域名重新提供

如果文件源存在以下情况，远程预览仍然可能返回 `failed to fetch`：

- 缺少或过于严格的 `CORS` 响应头
- `http` / `https` 协议不匹配
- 不适合直接浏览器抓取的鉴权要求
- 不稳定的第三方端点或防盗链策略

如果产品需要稳定的远程预览，请预先设计受控的文件分发层，例如同源文件、对象存储/CDN，或后端代理。

## 覆盖范围

- 只做远程 URL 预览
- 以 Web Components 为核心
- 纯浏览器运行，不做服务端转换
- 不支持编辑
- 不支持旧版 `doc` / `xls` / `ppt`
- 内置支持 PDF、文本、Markdown、JSON、XML、YAML、CSV、代码、图片、音频、视频、`docx`、`xlsx`、`pptx`

## 包

- `@file-preview-kit/shared`：共享预览协议与类型
- `@file-preview-kit/core`：归一化、插件注册表、服务层和内置插件
- `@file-preview-kit/web-components`：`file-preview` 自定义元素

## 安装

安装自定义元素：

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
  - `docx`：通过 Mammoth 提取并清洗 HTML / 正文，同时展示转换警告
  - `xlsx`：通过 SheetJS 渲染结构化工作表表格，并为稳定性限制工作表、行数和列数
  - `pptx`：通过 JSZip 提取幻灯片文本
- 回退状态：对暂不支持的文件显示友好提示

## 开源库致谢

`file-preview-kit` 明确建立在多项优秀开源库之上，而不是重复实现已经成熟的预览基础能力。

当前重点依赖包括：

- `pdf.js`：用于 PDF 渲染
- `Mammoth`：用于 `docx` 提取
- `SheetJS`：用于 `xlsx` 解析
- `JSZip`：用于 `pptx` 等基于压缩包格式的读取
- `marked`、`DOMPurify`、`highlight.js`：用于 Markdown 与代码展示

这个项目今天能做到现在这一步，离不开这些上游维护者的长期工作。README 公开时会明确保留这部分致谢。

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

元素属性适合简单的 HTML 嵌入：

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

如果需要动态鉴权或按文件定制请求，可以提供 `resolveRequest`：

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
- 元素属性与 `requestConfig` 会合并；如果两边都提供，以属性对应的 `requestConfig` 属性为准
- 元素属性覆盖简单请求字段（`headers`、`credentials`、`auth-token`、`auth-scheme`），`requestConfig` 属性则提供完整的嵌套配置面，例如 `office.workbook`
- `resolveRequest` 会在默认请求和单文件请求合并后执行，适合做 token 刷新或按 URL 调整鉴权
- `authToken` 只会为基于 `fetch` 的预览自动注入 `Authorization`；如果你已经在 `headers` 里显式写了 `Authorization`，显式值优先生效

## Office 预览边界

- `docx`、`xlsx`、`pptx` 都是“可读预览”，不是版式高保真的 Office 渲染器
- `xlsx` 预览为了稳定性会限制可见工作表标签、行数和列数，这些限制可通过 `requestConfig.office.workbook` 调整
- `docx` 输出会在插入前清洗，危险 HTML 会被移除
- `pptx` 目前侧重提取幻灯片文本，不追求版式或嵌入媒体

## 本地开发

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
pnpm pack:check
```

## 发布说明

- 已发布的包是 `@file-preview-kit/shared`、`@file-preview-kit/core` 和 `@file-preview-kit/web-components`
- 包元数据已包含 repository、bugs 和 homepage 链接
- 使用 `pnpm pack:check` 验证 tarball 生成
- 公共演示说明见 [PUBLIC_DEMO_NOTE.md](PUBLIC_DEMO_NOTE.md)
- 公共发布资源见 [PUBLIC_LAUNCH_ASSETS.md](PUBLIC_LAUNCH_ASSETS.md)
- 最终截图流程见 [SCREENSHOT_CHECKLIST.md](SCREENSHOT_CHECKLIST.md)
- 最终发布检查见 [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- 其他发布风险与公开演示说明见 [RELEASE_READINESS.md](RELEASE_READINESS.md)

## 文档

- 英文：[README.md](README.md)
- 中文：当前文件

## 说明

- 远程预览仍然依赖浏览器的 CORS 规则
- 远程文件源必须是浏览器可读取的，而不只是“在另一个标签页里能打开”
- 把宿主应用部署到 `https` 也不会自动消除跨域限制
- 最可靠的生产方案是同源文件、带正确 CORS 的对象存储/CDN，或者后端代理
- 浏览器凭据和请求头不能强行访问不允许跨域请求的 URL
- PDF 支持会引入较大的可选 `pdf.js` worker 资源
- Office 预览优先保证可读性，而不是版式还原
- 公共演示 URL 是轻量示例，后续可能变化
