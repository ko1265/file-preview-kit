# Roadmap

Updated: 2026-05-11

## Current Phase

`v2.0 planning`

The project has completed its `v1.0` closeout for the current browser-only preview scope. The next product direction is `v2.0` framework friendliness: provide thin adapters for common frontend frameworks while preserving the existing browser-only preview engine and Web Component foundation.

## Stable Promise

- Keep public URL preview flows understandable and reliable within browser constraints.
- Keep auth-shaped request configuration explicit in docs and examples.
- Keep Office previews readable, stable, and clearly scoped as extraction-oriented browser previews.
- Preserve the lightweight media and text preview paths that already work well.
- Keep package READMEs, roadmap docs, and release notes aligned with the actual published package story.

## v2.0 Workstreams

1. Framework package boundaries
   - Ship framework adapters as separate npm packages, not one all-framework bundle.
   - Keep each adapter thin and dependent on the shared `core` / `web-components` baseline.
2. React adapter first
   - Add a typed React wrapper that handles registration, object properties, custom events, and client-only guidance.
   - Avoid reimplementing preview rendering in React.
3. Vue adapter second
   - Add a thin Vue wrapper only after React establishes the adapter boundary.
   - Focus on props, emits, typing, and avoiding custom-element boilerplate.
4. Angular and Svelte integration paths
   - Start with docs and consumer smoke examples.
   - Defer full packages until real demand or integration friction justifies the maintenance cost.
5. Release hygiene
   - Keep build, test, tarball verification, and consumer smoke paths green for every publishable package.
   - Keep English and Chinese docs synchronized with the actual package story.

## v2.0 Package Direction

- `@ko1265/file-preview-kit-react`: first full adapter package.
- `@ko1265/file-preview-kit-vue`: second adapter package after React.
- `@ko1265/file-preview-kit-angular`: deferred until docs/smoke examples prove package value.
- `@ko1265/file-preview-kit-svelte`: deferred until docs/smoke examples prove package value.

See [V2_DEVELOPMENT_PLAN.md](V2_DEVELOPMENT_PLAN.md) and [KANBAN.md](KANBAN.md) for the active task plan.

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
- Rewriting the preview engine separately for each framework.
