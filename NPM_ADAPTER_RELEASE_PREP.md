# React/Vue Adapter Release Prep

Updated: 2026-05-12

This document records the React/Vue adapter npm release-prep dry run that happened before the real `1.0.0` npm publish. It is historical dry-run evidence, not the current publish status.

The real `1.0.0` publish later completed for shared, core, Web Components, React, Vue, and Svelte, followed by registry version checks and a clean registry install smoke.

## Current Registry Reality

Checked against npm on 2026-05-12:

- `npm view @ko1265/file-preview-kit-web-components version` returned `0.1.0`
- `npm view @ko1265/file-preview-kit-react version` returned `404 Not Found`
- `npm view @ko1265/file-preview-kit-vue version` returned `404 Not Found`

React and Vue are still in-repo release candidates. Do not describe them as published packages until a real npm publish and post-publish registry smoke both succeed.

## Dry-Run Target

- `@ko1265/file-preview-kit-react@1.0.0`
- `@ko1265/file-preview-kit-vue@1.0.0`

Publish order for any future real adapter release remains dependency-first:

1. `@ko1265/file-preview-kit-shared`
2. `@ko1265/file-preview-kit-core`
3. `@ko1265/file-preview-kit-web-components`
4. `@ko1265/file-preview-kit-react`
5. `@ko1265/file-preview-kit-vue`

## Validation Run

These checks passed on 2026-05-12:

```bash
pnpm build
pnpm test
pnpm pack:verify
pnpm smoke:consumer
```

The packed consumer smoke verified the local tarballs for shared, core, Web Components, React, and Vue.

## Publish Dry Run

These commands passed using a temporary npm cache and did not publish anything:

```bash
env npm_config_cache=/private/tmp/file-preview-kit-npm-cache pnpm --filter @ko1265/file-preview-kit-react publish --dry-run --access public --no-git-checks
env npm_config_cache=/private/tmp/file-preview-kit-npm-cache pnpm --filter @ko1265/file-preview-kit-vue publish --dry-run --access public --no-git-checks
```

Expected dry-run result:

- npm reports package metadata and tarball contents
- npm prints `Publishing to https://registry.npmjs.org/ ... (dry-run)`
- no package becomes available on the public registry

## After a Real Publish

Only after a human operator explicitly performs a real npm publish:

1. Install React and Vue adapters from npm in a clean folder.
2. Run the React and Vue post-publish registry smoke commands from [NPM_RELEASE_RUNBOOK.md](NPM_RELEASE_RUNBOOK.md).
3. Update [NPM_PUBLISH_CHECKLIST.md](NPM_PUBLISH_CHECKLIST.md) only after registry smoke passes.

Angular and Svelte remain documented Web Component integration paths, not adapter package release candidates.
