# Svelte and SvelteKit

Use `@ko1265/file-preview-kit-web-components` directly for now. There is no Svelte or SvelteKit adapter package yet.

## Install

```bash
pnpm add @ko1265/file-preview-kit-web-components @ko1265/file-preview-kit-core
```

`@ko1265/file-preview-kit-core` is only needed if you want to create a custom `FilePreviewService`.

## Browser-only boundary

- `@ko1265/file-preview-kit-web-components` is browser-only.
- In plain Svelte, register the element in `onMount`.
- In SvelteKit, keep registration and DOM access on the client. `onMount` is the simplest boundary.

## Svelte example

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { FilePreviewService } from "@ko1265/file-preview-kit-core";

  interface FilePreviewElement extends HTMLElement {
    requestConfig?: {
      credentials?: RequestCredentials;
      headers?: Record<string, string>;
    };
    previewService?: FilePreviewService;
  }

  let preview: FilePreviewElement;

  const previewService = new FilePreviewService({
    defaultRequest: {
      credentials: "include"
    }
  });

  onMount(async () => {
    const { registerFilePreviewElement } = await import(
      "@ko1265/file-preview-kit-web-components"
    );

    registerFilePreviewElement();

    preview.requestConfig = {
      credentials: "include",
      headers: {
        "X-Document-Scope": "private"
      }
    };

    preview.previewService = previewService;

    const handleLoad = () => {
      console.log("preview loaded");
    };

    const handleError = (event: Event) => {
      console.error("preview failed", (event as CustomEvent).detail);
    };

    preview.addEventListener("file-preview:load", handleLoad);
    preview.addEventListener("file-preview:error", handleError);

    return () => {
      preview.removeEventListener("file-preview:load", handleLoad);
      preview.removeEventListener("file-preview:error", handleError);
    };
  });
</script>

<file-preview
  bind:this={preview}
  src="/private/report.pdf"
  file-name="report.pdf"
  mime-type="application/pdf"
></file-preview>
```

## SvelteKit example

This pattern keeps the browser-only code inside `onMount` and leaves the rest of the route SSR-safe.

```svelte
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  let preview: HTMLElement;

  onMount(async () => {
    if (!browser) {
      return;
    }

    const { registerFilePreviewElement } = await import(
      "@ko1265/file-preview-kit-web-components"
    );

    registerFilePreviewElement();

    preview.addEventListener("file-preview:loadstart", () => {
      console.log("preview loading");
    });
  });
</script>

<file-preview bind:this={preview} src="/sample.pdf"></file-preview>
```

## Notes

- Use `bind:this` to get the element instance, then assign `requestConfig` and `previewService` as DOM properties.
- Do not try to pass `requestConfig` or `previewService` as serialized attributes.
- String values such as `src`, `file-name`, and `mime-type` can be written directly on the element.
- Custom events are native DOM events, so `addEventListener` is the most reliable integration surface here.
- Remote preview still depends on browser-readable URLs, compatible CORS, and auth that works in the browser.
