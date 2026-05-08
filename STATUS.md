# Project Status

Updated: 2026-05-07

## Completed

- Scaffolded a PNPM TypeScript monorepo with `shared`, `core`, `web-components`, and `demo` packages.
- Implemented a plugin-based preview architecture with remote URL normalization and registry-based resolution.
- Added built-in previewers for PDF, text, markdown, JSON, XML, YAML, CSV, code, images, audio, and video.
- Added basic browser-side Office Open XML preview support:
  - `docx` via Mammoth HTML extraction
  - `xlsx` via SheetJS workbook rendering
  - `pptx` via JSZip slide text extraction
- Replaced the PDF iframe fallback with a `pdf.js` canvas renderer and page navigation.
- Upgraded markdown rendering with sanitization and code previews with syntax highlighting.
- Converted heavy preview handlers to lazy-loaded chunks to keep initial browser payloads smaller.
- Added configurable request headers, credentials, auth token support, and custom fetch hooks for remote previews.
- Added a Vite demo, MIT license, basic CI workflow, and baseline test coverage.
- Verified builds, tests, and package tarball generation.

## In Progress

- Tightening release-readiness: publish metadata, docs, and packaging checks.

## Known Risks

- Remote preview still depends on browser CORS behavior.
- Office previews are intentionally basic and emphasize readable extraction over layout fidelity.
- `xlsx` HTML generation and `docx` HTML extraction should be reviewed further for theming and sanitization nuances before a 1.0 release.
- `pdf.js` support adds a large optional worker asset, so bundle strategy should keep being monitored.

## Immediate Next Steps

1. Improve Office preview fidelity and sanitization review.
2. Add more package-level docs and visual/regression tests.
3. Consider authenticated media/PDF demos and more fetch-hook examples.
4. Review future bundle-splitting opportunities for large optional handlers.
