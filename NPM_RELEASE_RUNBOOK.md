# npm Release Runbook

Updated: 2026-05-11

This is the operator runbook for the first public npm release of `file-preview-kit`.

Status: completed for `0.1.0`.

The repository now also carries a v2.0 React adapter milestone that is release-ready in-repo, but not yet recorded here as a completed public npm publish.

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

For a future v2.0 adapter publish that includes React, keep the same dependency-first order and publish `packages/react` only after `packages/web-components`, because the React package is a thin adapter on top of the existing browser-native surface.

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

## Post-Publish Registry Check

After the published package set is live, run one real registry install check from a clean temp folder outside this repo.

Create a temporary folder and install from npm:

```bash
mkdir $env:TEMP\file-preview-kit-registry-smoke -Force
cd $env:TEMP\file-preview-kit-registry-smoke
npm init -y
pnpm add @ko1265/file-preview-kit-core @ko1265/file-preview-kit-web-components
```

If the release includes React, install it too:

```bash
pnpm add react @ko1265/file-preview-kit-react
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

Expected result:

- install succeeds from the public registry
- the `core` import prints `ok`
- the `web-components` registration check prints `ok`
- if React was published in this release, the React adapter smoke prints `ok`

## If Something Fails

- If `shared` publish fails: stop immediately and do not publish `core` or `web-components`
- If `core` publish fails: stop before `web-components`
- If `web-components` publish fails: stop before `react`
- If registry install fails after publish: treat it as a release blocker for wider announcement, even if publish technically succeeded

## Notes

- The root workspace package stays private and is not part of the npm release surface.
- This runbook was used for the first public `0.1.0` release and now remains as a historical or replay reference.
- Keep `NPM_PUBLISH_CHECKLIST.md` as the higher-level readiness document; use this file for the actual execution sequence.
- The repository currently carries a local `1.0.0` baseline, but a future public `1.0.0` package publish should still be treated as a separate operator action.
- If a future adapter release includes `@ko1265/file-preview-kit-react`, re-run `pnpm pack:verify` and `pnpm smoke:consumer` after the final version bump so the packed React tarball and consumer import path are verified with publish-ready versions.
