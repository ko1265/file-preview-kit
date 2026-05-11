# file-preview-kit

[English](#file-preview-kit) | [中文](README.zh.md)

`file-preview-kit` is a pure-frontend TypeScript monorepo for remote file preview using Web Components. It is built around browser-only rendering, clean package boundaries, and a plugin-driven architecture that is being hardened toward a practical `v1.0-prep` release.

## Important: remote file access requirements

`file-preview-kit` fetches previewable files directly in the browser. A remote file URL must therefore be browser-readable, not just publicly reachable in a separate tab. Deploying your app on `https` does not automatically remove cross-origin restrictions.

For reliable production use, prefer:

- same-origin files served by the host application
- user-controlled object storage or CDN with correct `CORS` headers
- a backend proxy that re-serves third-party files under the app's own domain

Remote preview can still fail with `failed to fetch` when the file source has:

- missing or restrictive `CORS` headers
- `http` / `https` protocol mismatch
- auth requirements that are not compatible with direct browser fetches
- unstable third-party endpoints or anti-hotlink protections

If your product needs stable remote preview, plan for a controlled file distribution layer such as same-origin files, object storage/CDN, or a backend proxy.

## What it covers

- Remote URL preview only
- Web Components first
- Pure browser runtime, no server-side conversion
- No editing
- No legacy `doc` / `xls` / `ppt`
- Built-in support for PDF, text, markdown, JSON, XML, YAML, CSV, code, images, audio, video, `docx`, `xlsx`, and `pptx`

## Packages

- `@ko1265/file-preview-kit-shared`: shared preview contracts and types
- `@ko1265/file-preview-kit-core`: normalization, registry, service layer, and built-in plugins
- `@ko1265/file-preview-kit-web-components`: the `file-preview` custom element

## Install

For the custom element:

```bash
pnpm add @ko1265/file-preview-kit-web-components
```

For the service and plugin registry directly:

```bash
pnpm add @ko1265/file-preview-kit-core
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

## Open-source credits

`file-preview-kit` deliberately builds on top of several strong open-source libraries instead of re-implementing mature preview primitives from scratch.

Key upstream dependencies include:

- `pdf.js` for PDF rendering
- `Mammoth` for `docx` extraction
- `SheetJS` for `xlsx` parsing
- `JSZip` for archive-based Office formats such as `pptx`
- `marked`, `DOMPurify`, and `highlight.js` for markdown and code presentation

This project benefits directly from the work of those maintainers, and the public README should acknowledge that clearly.

## Public demo

The demo intentionally focuses on a small set of release-representative scenarios:

- Public URL preview from a remote README
- Auth-shaped request handling with `requestConfig`
- Office `docx`, `xlsx`, and `pptx` extraction previews
- Native media previews for image, audio, and video

The Office demo scenes use local static samples so release screenshots do not depend on unstable third-party files.

The auth example is there to show request shaping, not to promise that any single public endpoint will stay available forever.

If the release visual needs a refresh, use [LAUNCH_ASSET.svg](LAUNCH_ASSET.svg) together with [SCREENSHOT_CHECKLIST.md](SCREENSHOT_CHECKLIST.md) and its manual fallback path.

## Quick start

```ts
import { registerFilePreviewElement } from "@ko1265/file-preview-kit-web-components";

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
- The custom element emits `file-preview:loadstart`, `file-preview:load`, and `file-preview:error` on the element itself so host apps can reflect loading state or surface failures.

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
pnpm pack:verify
pnpm smoke:consumer
```

`pnpm smoke:consumer` builds the publishable packages, packs local tarballs, installs them into a clean sample app, and verifies that an external consumer can import `@ko1265/file-preview-kit-core` and `@ko1265/file-preview-kit-web-components`.

## Release notes

- The published packages are `@ko1265/file-preview-kit-shared`, `@ko1265/file-preview-kit-core`, and `@ko1265/file-preview-kit-web-components`.
- Package metadata now includes repository, bugs, and homepage links.
- Tarball generation is verified with `pnpm pack:verify`.
- A repeatable packed-tarball consumer check is available via `pnpm smoke:consumer`.
- Public demo framing is captured in [PUBLIC_DEMO_NOTE.md](PUBLIC_DEMO_NOTE.md).
- Public launch assets are captured in [PUBLIC_LAUNCH_ASSETS.md](PUBLIC_LAUNCH_ASSETS.md).
- Final release review path is captured in [SCREENSHOT_CHECKLIST.md](SCREENSHOT_CHECKLIST.md).
- Final release checks are captured in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).
- Release-readiness gaps and public demo framing are tracked in [RELEASE_READINESS.md](RELEASE_READINESS.md).

## Docs

- English: this file
- Chinese: [README.zh.md](README.zh.md)

## Notes

- Remote preview still depends on browser CORS rules
- Remote file sources must be browser-readable, not just public in a separate tab
- Deploying the host app on `https` does not remove cross-origin fetch restrictions by itself
- The most reliable production setup is same-origin files, object storage/CDN with correct CORS, or a backend proxy
- Browser credentials and headers cannot force access to cross-origin URLs that do not allow the request
- PDF support includes a larger optional `pdf.js` worker asset
- Office previews favor readable extracted content over layout-faithful reproduction
- Public demo URLs are intentionally lightweight and may change over time
