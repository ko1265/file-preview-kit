# Angular and Svelte Smoke Strategy

## Decision for this PR

Do not add a heavyweight Angular or Svelte package smoke yet.

`@ko1265/file-preview-kit-angular` still does not exist, and `@ko1265/file-preview-kit-svelte` is intentionally just a thin action/helper package. A full scaffolded Angular or Svelte app smoke in this PR would mostly test framework tooling churn rather than meaningful adapter behavior.

The current consumer smoke for Svelte covers packed-package import, default custom element registration, option-to-DOM mapping, callback wiring, and listener cleanup through the action API. It does not compile a real Svelte or SvelteKit app.

We should only add framework package smoke when it is both realistic and low-maintenance.

## What a future smoke must prove

Before creating a heavyweight Angular package or broadening Svelte beyond the current thin helper, the smoke should prove all of the following:

- The package exposes a small, documented integration surface that is different enough from direct Web Component usage to justify its own package.
- A fresh consumer app can install the packed adapter and compile without manual patching.
- The browser-only boundary is clear, including Angular SSR or SvelteKit client-only registration paths where relevant.
- Required data still reaches the underlying element correctly, especially DOM property assignment for `requestConfig` and `previewService`.
- Native preview lifecycle events are still observable from framework code.
- The smoke can run in CI without fragile dev-server orchestration or frequent framework-scaffold churn.

## Candidate smoke shape

Keep the future smoke close to how users would actually consume the package:

- scaffold a tiny Angular app
- scaffold a tiny Svelte or SvelteKit app before a public npm release if the adapter is promoted from in-repo candidate to stable published package
- install the packed adapter tarball plus the core package where relevant
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

These are examples only. This PR still does not add scaffold-based Angular or Svelte smoke automation.

## Trigger to revisit

Revisit this once an Angular package exists, or once the Svelte helper grows enough surface that a real Svelte consumer compile gives us signal we cannot get from the current packed-package smoke.
