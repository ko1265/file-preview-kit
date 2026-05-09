# file-preview-kit v1.0-prep Public Demo Note

Updated: 2026-05-09

`file-preview-kit` is a browser-only TypeScript preview toolkit for remote files. This pre-release pass keeps the scope intentionally narrow: the goal is to make the demo, package docs, and public messaging feel release-ready without drifting into server conversion or Office fidelity work. No server-side conversion is involved.

The remote examples assume browser-readable file sources. Public endpoint availability is not guaranteed, and deploying the host app on `https` does not remove cross-origin restrictions by itself.

## What To Show

- A remote README preview in the demo.
- Auth-shaped request handling using `requestConfig`.
- readable Office extracts for `docx`, `xlsx`, and `pptx`.
- native media previews for image, audio, and video.

The Office screenshot scenes use local static demo files so the release capture stays stable.
If the release visual needs a refresh, use `LAUNCH_ASSET.svg` together with `SCREENSHOT_CHECKLIST.md` and its manual fallback path.

## Public Message

`file-preview-kit` previews remote files directly in the browser with Web Components. It is designed for readable, client-side file viewing, not editing or layout-faithful Office rendering.

## Screenshot Caption

"A compact browser-only preview demo covering public URL, auth-shaped request handling, Office extracts, and media previews."

## Suggested Walkthrough

1. Start with the public README sample to establish the remote preview flow.
2. Switch to the auth sample to show request shaping rather than secret handling.
3. Move to the Office samples to show readable browser previews with conservative extraction.
4. Finish with media previews to show the lighter-weight native paths.

## Launch Asset

The screenshot-level release visual is [LAUNCH_ASSET.svg](LAUNCH_ASSET.svg). It matches the caption above and is meant to stay in sync with the README release framing.

## Release Framing

- Public remote samples are there to demonstrate the preview flow, not to guarantee long-term endpoint stability.
- Public remote samples must still be browser-readable and CORS-compatible.
- Auth behavior is shown as request-shaping guidance.
- Office previews are extraction-oriented browser previews, not fidelity renderers.
- The screenshot path for Office uses local static demo files so it does not depend on remote fetch success.

## Short Launch Copy

`file-preview-kit` is moving through `v1.0-prep` with a tighter public demo, clearer request-auth guidance, and a more explicit release story. The previewer stays browser-only, Web Components-first, and focused on readable extracts for remote files, with `LAUNCH_ASSET.svg`, `SCREENSHOT_CHECKLIST.md`, and manual fallback as the final release path.
