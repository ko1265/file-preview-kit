# Changelog

## Unreleased

- Replaced the PDF iframe fallback with `pdf.js` canvas rendering and page navigation.
- Added configurable request headers, credentials, auth token support, and custom fetch hooks for remote URL previews.
- Expanded tests for PDF rendering, request merging, and Web Component request propagation.
- Added dynamic request resolution support for per-file auth and request shaping.
- Improved the PDF viewer with zoom controls, rendering status, and open-in-new-tab support.
- Expanded tests for async request resolution and PDF zoom behavior.
- Hardened Office previews by sanitizing `docx` HTML output and rendering `xlsx` sheets as structured, truncated tables.
- Added configurable workbook preview limits through request config.
- Added focused Office tests for merged cells, formulas, truncation, image-heavy `docx` output, and custom-element workbook rendering.
- Added Office edge-case tests for empty workbooks and unresolved sheet entries.
- Added repository, bugs, and homepage metadata for package publish readiness.
- Tightened English and Chinese README guidance around installation, `requestConfig`, auth behavior, API boundaries, and Office preview limitations.
- Added package-level READMEs and verified packed tarballs include the expected release-facing docs and entrypoints.
- Fixed published ESM build output for `core` and `web-components` by rewriting extensionless relative imports in generated `dist` files.

## 0.1.0

- Scaffolded the PNPM TypeScript monorepo and package boundaries.
- Added a plugin-driven remote preview architecture.
- Shipped built-in preview support for PDF, markdown, text, code, images, audio, video, `docx`, `xlsx`, and `pptx`.
- Added a standalone `file-preview` Web Component, Vite demo, basic tests, and CI workflow.
