# @file-preview-kit/web-components

Standalone Web Components wrapper for `file-preview-kit`.

## What it contains

- `registerFilePreviewElement`
- the `file-preview` custom element
- request configuration support through attributes and the `requestConfig` property

## Install

```bash
pnpm add @file-preview-kit/web-components
```

## Usage

```ts
import { registerFilePreviewElement } from "@file-preview-kit/web-components";

registerFilePreviewElement();

const preview = document.createElement("file-preview");
preview.setAttribute("src", "https://example.com/readme.md");
document.body.append(preview);
```

For simple HTML embedding:

```html
<file-preview
  src="https://example.com/private.pdf"
  credentials="include"
  auth-token="token-value"
  auth-scheme="Bearer"
  headers='{"X-Document-Scope":"private"}'
></file-preview>
```

## Notes

- Use the `requestConfig` property when you need structured request options such as auth tokens or Office workbook limits.
- Attribute-based configuration is useful for simple HTML usage, but the property API is the more complete integration surface.
- Request headers and auth settings only affect fetch-based previewers, not native media elements.
