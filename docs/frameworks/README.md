# Framework Integration Notes

These guides cover direct framework usage of `@ko1265/file-preview-kit-web-components` before dedicated Angular or Svelte adapter packages exist.

- [Angular](./angular.md)
- [Svelte and SvelteKit](./svelte.md)

Shared constraints:

- Use the Web Component package directly.
- Keep registration and DOM access on the client.
- Pass object values such as `requestConfig` and `previewService` through DOM properties, not HTML attributes.
- Listen for `file-preview:loadstart`, `file-preview:load`, and `file-preview:error` as native custom events.
