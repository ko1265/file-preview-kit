# npm Publish Checklist

Updated: 2026-05-09

This checklist tracks the work required to turn `file-preview-kit` from a polished repository into installable npm packages that other projects can consume directly.

For the actual first-release command sequence, use [NPM_RELEASE_RUNBOOK.md](NPM_RELEASE_RUNBOOK.md).

## Target Packages

- `@ko1265/file-preview-kit-shared`
- `@ko1265/file-preview-kit-core`
- `@ko1265/file-preview-kit-web-components`

## Already Verified

- Each publishable package has:
  - `name`
  - `version`
  - `license`
  - `repository`
  - `homepage`
  - `bugs`
  - `exports`
  - `types`
  - `publishConfig.access = public`
- `pnpm pack:check` succeeds for all publishable packages.
- Packed tarballs rewrite internal workspace dependencies correctly:
  - `@ko1265/file-preview-kit-core` depends on `@ko1265/file-preview-kit-shared@0.1.0`
  - `@ko1265/file-preview-kit-web-components` depends on `@ko1265/file-preview-kit-core@0.1.0` and `@ko1265/file-preview-kit-shared@0.1.0`
- The published packages are intentionally scoped as `@ko1265/*`; the root workspace package stays private and is not part of the npm release surface.
- Package-level READMEs now include the remote file access/CORS guidance that matters for real adopters.
- The repository now includes a repeatable consumer smoke test at `pnpm smoke:consumer` that:
  - packs the local publishable packages
  - installs those tarballs into a clean sample app
  - verifies that a consumer can import `@ko1265/file-preview-kit-core` and `@ko1265/file-preview-kit-web-components`
- `pnpm pack:verify` now checks the packed tarballs for:
  - expected entrypoint files from `main` / `module` / `types` / `exports`
  - `README.md` and `LICENSE`
  - internal workspace dependency rewrite to the publish version

## Still Required Before First npm Release

1. Confirm npm scope ownership
   - Confirmed: the `@ko1265` scope is controlled by the intended publisher account.
2. Decide the first public npm version
   - Confirmed: the first public npm release stays at `0.1.0`.
3. Perform a real consumer smoke test
   - Run `pnpm smoke:consumer`.
   - Let the sample app resolve third-party dependencies normally; use `--offline` only for an intentional cache-only recheck.
   - Keep one final post-publish registry install check in reserve after the first public release.
   - This remains a separate release gate even after `pnpm pack:verify`, because tarball structure validation does not prove a clean external install end to end.
4. Confirm publish order
   - Publish `shared` first
   - Then `core`
   - Then `web-components`
5. Confirm release operator steps
   - `npm login`
   - `pnpm build`
   - `pnpm pack:check`
   - use `pnpm publish` or package-folder publish flows that preserve the pnpm tarball rewrite behavior for `workspace:*` dependencies
   - publish packages with public access

## Recommended First Publish Flow

1. `pnpm build`
2. `pnpm pack:verify`
3. Run the clean consumer smoke test
   - `pnpm smoke:consumer`
4. `npm login`
5. Publish in dependency order, using pnpm-aware publish commands:
   - `packages/shared`
   - `packages/core`
   - `packages/web-components`
6. Verify install from a clean app using the public registry
   - This remains the final post-publish check after the first real release.

## Notes

- The repository can stay private until the public npm release decision is final.
- Publishing to npm is the point where this project becomes a real consumable library, not just a polished codebase.
- The README already sets the correct expectation that browser-readable file sources, CORS, and same-origin/object-storage/proxy strategies matter in production use.
