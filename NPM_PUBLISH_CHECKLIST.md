# npm Publish Checklist

Updated: 2026-05-09

This checklist tracks the work required to turn `file-preview-kit` from a polished repository into installable npm packages that other projects can consume directly.

## Target Packages

- `@file-preview-kit/shared`
- `@file-preview-kit/core`
- `@file-preview-kit/web-components`

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
  - `@file-preview-kit/core` depends on `@file-preview-kit/shared@0.1.0`
  - `@file-preview-kit/web-components` depends on `@file-preview-kit/core@0.1.0` and `@file-preview-kit/shared@0.1.0`
- The published packages are intentionally scoped as `@file-preview-kit/*`; the root workspace package stays private and is not part of the npm release surface.
- Package-level READMEs now include the remote file access/CORS guidance that matters for real adopters.

## Still Required Before First npm Release

1. Confirm npm scope ownership
   - Verify that the `@file-preview-kit` scope is available and controlled by the intended publisher account.
2. Decide the first public npm version
   - Recommendation: keep the first public npm release at `0.1.0` unless you want to declare the API stable immediately with `1.0.0`.
3. Perform a real consumer smoke test
   - Install the packed tarballs into a clean external sample app.
   - Verify that a consumer can import and use:
     - `@file-preview-kit/core`
     - `@file-preview-kit/web-components`
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
2. `pnpm pack:check`
3. Run the clean consumer smoke test
4. `npm login`
5. Publish in dependency order, using pnpm-aware publish commands:
   - `packages/shared`
   - `packages/core`
   - `packages/web-components`
6. Verify install from a clean app using the public registry

## Notes

- The repository can stay private until the public npm release decision is final.
- Publishing to npm is the point where this project becomes a real consumable library, not just a polished codebase.
- The README already sets the correct expectation that browser-readable file sources, CORS, and same-origin/object-storage/proxy strategies matter in production use.
