# v2.0 Development Plan

Updated: 2026-05-11

## Goal

Make `file-preview-kit` friendly to common frontend frameworks without forking the preview engine.

The v2.0 direction is framework adapters on top of the existing browser-only preview baseline:

- React first
- Vue second
- Angular and Svelte through integration docs/smoke examples before committing to full packages

## Non-Negotiables

- Keep `@ko1265/file-preview-kit-core` as the shared preview engine.
- Keep `@ko1265/file-preview-kit-web-components` as the stable browser-native foundation.
- Do not rewrite preview rendering separately for each framework.
- Do not broaden file-format scope as part of v2.0.
- Do not add server-side conversion, editing, or layout-faithful Office rendering.

## Package Strategy

Use separate framework packages:

- `@ko1265/file-preview-kit-react`
- `@ko1265/file-preview-kit-vue`
- `@ko1265/file-preview-kit-angular` only after Angular demand is proven
- `@ko1265/file-preview-kit-svelte` only after Svelte demand is proven

The main package story should stay explicit: users install the package for their framework instead of pulling a mixed all-framework bundle.

## Branch Strategy

Use one integration branch for v2.0:

- `v2-framework-adapters`

Use short-lived framework branches only if parallel work or PR review requires them. Do not keep long-running React/Vue/Angular/Svelte branches in parallel.

## Milestones

### M0: Planning Baseline

Deliverables:

- v2.0 roadmap and task board
- package naming decision
- adapter boundary decision
- first implementation target selected

Exit criteria:

- `ROADMAP.md`, `NEXT_STEPS.md`, and this plan agree on the same v2.0 direction.

### M1: React Adapter

Deliverables:

- `packages/react`
- `FilePreview` React component
- typed props for `src`, `fileName`, `mimeType`, `requestConfig`, and `previewService`
- callback props for load start, load, and error events
- safe custom element registration helper
- React README with Vite/Next client-only examples
- focused tests or consumer smoke coverage

Exit criteria:

- React users can install one package and render a typed preview component without touching custom element registration directly.

### M2: Vue Adapter

Deliverables:

- `packages/vue`
- Vue component wrapper
- typed props and emits
- composable only if it removes real integration friction
- Vue README with Vite/Nuxt client-only guidance
- focused tests or consumer smoke coverage

Exit criteria:

- Vue users can use the component without custom-element compiler warnings or manual registration boilerplate.

### M3: Framework Integration Examples

Deliverables:

- Angular integration guide using the Web Component and `CUSTOM_ELEMENTS_SCHEMA`
- Svelte/SvelteKit integration guide using the Web Component with client-only boundaries
- smoke examples that prove the documented paths are realistic

Exit criteria:

- Angular and Svelte users have a reliable documented path before full adapter package work begins.

### M4: Release Readiness

Deliverables:

- package READMEs aligned with top-level README
- changelog entry for v2.0
- publish checklist updated for adapter packages
- package tarball verification
- consumer smoke verification for each published package

Exit criteria:

- v2.0 packages can be published without changing the v1.0 preview promise.

## First Implementation Slice

Start with React because it has the highest adapter value:

1. Add `packages/react`.
2. Wrap the existing Web Component rather than rendering previews directly in React.
3. Map object props to element properties.
4. Map custom events to callback props.
5. Document SSR/client-only usage clearly.
6. Verify with TypeScript build and at least one consumer smoke path.
