# @ko1265/file-preview-kit-vue

Vue adapter for `file-preview-kit`.

## What it contains

- `FilePreview`
- automatic client-side registration for the `file-preview` custom element
- typed props for `src`, `fileName`, `mimeType`, `requestConfig`, and `previewService`
- Vue emits for the underlying `file-preview:loadstart`, `file-preview:load`, and `file-preview:error` custom events
- no manual `registerFilePreviewElement()` call in app code

## Install

```bash
pnpm add @ko1265/file-preview-kit-vue vue
```

`vue` is a peer dependency. Install it from your app as usual.

## Browser-only note

This adapter wraps the browser-native Web Component package. Render it only from client-side Vue.

- Vite and other browser-only Vue apps can import it directly.
- In SSR frameworks such as Nuxt, keep it behind a client-only boundary.

## Vite example

```vue
<script setup lang="ts">
import { FilePreview } from "@ko1265/file-preview-kit-vue";

function handleError(event: CustomEvent<{ message: string }>) {
  console.error("preview failed", event.detail.message);
}
</script>

<template>
  <FilePreview
    src="https://example.com/readme.md"
    file-name="readme.md"
    mime-type="text/markdown"
    :request-config="{
      credentials: 'include',
      headers: {
        'X-Document-Scope': 'private'
      }
    }"
    @loadstart="console.log('preview loading')"
    @load="console.log('preview loaded')"
    @error="handleError"
  />
</template>
```

You can also use kebab-case props in Vue templates:

```vue
<FilePreview file-name="readme.md" mime-type="text/markdown" />
```

## Nuxt client-only example

```vue
<script setup lang="ts">
import { FilePreview } from "@ko1265/file-preview-kit-vue";
</script>

<template>
  <ClientOnly>
    <FilePreview src="/sample.pdf" file-name="sample.pdf" />
  </ClientOnly>
</template>
```

If you prefer a dedicated client component, place the preview in a `.client.vue` file and render that from your page.

## Custom service

```ts
import { FilePreviewService } from "@ko1265/file-preview-kit-core";

export const previewService = new FilePreviewService({
  defaultRequest: {
    credentials: "include"
  }
});
```

```vue
<script setup lang="ts">
import { FilePreview } from "@ko1265/file-preview-kit-vue";
import { previewService } from "./preview-service";
</script>

<template>
  <FilePreview src="/private/report.pdf" :preview-service="previewService" />
</template>
```

## Notes

- `requestConfig` and `previewService` are assigned as DOM properties, not string attributes.
- `src`, `fileName`, and `mimeType` are reflected to the underlying custom element attributes.
- Passing `undefined` clears a previously assigned `requestConfig`; pass another service instance to replace `previewService`.
- Remote preview still depends on browser-readable URLs with compatible CORS and auth behavior.
