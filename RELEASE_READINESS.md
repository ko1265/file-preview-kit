# Release Readiness

Updated: 2026-05-09

This note now points to the short, final-facing release checklist and keeps only the caveats that still matter before public release.

## Already Aligned

- Public demo framing is covered in the README, launch note, and launch assets.
- Remote file examples are documented as browser-readable sources, not just publicly reachable URLs.
- Auth-shaped request handling is documented and exercised.
- Office preview scope is explicitly limited to readable browser extracts.
- Package READMEs and repo status files are aligned with the current release phase.
- Packed tarball structure is now verified with `pnpm pack:verify`.
- A clean external-consumer smoke path now exists via `pnpm smoke:consumer`.
- The first public npm version is now locked to `0.1.0`.

## Still True

- Office previews stay extraction-oriented, not layout-faithful.
- Public and auth samples are examples, not endpoint guarantees.
- Deploying on `https` does not by itself remove cross-origin restrictions.
- No new Office sample breadth should be added in this prep pass.
- Manual review is the release path for any scene that is not worth re-validating in this environment.
- `LAUNCH_ASSET.svg` remains the fallback release-facing visual for the package and README story.
- The screenshot checklist is the minimal release-check path for the remaining blocked or low-priority scenes.
- When the full local `vitest` flow is blocked by the current runtime, the release-prep signoff path falls back to the narrow TypeScript/demo checks plus manual screenshot review.
- A first public release still needs the actual publish run plus one post-publish registry install check.

## Next Read

- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- [PUBLIC_DEMO_NOTE.md](PUBLIC_DEMO_NOTE.md)
- [PUBLIC_LAUNCH_ASSETS.md](PUBLIC_LAUNCH_ASSETS.md)
- [SCREENSHOT_CHECKLIST.md](SCREENSHOT_CHECKLIST.md)
