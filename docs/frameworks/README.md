# Framework Integration Notes

These guides cover Angular direct usage of `@ko1265/file-preview-kit-web-components` and the lightweight Svelte package built on top of the same custom element.

- [Angular](./angular.md)
- [Svelte and SvelteKit](./svelte.md)
- [Angular/Svelte smoke strategy](./smoke-strategy.md)

Shared constraints:

- Keep the `file-preview` custom element as the shared browser runtime.
- Keep registration and DOM access on the client.
- Pass object values such as `requestConfig` and `previewService` through DOM properties, not HTML attributes.
- Listen for `file-preview:loadstart`, `file-preview:load`, and `file-preview:error` as native custom events.

Current adapter stance:

- Svelte can graduate to a lightweight action/helper package because it removes repeated `onMount`, property assignment, and listener setup.
- Angular stays on the Web Component path until a real Angular directive/component package is worth the Angular Package Format maintenance cost.
