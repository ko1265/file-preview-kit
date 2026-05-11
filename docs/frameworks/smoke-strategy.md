# Angular and Svelte Smoke Strategy

## Decision for this PR

Do not add a heavyweight Angular or Svelte package smoke yet.

Right now there is no `@ko1265/file-preview-kit-angular` or `@ko1265/file-preview-kit-svelte` package to prove. The current docs describe direct use of `@ko1265/file-preview-kit-web-components`, so a full framework-app smoke in this PR would mostly test scaffold tooling and example wiring rather than a real adapter surface.

We should only add framework package smoke when it is both realistic and low-maintenance.

## What a future smoke must prove

Before creating `@ko1265/file-preview-kit-angular` or `@ko1265/file-preview-kit-svelte`, the smoke should prove all of the following:

- The package exposes a small, documented integration surface that is different enough from direct Web Component usage to justify its own package.
- A fresh consumer app can install the packed adapter and compile without manual patching.
- The browser-only boundary is clear, including Angular SSR or SvelteKit client-only registration paths where relevant.
- Required data still reaches the underlying element correctly, especially DOM property assignment for `requestConfig` and `previewService`.
- Native preview lifecycle events are still observable from framework code.
- The smoke can run in CI without fragile dev-server orchestration or frequent framework-scaffold churn.

## Candidate smoke shape

Keep the future smoke close to how users would actually consume the package:

- scaffold a tiny Angular app
- scaffold a tiny Svelte or SvelteKit app
- install the packed adapter tarball plus the core package
- render one preview instance
- verify the app builds and the integration code covers client-only registration, property passing, and event hookup

Conceptual command examples:

```bash
pnpm dlx @angular/cli@latest new smoke-angular --standalone --defaults
pnpm dlx create-vite@latest smoke-svelte --template svelte-ts
pnpm add /path/to/ko1265-file-preview-kit-angular.tgz @ko1265/file-preview-kit-core
pnpm add /path/to/ko1265-file-preview-kit-svelte.tgz @ko1265/file-preview-kit-core
pnpm build
```

These are examples only. This PR does not add scripts, dependencies, or package-level smoke automation.

## Trigger to revisit

Revisit this once an Angular or Svelte adapter package exists, has a stable API, and can be validated with one small consumer per framework without turning CI into framework-scaffold maintenance.
