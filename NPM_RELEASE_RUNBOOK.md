# npm Release Runbook

Updated: 2026-05-11

This is the operator runbook for the first public npm release of `file-preview-kit`.

Status: completed for `0.1.0`.

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

## Post-Publish Registry Check

After all three packages are live, run one real registry install check from a clean temp folder outside this repo.

Create a temporary folder and install from npm:

```bash
mkdir $env:TEMP\file-preview-kit-registry-smoke -Force
cd $env:TEMP\file-preview-kit-registry-smoke
npm init -y
pnpm add @ko1265/file-preview-kit-core @ko1265/file-preview-kit-web-components
```

Then verify the package boundaries honestly:

```bash
node -e "import('@ko1265/file-preview-kit-core').then(({ FilePreviewService }) => { const service = new FilePreviewService(); const resolution = service.resolve({ url: 'https://consumer.example/files/readme.md' }); console.log(resolution.plugin.descriptor.id === 'markdown' ? 'ok' : 'fail'); })"
```

```bash
node -e "const registry = new Map(); globalThis.window = { location: { href: 'https://consumer.example/app/' } }; globalThis.HTMLElement = class { attachShadow() { return { innerHTML: '', querySelector() { return null; }, replaceChildren() {} }; } }; globalThis.customElements = { define(name, ctor) { if (!registry.has(name)) registry.set(name, ctor); }, get(name) { return registry.get(name); } }; import('@ko1265/file-preview-kit-web-components').then(({ registerFilePreviewElement }) => { registerFilePreviewElement('registry-smoke-preview'); console.log(globalThis.customElements.get('registry-smoke-preview') ? 'ok' : 'fail'); })"
```

Expected result:

- install succeeds from the public registry
- the `core` import prints `ok`
- the `web-components` registration check prints `ok`

## If Something Fails

- If `shared` publish fails: stop immediately and do not publish `core` or `web-components`
- If `core` publish fails: stop before `web-components`
- If registry install fails after publish: treat it as a release blocker for wider announcement, even if publish technically succeeded

## Notes

- The root workspace package stays private and is not part of the npm release surface.
- This runbook was used for the first public `0.1.0` release and now remains as a historical or replay reference.
- Keep `NPM_PUBLISH_CHECKLIST.md` as the higher-level readiness document; use this file for the actual execution sequence.
- The repository currently carries a local `1.0.0` baseline, but a future public `1.0.0` package publish should still be treated as a separate operator action.
