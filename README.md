# file-preview-kit

`file-preview-kit` is a pure-frontend TypeScript monorepo for remote file preview using Web Components. The current v0.1 foundation focuses on production-friendly architecture first: clean package boundaries, a plugin registry, lazy-loaded format handlers, a reusable custom element, a working demo, and baseline tests.

## Scope

- Remote URL preview only
- Web Components first
- Pure browser runtime, no server-side conversion
- No editing
- No legacy `doc` / `xls` / `ppt`
- Initial support: PDF, text, markdown, JSON, XML, YAML, CSV, code, images, audio, video
- Basic Open XML support: `docx`, `xlsx`, `pptx`

## Monorepo layout

- `packages/shared`: core shared types
- `packages/core`: preview normalization, registry, service, and built-in plugins
- `packages/web-components`: `file-preview` custom element
- `apps/demo`: Vite demo app
- `tests`: basic Vitest coverage

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
- Fallback: user-facing unsupported state

## Core architecture

1. `@file-preview-kit/shared` defines file source and plugin contracts.
2. `@file-preview-kit/core` normalizes remote URLs, resolves the best plugin, and renders preview nodes.
3. `@file-preview-kit/web-components` wraps the core service in a standalone `file-preview` custom element.

Heavy format handlers are lazy-loaded so applications only download the code they need for the file types they actually preview.

## Remote request configuration

Preview fetches are configurable at both the service and element levels.

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

For declarative usage, the custom element also supports:

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

The library fetches remote content directly in the browser. That means preview success depends on the target URL sending compatible CORS headers. Media elements may still work in some cases where text or binary fetches do not, but browser policy remains the main constraint for remote sources.

## Current limitations

- `docx`, `xlsx`, and `pptx` previews prioritize readable extracted content over layout fidelity.
- No editing, annotations, or server-side conversion.
- `pdf.js` worker bundling adds a large optional asset for PDF support.

## Near-term roadmap

- Improve Office preview fidelity and pagination
- Add package-level README files and publish automation
- Add more behavioral and visual tests
- Continue refining large optional chunks such as PDF and spreadsheet preview
