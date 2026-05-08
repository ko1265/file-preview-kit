# Changelog

## Unreleased

- Replaced the PDF iframe fallback with `pdf.js` canvas rendering and page navigation.
- Added configurable request headers, credentials, auth token support, and custom fetch hooks for remote URL previews.
- Expanded tests for PDF rendering, request merging, and Web Component request propagation.

## 0.1.0

- Scaffolded the PNPM TypeScript monorepo and package boundaries.
- Added a plugin-driven remote preview architecture.
- Shipped built-in preview support for PDF, markdown, text, code, images, audio, video, `docx`, `xlsx`, and `pptx`.
- Added a standalone `file-preview` Web Component, Vite demo, basic tests, and CI workflow.
