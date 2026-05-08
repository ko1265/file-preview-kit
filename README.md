# file-preview-kit

[English](#file-preview-kit) | [中文](README.zh.md)

`file-preview-kit` is a pure-frontend TypeScript monorepo for remote file preview using Web Components. It is built around browser-only rendering, clean package boundaries, and a plugin-driven architecture that can grow from a solid v0.1 base toward a more complete v1.

## What it covers

- Remote URL preview only
- Web Components first
- Pure browser runtime, no server-side conversion
- No editing
- No legacy `doc` / `xls` / `ppt`
- Initial support: PDF, text, markdown, JSON, XML, YAML, CSV, code, images, audio, video
- Basic Open XML support: `docx`, `xlsx`, `pptx`

## Packages

- `packages/shared`: shared file preview contracts and types
- `packages/core`: normalization, registry, service layer, and built-in plugins
- `packages/web-components`: the `file-preview` custom element
- `apps/demo`: Vite-based demo app
- `tests`: Vitest coverage for core behavior

## Previewers

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

## Request config

Preview fetches can be configured at both the service and element levels.

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

## Docs

- English: this file
- Chinese: [README.zh.md](README.zh.md)

