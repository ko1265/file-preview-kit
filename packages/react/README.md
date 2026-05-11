# @ko1265/file-preview-kit-react

React adapter for `file-preview-kit`.

## What it contains

- `FilePreview`
- automatic client-side registration for the `file-preview` custom element
- typed props for `src`, `fileName`, `mimeType`, `requestConfig`, and `previewService`
- callback props for `file-preview:loadstart`, `file-preview:load`, and `file-preview:error`
- no manual `registerFilePreviewElement()` call in app code

## Install

```bash
pnpm add @ko1265/file-preview-kit-react react
```

`react` is a peer dependency. Install it from your app as usual.

## Browser-only note

This adapter wraps the browser-native Web Component package. Render it only from client-side React.

- Vite and other browser-only React apps can import it directly.
- In SSR frameworks such as Next.js, keep it behind a client boundary.

## Vite example

```tsx
import { FilePreview } from "@ko1265/file-preview-kit-react";

export function App() {
  return (
    <FilePreview
      src="https://example.com/readme.md"
      fileName="readme.md"
      mimeType="text/markdown"
      requestConfig={{
        credentials: "include",
        headers: {
          "X-Document-Scope": "private"
        }
      }}
      onLoadStart={() => {
        console.log("preview loading");
      }}
      onLoad={() => {
        console.log("preview loaded");
      }}
      onError={(event) => {
        console.error("preview failed", event.detail.message);
      }}
    />
  );
}
```

## Next.js client-only example

Create a client component:

```tsx
"use client";

import { FilePreview } from "@ko1265/file-preview-kit-react";

export function ClientFilePreview() {
  return <FilePreview src="/sample.pdf" fileName="sample.pdf" />;
}
```

Use it from a server component through a client-only dynamic import:

```tsx
import dynamic from "next/dynamic";

const ClientFilePreview = dynamic(
  () => import("./ClientFilePreview").then((module) => module.ClientFilePreview),
  { ssr: false }
);

export default function Page() {
  return <ClientFilePreview />;
}
```

## Custom service

```tsx
import { FilePreviewService } from "@ko1265/file-preview-kit-core";
import { FilePreview } from "@ko1265/file-preview-kit-react";

const previewService = new FilePreviewService({
  defaultRequest: {
    credentials: "include"
  }
});

export function PrivatePreview() {
  return <FilePreview src="/private/report.pdf" previewService={previewService} />;
}
```

## Notes

- `requestConfig` and `previewService` are assigned as DOM properties, not string attributes.
- `src`, `fileName`, and `mimeType` are reflected to the underlying custom element attributes.
- Passing `undefined` clears a previously assigned `requestConfig`; pass another service instance to replace `previewService`.
- Remote preview still depends on browser-readable URLs with compatible CORS and auth behavior.
