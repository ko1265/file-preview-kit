# file-preview-kit

[English](#file-preview-kit) | [中文](README.zh.md)

`file-preview-kit` is a pure-frontend TypeScript monorepo for remote file preview using Web Components. It is built around browser-only rendering, clean package boundaries, and a plugin-driven architecture that is being hardened toward a practical `v0.2`.

## What it covers

- Remote URL preview only
- Web Components first
- Pure browser runtime, no server-side conversion
- No editing
- No legacy `doc` / `xls` / `ppt`
- Built-in support for PDF, text, markdown, JSON, XML, YAML, CSV, code, images, audio, video, `docx`, `xlsx`, and `pptx`

## Packages

- `@file-preview-kit/shared`: shared preview contracts and types
- `@file-preview-kit/core`: normalization, registry, service layer, and built-in plugins
- `@file-preview-kit/web-components`: the `file-preview` custom element

## Install

For the custom element:

```bash
pnpm add @file-preview-kit/web-components
```

For the service and plugin registry directly:

```bash
pnpm add @file-preview-kit/core
```

## Previewers

- PDF: `pdf.js` canvas rendering with page navigation, zoom controls, and open-in-new-tab support
- Markdown: rendered HTML with sanitization
- Structured text: plain text, JSON, XML, YAML, CSV
- Code: syntax-highlighted source preview
- Media: image, audio, video
- Office Open XML:
  - `docx`: sanitized HTML/text extraction via Mammoth, with conversion warnings surfaced inline
  - `xlsx`: structured worksheet table rendering via SheetJS, with sheet and row/column truncation for stability
  - `pptx`: slide text extraction via JSZip
- Fallback: a friendly unsupported state

## Quick start

```ts
import { registerFilePreviewElement } from "@file-preview-kit/web-components";

registerFilePreviewElement();

const preview = document.createElement("file-preview");
preview.setAttribute("src", "https://example.com/readme.md");
document.body.append(preview);
```

## Request config

Preview fetches can be configured at both the service and element levels.

Element attributes are useful for simple HTML embedding:

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

For dynamic auth and per-file request resolution, provide a resolver:

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

## API boundaries

- `requestConfig` applies to fetch-based previewers such as text, markdown, code, JSON/XML/YAML/CSV, PDF, `docx`, `xlsx`, and `pptx`.
- Native media previewers (`img`, `audio`, `video`) use the file URL directly, so custom headers and auth tokens are not attached there.
- Element attributes and the `requestConfig` property are merged, with property values taking precedence when both are present.
- Element attributes cover the simple request fields (`headers`, `credentials`, `auth-token`, `auth-scheme`), while the `requestConfig` property is the complete surface for nested options such as `office.workbook`.
- `resolveRequest` runs after the default request and per-file request are merged, so it is the right place for token refresh or per-URL auth shaping.
- `authToken` only injects an `Authorization` header for fetch-based previews. If you already set `Authorization` in `headers`, that explicit header wins.

## Office preview scope

- `docx`, `xlsx`, and `pptx` are readable browser previews, not fidelity-preserving Office renderers.
- `xlsx` previews intentionally cap visible sheet tabs, rows, and columns for stability. Those limits can be adjusted through `requestConfig.office.workbook`.
- `docx` output is sanitized before insertion, so unsafe embedded HTML is stripped.
- `pptx` currently focuses on extracted slide text rather than layout or embedded media.

## Local development

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
pnpm pack:check
```

## Release notes

- The published packages are `@file-preview-kit/shared`, `@file-preview-kit/core`, and `@file-preview-kit/web-components`.
- Package metadata now includes repository, bugs, and homepage links.
- Tarball generation is verified with `pnpm pack:check`.

## Docs

- English: this file
- Chinese: [README.zh.md](README.zh.md)

## Notes

- Remote preview still depends on browser CORS rules
- Browser credentials and headers cannot force access to cross-origin URLs that do not allow the request
- PDF support includes a larger optional `pdf.js` worker asset
- Office previews favor readable extracted content over layout-faithful reproduction
