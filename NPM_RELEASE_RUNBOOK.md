# npm Release Runbook

Updated: 2026-05-11

This is the execution runbook for the first public npm release of `file-preview-kit`.

## Release Target

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
pnpm add @ko1265/file-preview-kit-web-components
```

Then verify the package resolves:

```bash
node -e "import('@ko1265/file-preview-kit-web-components').then(() => console.log('ok'))"
```

Expected result:

- install succeeds from the public registry
- the import prints `ok`

## If Something Fails

- If `shared` publish fails: stop immediately and do not publish `core` or `web-components`
- If `core` publish fails: stop before `web-components`
- If registry install fails after publish: treat it as a release blocker for wider announcement, even if publish technically succeeded

## Notes

- The root workspace package stays private and is not part of the npm release surface.
- This runbook is for the first public `0.1.0` release only.
- Keep `NPM_PUBLISH_CHECKLIST.md` as the higher-level readiness document; use this file for the actual execution sequence.
