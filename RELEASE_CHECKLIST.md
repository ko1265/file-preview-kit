# Release Checklist

Updated: 2026-05-11

## Stable Baseline Check

1. `pnpm build`
2. Re-run the React adapter milestone checks when `packages/react` is part of the release candidate:
   - `pnpm --filter @ko1265/file-preview-kit-react build`
   - `pnpm vitest run tests/react-adapter-contract.test.ts`
   - confirm the React package still behaves as a thin adapter over `@ko1265/file-preview-kit-web-components` rather than a separate rendering path
3. `pnpm test` when the local environment can run the full Vitest flow
4. Otherwise, re-run the narrow validation set that matters for the current repository baseline:
   - `pnpm.cmd exec tsc -b tsconfig.json`
   - the targeted Web Component and demo regression checks used during signoff
   - the focused React adapter build and contract checks above when the React package is in scope
5. `pnpm pack:verify`
6. `pnpm smoke:consumer`
7. Confirm `pnpm pack:verify` still inspects the React tarball entrypoints, README, LICENSE, and internal workspace dependency rewrites when the React package is publishable.
8. Confirm `pnpm smoke:consumer` still exercises the packed React adapter import and minimum component render path alongside the existing consumer checks.
9. Confirm the demo opens with the compact public sample set.
10. Confirm `PUBLIC_DEMO_NOTE.md`, `PUBLIC_LAUNCH_ASSETS.md`, `SCREENSHOT_CHECKLIST.md`, and `LAUNCH_ASSET.svg` match the README framing.
11. Confirm no new Office sample breadth was added beyond the current extraction-oriented scope.

## Future Release Steps

1. Review `LAUNCH_ASSET.svg` or the latest demo visual against the canonical caption for public release use.
2. Re-read `PUBLIC_DEMO_NOTE.md`, `PUBLIC_LAUNCH_ASSETS.md`, and `SCREENSHOT_CHECKLIST.md` for launch-note wording and the final review path.
3. Re-read `RELEASE_READINESS.md` for the still-true caveats and repository-closeout notes.
4. Publish only the browser-only preview story, not any Office fidelity promise or visual-refresh promise.
5. If the full browser test flow is still blocked by the local runtime, treat the targeted TypeScript and consumer-smoke checks plus manual screenshot review as the signoff path.
6. If a v2.0 adapter release is in scope, keep the React contract test and packed-consumer smoke checks in the signoff path even when broader framework work remains unpublished.

## Keep True

- Public remote samples are example-driven and may change over time.
- Auth handling is a request-shaping example, not a guarantee of endpoint access.
- Office previews stay extraction-oriented and conservative.
- Media previews remain native browser previews.
