# Svelte and SvelteKit

Use `@ko1265/file-preview-kit-svelte` when you want the lightweight action adapter. It wraps the existing `file-preview` Web Component registration, DOM property assignment, and lifecycle event wiring without adding a Svelte compiler scaffold.

You can still use `@ko1265/file-preview-kit-web-components` directly when you want full manual control.

## Install

```bash
pnpm add @ko1265/file-preview-kit-svelte
```

For direct Web Component usage or a custom `FilePreviewService`, install:

```bash
pnpm add @ko1265/file-preview-kit-web-components @ko1265/file-preview-kit-core
```

## Browser-only boundary

- `@ko1265/file-preview-kit-web-components` is browser-only.
- The Svelte adapter does not touch `window` at module evaluation time.
- In plain Svelte, the `filePreview` action handles registration for you on the client.
- In direct Web Component usage, register the element in `onMount`.
- In SvelteKit, keep rendered preview usage on the client and use an explicit `if (!browser)` guard when you move setup into lifecycle code.

## Svelte action example

```svelte
<script lang="ts">
  import { filePreview } from "@ko1265/file-preview-kit-svelte";

  const previewOptions = {
    src: "/private/report.pdf",
    fileName: "report.pdf",
    mimeType: "application/pdf",
    requestConfig: {
      credentials: "include" as const,
      headers: {
        "X-Document-Scope": "private"
      }
    },
    onLoad() {
      console.log("preview loaded");
    },
    onError(event) {
      console.error("preview failed", event.detail);
    }
  };
</script>

<file-preview use:filePreview={previewOptions}></file-preview>
```

## Direct Web Component example

If you want full manual control, you can still use the custom element directly:

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

  onMount(() => {
    let removeListeners: (() => void) | undefined;
    let disposed = false;

    void import("@ko1265/file-preview-kit-web-components").then(
      ({ registerFilePreviewElement }) => {
        if (disposed) {
          return;
        }

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

        removeListeners = () => {
          preview.removeEventListener("file-preview:load", handleLoad);
          preview.removeEventListener("file-preview:error", handleError);
        };
      }
    );

    return () => {
      disposed = true;
      removeListeners?.();
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

The cleanup must be returned synchronously from `onMount`; do not make the `onMount` callback itself `async`.

## SvelteKit example

This pattern keeps the route SSR-safe while only rendering the preview on the client.

```svelte
<script lang="ts">
  import { browser } from "$app/environment";
  import { filePreview } from "@ko1265/file-preview-kit-svelte";

  if (!browser) {
    console.log("preview waits for the browser");
  }
</script>

{#if browser}
  <file-preview
    use:filePreview={{
      src: "/sample.pdf",
      onLoadStart() {
        console.log("preview loading");
      }
    }}
  ></file-preview>
{/if}
```

## Notes

- Use `bind:this` in the direct Web Component path to assign `requestConfig` and `previewService` as DOM properties.
- The action assigns `requestConfig` and `previewService` as DOM properties under the hood.
- Do not try to pass `requestConfig` or `previewService` as serialized attributes.
- The action maps `src`, `fileName`, and `mimeType` to the underlying custom element attributes.
- Custom events are still native DOM events underneath, and the Svelte action maps `file-preview:loadstart`, `file-preview:load`, and `file-preview:error` to `onLoadStart`, `onLoad`, and `onError` callbacks.
- Remote preview still depends on browser-readable URLs, compatible CORS, and auth that works in the browser.
