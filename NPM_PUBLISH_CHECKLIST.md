# npm Publish Checklist

Updated: 2026-05-11

This checklist tracks the first public npm release work for `file-preview-kit`, the resulting historical record, and the guardrails that should still apply before any future public `1.0.0` publish.

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
  - `@ko1265/file-preview-kit-core` depends on `@ko1265/file-preview-kit-shared` at the current workspace version
  - `@ko1265/file-preview-kit-web-components` depends on `@ko1265/file-preview-kit-core` and `@ko1265/file-preview-kit-shared` at the current workspace version
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

## First Release Outcome

1. Confirm npm scope ownership
   - Confirmed: the `@ko1265` scope is controlled by the intended publisher account.
2. Decide the first public npm version
   - Confirmed: the first public npm release stays at `0.1.0`.
3. Perform a real consumer smoke test
   - Run `pnpm smoke:consumer`.
   - Let the sample app resolve third-party dependencies normally; use `--offline` only for an intentional cache-only recheck.
   - Completed before release.
4. Confirm publish order
   - Publish `shared` first
   - Then `core`
   - Then `web-components`
   - Completed in that order for `0.1.0`.
5. Confirm release operator steps
   - `npm login`
   - `pnpm build`
   - `pnpm pack:verify`
   - use `pnpm publish` or package-folder publish flows that preserve the pnpm tarball rewrite behavior for `workspace:*` dependencies
   - publish packages with public access
   - Completed for `0.1.0`.

## Post-Release Follow-Up

1. Keep one real registry install check recorded after the public release.
   - Completed for `0.1.0`.
2. Watch for real consumer feedback around:
   - package naming clarity
   - browser-only/CORS expectations
   - Web Component integration ergonomics
3. Use the next release only for targeted fixes or documentation follow-up unless product priorities change.

## Future 1.0 Publish Guardrails

1. If the GitHub repository is still private, do not publish a public `1.0.0` package set that points users at inaccessible repository, bug, or homepage URLs.
2. Keep the browser-only boundary honest in all operator checks. A pure Node import of `@ko1265/file-preview-kit-web-components` is not by itself a valid success criterion without a minimal browser-like stub.
3. Treat the repository's local `1.0.0` version as the engineering baseline until a human operator chooses to publish that version externally.

## Published Packages

- `@ko1265/file-preview-kit-shared@0.1.0`
- `@ko1265/file-preview-kit-core@0.1.0`
- `@ko1265/file-preview-kit-web-components@0.1.0`

## Notes

- The repository can stay private while engineering closeout continues, even though the npm packages are now public.
- Publishing to npm has now happened; the next question is when the operator wants to pair a future public package release with a public repository opening.
- The README already sets the correct expectation that browser-readable file sources, CORS, and same-origin/object-storage/proxy strategies matter in production use.
