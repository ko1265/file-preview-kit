# Release Checklist

Updated: 2026-05-09

## Final Check

1. `pnpm build`
2. `pnpm test` when the local environment can run the full Vitest flow
3. Otherwise, re-run the narrow validation set that matters for this prep pass:
   - `pnpm.cmd exec tsc -b tsconfig.json`
   - the targeted demo regression checks used during signoff
4. `pnpm pack:verify`
5. Confirm the demo opens with the compact public sample set.
6. Confirm `PUBLIC_DEMO_NOTE.md`, `PUBLIC_LAUNCH_ASSETS.md`, `SCREENSHOT_CHECKLIST.md`, and `LAUNCH_ASSET.svg` match the README release framing.
7. Confirm no new Office sample breadth was added in this prep pass.

## Release Steps

1. Review `LAUNCH_ASSET.svg` or the latest demo visual against the canonical caption for public release use.
2. Re-read `PUBLIC_DEMO_NOTE.md`, `PUBLIC_LAUNCH_ASSETS.md`, and `SCREENSHOT_CHECKLIST.md` for launch-note wording and the final review path.
3. Re-read `RELEASE_READINESS.md` for the remaining caveats.
4. Publish only the browser-only preview story, not any Office fidelity promise or visual-refresh promise.
5. If the full browser test flow is still blocked by the local runtime, treat the targeted TypeScript/demo checks plus manual screenshot review as the signoff path.

## Keep True

- Public remote samples are example-driven and may change over time.
- Auth handling is a request-shaping example, not a guarantee of endpoint access.
- Office previews stay extraction-oriented and conservative.
- Media previews remain native browser previews.
