# Release Readiness

Updated: 2026-05-11

This note is now a post-closeout status record for the repository's `v1.0` baseline and the already-published `0.1.0` npm packages.

## Stable Facts

- Public demo framing is covered in the README, launch note, and launch assets.
- Remote file examples are documented as browser-readable sources, not just publicly reachable URLs.
- Auth-shaped request handling is documented and exercised.
- Office preview scope is explicitly limited to readable browser extracts.
- Package READMEs and repo planning docs are aligned with the stable `v1.0` product story.
- Packed tarball structure is verified with `pnpm pack:verify`.
- A clean external-consumer smoke path exists via `pnpm smoke:consumer`.
- The first public npm version was published as `0.1.0`.
- A post-publish registry install check has already been completed.

## Still True

- Office previews stay extraction-oriented, not layout-faithful.
- Public and auth samples are examples, not endpoint guarantees.
- Deploying on `https` does not by itself remove cross-origin restrictions.
- Manual review is still the fallback path for any scene that is not worth re-validating in the current runtime.
- `LAUNCH_ASSET.svg` remains the fallback release-facing visual for the package and README story.
- The screenshot checklist remains the minimal review path for blocked or low-priority scenes.

## Repository Closeout Notes

- The repository now treats its current API, package boundaries, and browser-only expectations as the `v1.0` baseline.
- The public npm packages remain on `0.1.0` until a future versioned follow-up is published.
- A future public GitHub repository opening should happen after operator review, not as part of normal code churn.

## Next Read

- [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md)
- [PUBLIC_DEMO_NOTE.md](PUBLIC_DEMO_NOTE.md)
- [PUBLIC_LAUNCH_ASSETS.md](PUBLIC_LAUNCH_ASSETS.md)
- [SCREENSHOT_CHECKLIST.md](SCREENSHOT_CHECKLIST.md)
