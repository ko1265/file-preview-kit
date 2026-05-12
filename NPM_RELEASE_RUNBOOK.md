# npm Release Runbook

Updated: 2026-05-11

This is the operator runbook for the first public npm release of `file-preview-kit`.

Status: completed for `0.1.0`.

The repository now also carries v2.0 React/Vue/Svelte adapter milestones that are release-scoped in-repo, but not yet recorded here as completed public npm publishes.

## Historical Release Target

- Version: `0.1.0`
- Scope: `@ko1265`
- Packages:
  - `@ko1265/file-preview-kit-shared`
  - `@ko1265/file-preview-kit-core`
  - `@ko1265/file-preview-kit-web-components`

## Preconditions

Run these from the repository root:

```bash
pnpm build
pnpm pack:verify
pnpm smoke:consumer
```

Expected result:

- `pnpm build` passes
- `pnpm pack:verify` passes
- `pnpm smoke:consumer` passes

If the release candidate includes `@ko1265/file-preview-kit-react`, also run:

```bash
pnpm --filter @ko1265/file-preview-kit-react build
pnpm vitest run tests/react-adapter-contract.test.ts
```

Additional expected result:

- the React package build passes
- the React adapter contract test passes

If the release candidate includes `@ko1265/file-preview-kit-vue`, also run:

```bash
pnpm --filter @ko1265/file-preview-kit-vue build
pnpm vitest run tests/vue-adapter-contract.test.ts
```

Additional expected result:

- the Vue package build passes
- the Vue adapter contract test passes

If the release candidate includes `@ko1265/file-preview-kit-svelte`, also run:

```bash
pnpm --filter @ko1265/file-preview-kit-svelte build
pnpm vitest run tests/svelte-adapter-contract.test.ts
```

Additional expected result:

- the Svelte package build passes
- the Svelte adapter contract test passes
- `pnpm smoke:consumer` proves the packed Svelte import and action behavior; add a tiny Svelte/Vite compile smoke before public publish if framework-compiler proof is required for the release.

Confirm npm identity:

```bash
npm whoami
```

Expected result:

- the logged-in user is `ko1265`

## Publish Order

Publish in dependency order:

1. `packages/shared`
2. `packages/core`
3. `packages/web-components`

For a future v2.0 adapter publish that includes React, Vue, and/or Svelte, keep the same dependency-first order and publish `packages/react`, `packages/vue`, and `packages/svelte` only after `packages/web-components`, because those adapter packages are thin wrappers on top of the existing browser-native surface.

## Publish Commands

From the repository root, publish one package at a time.

### 1. Shared

```bash
cd E:\file-preview-kit\packages\shared
pnpm publish --access public --no-git-checks
```

Success check:

- npm returns a successful publish for `@ko1265/file-preview-kit-shared@0.1.0`

### 2. Core

```bash
cd E:\file-preview-kit\packages\core
pnpm publish --access public --no-git-checks
```

Success check:

- npm returns a successful publish for `@ko1265/file-preview-kit-core@0.1.0`

### 3. Web Components

```bash
cd E:\file-preview-kit\packages\web-components
pnpm publish --access public --no-git-checks
```

Success check:

- npm returns a successful publish for `@ko1265/file-preview-kit-web-components@0.1.0`

### 4. React Adapter (future v2.0 publish only)

```bash
cd E:\file-preview-kit\packages\react
pnpm publish --access public --no-git-checks
```

Success check:

- npm returns a successful publish for `@ko1265/file-preview-kit-react@<release-version>`

### 5. Vue Adapter (future v2.0 publish only)

```bash
cd E:\file-preview-kit\packages\vue
pnpm publish --access public --no-git-checks
```

Success check:

- npm returns a successful publish for `@ko1265/file-preview-kit-vue@<release-version>`

### 6. Svelte Adapter (future v2.0 publish only)

```bash
cd E:\file-preview-kit\packages\svelte
pnpm publish --access public --no-git-checks
```

Success check:

- npm returns a successful publish for `@ko1265/file-preview-kit-svelte@<release-version>`

## Post-Publish Registry Check

After the published package set is live, run one real registry install check from a clean temp folder outside this repo.

Create a temporary folder and install from npm:

```bash
mkdir $env:TEMP\file-preview-kit-registry-smoke -Force
cd $env:TEMP\file-preview-kit-registry-smoke
npm init -y
pnpm add @ko1265/file-preview-kit-core @ko1265/file-preview-kit-web-components
```

If the release includes React, Vue, and/or Svelte, install those adapter peers too:

```bash
pnpm add react @ko1265/file-preview-kit-react
pnpm add vue @ko1265/file-preview-kit-vue
pnpm add svelte @ko1265/file-preview-kit-svelte
```

Then verify the package boundaries honestly:

```bash
node -e "import('@ko1265/file-preview-kit-core').then(({ FilePreviewService }) => { const service = new FilePreviewService(); const resolution = service.resolve({ url: 'https://consumer.example/files/readme.md' }); console.log(resolution.plugin.descriptor.id === 'markdown' ? 'ok' : 'fail'); })"
```

```bash
node -e "const registry = new Map(); globalThis.window = { location: { href: 'https://consumer.example/app/' } }; globalThis.HTMLElement = class { attachShadow() { return { innerHTML: '', querySelector() { return null; }, replaceChildren() {} }; } }; globalThis.customElements = { define(name, ctor) { if (!registry.has(name)) registry.set(name, ctor); }, get(name) { return registry.get(name); } }; import('@ko1265/file-preview-kit-web-components').then(({ registerFilePreviewElement }) => { registerFilePreviewElement('registry-smoke-preview'); console.log(globalThis.customElements.get('registry-smoke-preview') ? 'ok' : 'fail'); })"
```

If the release includes React, verify the adapter import and minimal render path:

```bash
node -e "const registry = new Map(); globalThis.HTMLElement = class { attachShadow() { return { innerHTML: '', querySelector() { return null; }, replaceChildren() {} }; } }; globalThis.customElements = { define(name, ctor) { if (!registry.has(name)) registry.set(name, ctor); }, get(name) { return registry.get(name); } }; globalThis.window = { customElements: globalThis.customElements, location: { href: 'https://consumer.example/app/' } }; Promise.all([import('react'), import('@ko1265/file-preview-kit-web-components'), import('@ko1265/file-preview-kit-react')]).then(async ([React, wc, adapter]) => { await adapter.ensureFilePreviewElementRegistered(); const element = React.createElement(adapter.FilePreview, { src: 'https://consumer.example/files/readme.md' }); console.log(globalThis.customElements.get('file-preview') === wc.FilePreviewElement && element.type === adapter.FilePreview ? 'ok' : 'fail'); })"
```

If the release includes Vue, verify the adapter import and minimal render path:

```bash
node -e "const registry = new Map(); const { pathToFileURL } = require('node:url'); const { resolve } = require('node:path'); globalThis.HTMLElement = class { attachShadow() { return { innerHTML: '', querySelector() { return null; }, replaceChildren() {} }; } }; globalThis.customElements = { define(name, ctor) { if (!registry.has(name)) registry.set(name, ctor); }, get(name) { return registry.get(name); } }; globalThis.window = { customElements: globalThis.customElements, location: { href: 'https://consumer.example/app/' } }; Promise.all([import(pathToFileURL(resolve('node_modules/vue/dist/vue.runtime.esm-browser.js')).href), import('@ko1265/file-preview-kit-web-components'), import('@ko1265/file-preview-kit-vue')]).then(async ([Vue, wc, adapter]) => { await adapter.ensureFilePreviewElementRegistered(); const vnode = Vue.h(adapter.FilePreview, { src: 'https://consumer.example/files/readme.md' }); console.log(globalThis.customElements.get('file-preview') === wc.FilePreviewElement && vnode.type === adapter.FilePreview ? 'ok' : 'fail'); })"
```

If the release includes Svelte, verify the action import and minimum usage path:

```bash
node -e "const registry = new Map(); globalThis.HTMLElement = class { attachShadow() { return { innerHTML: '', querySelector() { return null; }, replaceChildren() {} }; } }; globalThis.customElements = { define(name, ctor) { if (!registry.has(name)) registry.set(name, ctor); }, get(name) { return registry.get(name); } }; globalThis.window = { customElements: globalThis.customElements, location: { href: 'https://consumer.example/app/' } }; Promise.all([import('@ko1265/file-preview-kit-web-components'), import('@ko1265/file-preview-kit-svelte')]).then(async ([wc, adapter]) => { await adapter.ensureFilePreviewElementRegistered(); const attrs = new Map(); const listeners = new Map(); const node = { requestConfig: undefined, addEventListener(type, listener) { listeners.set(type, listener); }, removeEventListener(type) { listeners.delete(type); }, getAttribute(name) { return attrs.get(name) ?? null; }, hasAttribute(name) { return attrs.has(name); }, setAttribute(name, value) { attrs.set(name, value); }, removeAttribute(name) { attrs.delete(name); } }; const action = adapter.filePreview(node, { src: 'https://consumer.example/files/readme.md', requestConfig: { headers: { 'X-Smoke': 'svelte' } } }); await Promise.resolve(); console.log(globalThis.customElements.get('file-preview') === wc.FilePreviewElement && attrs.get('src') && node.requestConfig.headers['X-Smoke'] === 'svelte' ? 'ok' : 'fail'); action.destroy(); })"
```

Expected result:

- install succeeds from the public registry
- the `core` import prints `ok`
- the `web-components` registration check prints `ok`
- if React was published in this release, the React adapter smoke prints `ok`
- if Vue was published in this release, the Vue adapter smoke prints `ok`
- if Svelte was published in this release, the Svelte adapter smoke prints `ok`

## If Something Fails

- If `shared` publish fails: stop immediately and do not publish `core` or `web-components`
- If `core` publish fails: stop before `web-components`
- If `web-components` publish fails: stop before `react`
- If `react` publish fails: stop before `vue`
- If `vue` publish fails: stop before `svelte`
- If registry install fails after publish: treat it as a release blocker for wider announcement, even if publish technically succeeded

## Notes

- The root workspace package stays private and is not part of the npm release surface.
- This runbook was used for the first public `0.1.0` release and now remains as a historical or replay reference.
- Keep `NPM_PUBLISH_CHECKLIST.md` as the higher-level readiness document; use this file for the actual execution sequence.
- The repository currently carries a local `1.0.0` baseline, but a future public `1.0.0` package publish should still be treated as a separate operator action.
- If a future adapter release includes `@ko1265/file-preview-kit-react`, `@ko1265/file-preview-kit-vue`, and/or `@ko1265/file-preview-kit-svelte`, re-run `pnpm pack:verify` and `pnpm smoke:consumer` after the final version bump so the packed adapter tarballs and consumer import paths are verified with publish-ready versions.
