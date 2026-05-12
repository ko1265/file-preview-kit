# @ko1265/file-preview-kit-svelte

Svelte action adapter for `file-preview-kit`.

This package stays thin: it registers the existing `file-preview` Web Component on the client, maps object options to DOM properties, and forwards the Web Component lifecycle events to callbacks. It does not render previews itself.

## Status

This package is an in-repo v2.0 adapter candidate and is not published to npm yet. Use a packed local tarball or workspace dependency for review builds until a real npm publish is explicitly completed and verified.

## Install

After the package is published to npm:

```bash
pnpm add @ko1265/file-preview-kit-svelte
```

For current repository testing, use `pnpm pack:verify` or `pnpm smoke:consumer` to build and consume the local tarball.

## Svelte

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

## SvelteKit

Use the action only from a client-rendered component. The package does not touch `window` at module evaluation time, but the underlying Web Component is browser-only.

```svelte
<script lang="ts">
  import { browser } from "$app/environment";
  import { filePreview } from "@ko1265/file-preview-kit-svelte";

  const previewOptions = browser
    ? {
        src: "/sample.pdf",
        onLoadStart() {
          console.log("preview loading");
        }
      }
    : undefined;
</script>

{#if browser}
  <file-preview use:filePreview={previewOptions}></file-preview>
{/if}
```

You can also place the preview in a route or component that SvelteKit renders only on the client.

## Options

- `src`, `fileName`, and `mimeType` become element attributes.
- `requestConfig` and `previewService` become DOM properties.
- `onLoadStart`, `onLoad`, and `onError` receive the native `file-preview:loadstart`, `file-preview:load`, and `file-preview:error` custom events.

Do not pass `requestConfig` or `previewService` through serialized HTML attributes.

## Boundary

This adapter is useful when a Svelte app would otherwise repeat `onMount`, custom element registration, DOM property assignment, and listener cleanup. If you need direct control, using `@ko1265/file-preview-kit-web-components` remains supported.
