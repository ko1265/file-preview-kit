# file-preview-kit Public Demo Note

Updated: 2026-05-11

`file-preview-kit` is a browser-only TypeScript preview toolkit for remote files. The demo now represents the stable `v1.0` product story: readable client-side previews, explicit browser-fetch constraints, and conservative Office support without drifting into server conversion or layout fidelity work.

The remote examples assume browser-readable file sources. Public endpoint availability is not guaranteed, and deploying the host app on `https` does not remove cross-origin restrictions by itself.

## What To Show

- A remote README preview in the demo.
- Auth-shaped request handling using `requestConfig`.
- Readable Office extracts for `docx`, `xlsx`, and `pptx`.
- Native media previews for image, audio, and video.

The Office screenshot scenes use local static demo files so the release capture stays stable. If the release visual needs a refresh, use `LAUNCH_ASSET.svg` together with `SCREENSHOT_CHECKLIST.md` and its manual fallback path.

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

## Stable Framing

- Public remote samples are there to demonstrate the preview flow, not to guarantee long-term endpoint stability.
- Public remote samples must still be browser-readable and CORS-compatible.
- Auth behavior is shown as request-shaping guidance.
- Office previews are extraction-oriented browser previews, not fidelity renderers.
- The screenshot path for Office uses local static demo files so it does not depend on remote fetch success.
