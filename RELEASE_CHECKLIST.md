# Release Checklist

Updated: 2026-05-09

## Final Check

1. `pnpm build`
2. `pnpm test`
3. `pnpm pack:check`
4. Confirm the demo opens with the compact public sample set.
5. Confirm `PUBLIC_DEMO_NOTE.md`, `PUBLIC_LAUNCH_ASSETS.md`, `SCREENSHOT_CHECKLIST.md`, and `LAUNCH_ASSET.svg` match the README release framing.
6. Confirm no new Office sample breadth was added in this prep pass.

## Release Steps

1. Review `LAUNCH_ASSET.svg` or the latest demo visual against the canonical caption for public release use.
2. Re-read `PUBLIC_DEMO_NOTE.md`, `PUBLIC_LAUNCH_ASSETS.md`, and `SCREENSHOT_CHECKLIST.md` for launch-note wording and the final review path.
3. Re-read `RELEASE_READINESS.md` for the remaining caveats.
4. Publish only the browser-only preview story, not any Office fidelity promise or visual-refresh promise.

## Keep True

- Public remote samples are example-driven and may change over time.
- Auth handling is a request-shaping example, not a guarantee of endpoint access.
- Office previews stay extraction-oriented and conservative.
- Media previews remain native browser previews.
