# Roadmap

Updated: 2026-05-11

## Current Phase

`v1.0`

The project has completed its `v1.0` closeout for the current browser-only preview scope. The focus now shifts from release prep to stable maintenance: preserving the current package boundaries, keeping consumer docs honest, and making only targeted follow-up fixes.

## Stable Promise

- Keep public URL preview flows understandable and reliable within browser constraints.
- Keep auth-shaped request configuration explicit in docs and examples.
- Keep Office previews readable, stable, and clearly scoped as extraction-oriented browser previews.
- Preserve the lightweight media and text preview paths that already work well.
- Keep package READMEs, roadmap docs, and release notes aligned with the actual published package story.

## Maintenance Workstreams

1. Consumer experience
   - Watch for real integration friction around package naming, browser-only expectations, and request configuration.
   - Prefer small ergonomics fixes and documentation improvements over capability expansion.
2. Demo and docs upkeep
   - Keep the demo representative of public URL, auth, Office, and media flows.
   - Keep English and Chinese READMEs synchronized with the same stable product story.
3. Release hygiene
   - Keep build, test, tarball verification, and consumer smoke paths green.
   - Preserve the current package entrypoints and browser compatibility expectations.
4. Scoped iteration
   - Use future releases for targeted fixes, fixture refreshes, and documentation quality.
   - Avoid broadening the Office or server-side story without a new product decision.

## Exit Criteria Already Met

- Demo examples cover public, auth, Office, and media preview paths.
- Repo status files and primary docs describe the same current phase.
- Package docs align with the top-level README guidance.
- The first public npm release (`0.1.0`) is complete and has a recorded registry install verification.
- No new high-risk preview behavior was introduced during closeout.

## Not In Scope

- Server-side conversion.
- Editing workflows.
- Layout-faithful Office rendering.
- Expanding into legacy `doc`, `xls`, or `ppt` support.
