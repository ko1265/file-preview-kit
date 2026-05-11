# Changelog

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
