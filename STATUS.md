# Project Status

Updated: 2026-05-08

## Completed

- Scaffolded a PNPM TypeScript monorepo with `shared`, `core`, `web-components`, and `demo` packages.
- Implemented a plugin-based preview architecture with remote URL normalization and registry-based resolution.
- Added built-in previewers for PDF, text, markdown, JSON, XML, YAML, CSV, code, images, audio, and video.
- Added basic browser-side Office Open XML preview support:
  - `docx` via sanitized Mammoth HTML extraction with inline conversion warnings
  - `xlsx` via structured SheetJS workbook table rendering with row/column and tab truncation
  - `pptx` via JSZip slide text extraction
- Added Office-specific fixtures/tests for merged cells, formulas, large workbook truncation, and image-heavy `docx` output.
- Added lightweight custom-element coverage for workbook previews and configurable workbook limits via request config.
- Added Office edge-branch coverage for empty workbooks and unresolved worksheet entries.
- Added a workbook summary/range display, safe parse fallback, and sheet-tab accessibility polish for `xlsx` previews.
- Exposed workbook preview limits on the Web Component as attributes with property override support.
- Added docx content summaries plus additional real business-like fixtures for tables, styled headings, footnotes, and endnotes.
- Added real binary `docx` fixture coverage for comments, hyperlinks, and images, plus unsafe-link stripping in the docx HTML sanitization pass.
- Replaced the PDF iframe fallback with a `pdf.js` canvas renderer and page navigation.
- Added PDF zoom controls, inline render status, and an open-in-new-tab action.
- Upgraded markdown rendering with sanitization and code previews with syntax highlighting.
- Converted heavy preview handlers to lazy-loaded chunks to keep initial browser payloads smaller.
- Added configurable request headers, credentials, auth token support, and custom fetch hooks for remote previews.
- Added dynamic request resolution for per-file auth and request shaping.
- Added a Vite demo, MIT license, basic CI workflow, and baseline test coverage.
- Added repository/bugs/homepage metadata for publish readiness.
- Tightened README usage guidance around installation, request configuration, auth behavior, API boundaries, and Office preview limitations.
- Replaced the previously garbled Chinese README with a clean v0.2-aligned version.
- Added package-level READMEs so each published package includes scoped installation and usage notes.
- Added element-attribute examples and clearer guidance around `requestConfig`, `auth-scheme`, and fetch-only auth behavior.
- Verified package tarballs include the expected package READMEs and release-facing entrypoint files.
- Fixed built ESM entrypoints for `core` and `web-components` so published `dist` output no longer uses extensionless relative imports.
- Improved `xlsx` previews with merge-aware cells, formula indicators, and trimming of empty trailing rows/columns for cleaner workbook display.
- Improved `xlsx` workbook display with clearer sheet summaries, visible range labeling, and a safe parse fallback.
- Improved Web Component ergonomics by allowing workbook limits via attributes for simple HTML usage.
- Improved `docx` safety by stripping unsafe hyperlinks from sanitized HTML while keeping readable extracted content.
- Expanded `docx` fixtures/coverage to include richer table/list content, multiple conversion warnings, and real comments/hyperlink/image/table/style/footnote/endnote samples.
- Verified builds, tests, and package tarball generation.

## In Progress

- Early v0.3 Office-focused quality pass, with `xlsx` and `docx` ahead of `pptx`.

## Known Risks

- Remote preview still depends on browser CORS behavior.
- Office previews are intentionally basic and emphasize readable extraction over layout fidelity.
- Large or unusually formatted Office files still need broader browser coverage and visual verification before a 1.0 release.
- `pdf.js` support adds a large optional worker asset, so bundle strategy should keep being monitored.

## Immediate Next Steps

1. Continue with `docx` readability/safety and more realistic binary fixtures now that the workbook slice has a clean checkpoint.
2. Add more realistic binary `docx` fixtures if we want image coverage without relying on Mammoth loader seams.
3. Keep `pptx` low priority unless Office priorities shift.
4. Review future bundle-splitting opportunities for large optional handlers.
