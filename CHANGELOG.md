# Changelog

## Unreleased

### v2.0 Svelte action adapter milestone

- Added the `@ko1265/file-preview-kit-svelte` action adapter package as a lightweight v2.0 framework milestone on top of the existing Web Component surface.
- Added a `filePreview` Svelte action that registers the custom element on the client, maps `src`, `fileName`, and `mimeType` to attributes, maps `requestConfig` and `previewService` to DOM properties, and forwards preview lifecycle events to callbacks.
- Added Svelte-focused package documentation, including SvelteKit client-only guidance.
- Kept Angular deferred to the documented Web Component path until a real Angular directive/component package is justified.

### v2.0 Vue adapter milestone

- Added the `@ko1265/file-preview-kit-vue` adapter package as the second v2.0 framework milestone on top of the existing browser-only preview baseline.
- Added a typed Vue `FilePreview` wrapper around the existing Web Component surface, including DOM property mapping for `requestConfig` and `previewService`.
- Added Vue emits for `file-preview:loadstart`, `file-preview:load`, and `file-preview:error`.
- Added Vue-focused package documentation, including Vite usage and Nuxt client-only guidance.
- Added Vue adapter contract coverage for package metadata, thin-wrapper behavior, DOM property mapping, custom events, SSR documentation boundaries, and release verification hooks.
- Extended packed-tarball and consumer smoke verification so the Vue adapter participates whenever `packages/vue` is present.

### v2.0 React adapter milestone

- Added the `@ko1265/file-preview-kit-react` adapter package as the first v2.0 framework milestone on top of the existing browser-only preview baseline.
- Added a typed React `FilePreview` wrapper around the existing Web Component surface, including object-prop mapping for `requestConfig` and `previewService`.
- Added React callback props for `file-preview:loadstart`, `file-preview:load`, and `file-preview:error`.
- Added React-focused package documentation, including Vite usage and Next.js client-only guidance.
- Added React adapter contract coverage for package metadata, thin-wrapper behavior, DOM property mapping, custom events, and SSR documentation boundaries.
- Extended release-readiness verification so the React adapter now participates in packed-tarball checks and consumer smoke coverage as part of the v2.0 milestone signoff.

## 1.0.0

- Declared the repository's `v1.0` engineering and documentation baseline.
- Clarified the browser-only product story across the top-level README, package READMEs, roadmap, project context, and release notes.
- Repaired the Chinese README and kept it aligned with the same stable public guidance as the English README.
- Added configurable request headers, credentials, auth token support, and custom fetch hooks for remote URL previews.
- Added dynamic request resolution support for per-file auth and request shaping.
- Replaced the PDF iframe fallback with `pdf.js` canvas rendering, page navigation, zoom controls, rendering status, and open-in-new-tab support.
- Hardened Office previews by sanitizing `docx` HTML output, rendering `xlsx` sheets as structured truncated tables, and exposing workbook preview limits.
- Added focused tests for PDF rendering, request merging, Office edge cases, workbook rendering, async request resolution, and Web Component request propagation.
- Added Web Component lifecycle events (`file-preview:loadstart`, `file-preview:load`, `file-preview:error`) and tightened edge cases for stale renders, bubbling, invalid header JSON, and clearing `src` mid-request.
- Added package-level READMEs and verified packed tarballs include the expected release-facing docs and entrypoints.
- Fixed published ESM build output for `core` and `web-components` by rewriting extensionless relative imports in generated `dist` files.
- Added repeatable `pnpm pack:verify` and `pnpm smoke:consumer` release checks, plus a cross-platform pack step for publishable packages.

## 0.1.0

- Completed the first public npm release for:
  - `@ko1265/file-preview-kit-shared`
  - `@ko1265/file-preview-kit-core`
  - `@ko1265/file-preview-kit-web-components`
- Published the initial browser-only preview surface and recorded a successful post-publish registry install verification.
