# @file-preview-kit/core

Core preview registry, request handling, and built-in preview plugins for `file-preview-kit`.

## What it contains

- `FilePreviewService`
- `FilePreviewRegistry`
- built-in preview plugins for text, media, PDF, and Office formats
- request merging and request resolution helpers

## Install

```bash
pnpm add @file-preview-kit/core
```

## Usage

```ts
import { FilePreviewService } from "@file-preview-kit/core";

const service = new FilePreviewService();
const node = await service.render({
  url: "https://example.com/readme.md"
});

document.body.append(node);
```

With dynamic auth shaping:

```ts
const service = new FilePreviewService({
  async resolveRequest(source, request) {
    return {
      ...(request ?? {}),
      headers: {
        ...(request?.headers ?? {}),
        Authorization: `Bearer token-for-${source.normalizedName}`
      }
    };
  }
});
```

## Notes

- Request configuration applies to fetch-based previewers.
- Native media previewers still use the source URL directly.
- Office previews are readable browser previews, not fidelity-preserving Office renderers.
- Use `resolveRequest` for token refresh, per-file auth, or last-mile request shaping.
