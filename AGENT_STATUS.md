# Agent Status

Updated: 2026-05-08

Current goal: start v0.3 with the highest-value Office improvements, especially `xlsx` readability/stability and `docx` readability/safety.

Recent completed work:
- Web Component now exposes workbook preview limits as attributes (`workbook-max-sheets`, `workbook-max-rows`, `workbook-max-columns`) with property override support.
- Docx now summarizes extracted content types and covers additional real business-like fixtures for tables, styled headings, footnotes, and endnotes.
- Docx now has real binary fixture coverage for comments, hyperlinks, and images, plus unsafe-link stripping in the HTML sanitization pass.
- Added a clearer workbook summary/range display, safer parse fallback, and small sheet-tab accessibility polish for `xlsx` previews.
- PDF preview was upgraded to `pdf.js` with zoom, render status, navigation, and open-original controls.
- Request handling now supports dynamic `resolveRequest` shaping for auth/header use cases.
- Office preview hardening now includes `docx` sanitization, inline conversion warnings, and structured `xlsx` table rendering.
- Added Office-specific fixtures/tests for merged cells, formulas, large workbook truncation, and image-heavy `docx` output.
- Added a lightweight custom-element Office render test and low-risk configurable workbook preview limits via `requestConfig.office.workbook`.
- Added Office edge-branch coverage for `No worksheets found` and `Sheet unavailable`.
- Added repository/bugs/homepage package metadata and re-verified build, tests, and tarball packing.
- Rewrote the English and Chinese READMEs to clarify installation, API boundaries, auth behavior, Office preview limits, and release usage guidance.
- Added package-level READMEs for `shared`, `core`, and `web-components` so published packages carry scoped usage guidance.
- Verified `README.zh.md` is valid UTF-8 on disk and tightened docs further with element-attribute examples and clearer auth/property boundaries.
- Verified packed package archives include the expected package-specific READMEs and public entrypoints.
- Fixed the v0.2 publish-surface ESM packaging bug by rewriting extensionless relative imports in built `dist` output for `core` and `web-components`.
- Improved `xlsx` previews with merge-aware rendering, formula indicators/tooltips, and trimming of trailing empty rows/columns inside the visible preview window.
- Improved `docx` readability coverage by exercising richer list/table content and combining multiple conversion warnings in the preview UI.

Key risks:
- Office previews are still readable extracts, not layout-faithful renderers.
- Complex workbook constructs like frozen panes, comments, and rich cell styling are still not represented.
- Vitest currently hits an `esbuild` spawn `EPERM` in this shell; `pnpm.cmd exec tsc -b packages/shared packages/core packages/web-components` passed for the touched TypeScript packages.
- The repo has concurrent unstaged work; continue forward without reverting others' changes.

Immediate next steps:
1. Keep pushing `docx` readability/safety if we want richer conversion notes or more fixture breadth.
2. Add more realistic Office fixtures if we want confidence beyond the current Mammoth/XLSX seams.
3. Keep `pptx` low priority unless Office priorities shift.

Files/modules in focus:
- `packages/core/src/office.ts`
- `packages/web-components/src/styles.ts`
- `tests/fixtures/office.ts`
- `tests/plugins.test.ts`
- `STATUS.md`
- `CHANGELOG.md`
