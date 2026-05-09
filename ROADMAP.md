# Roadmap

Updated: 2026-05-09

## Current Phase

`v1.0-prep`

The project is moving from feature completion into release-facing hardening. The focus is on keeping the browser-only model intact while making the public demo, package docs, and status artifacts accurate enough for a 1.0 readiness pass.

## Release Goals

- Keep public URL preview flows easy to understand and reliable in the demo.
- Make auth-shaped request configuration obvious in both docs and examples.
- Keep Office previews readable, stable, and clearly scoped as extracted previews rather than fidelity renderers.
- Preserve the lightweight media and text preview paths that already work well.
- Keep published package READMEs and repo status files aligned with the current release phase.

## Workstreams

1. Demo and example scenarios
   - Curate one clear example each for public URL, auth URL, Office, and media flows.
   - Keep the demo low-risk, browser-native, and easy to reset by changing the source URL.
2. Docs and planning artifacts
   - Keep `AGENT_STATUS.md`, `STATUS.md`, and roadmap-style docs synchronized.
   - Maintain release-oriented guidance in the root README and package READMEs.
3. Office preview hardening
   - Preserve current readability and safety gains.
   - Add only low-risk fixture breadth or wording improvements during prep.
4. Release hygiene
   - Keep build, test, and package-packing checks green.
   - Watch for regressions in package entrypoints, example URLs, or browser compatibility.
5. npm publication readiness
   - Treat first-class npm consumption as part of the release goal, not as a postscript.
   - Verify scope ownership, publish order, and clean consumer installation before calling the release done.

## Exit Criteria For `v1.0-prep`

- Demo examples clearly cover public, auth, Office, and media preview paths.
- Repo status files describe the same current phase and next actions.
- Package docs remain consistent with the top-level README guidance.
- No new high-risk preview behavior is introduced before release signoff.

## Not In Scope

- Server-side conversion.
- Editing workflows.
- Layout-faithful Office rendering.
- Expanding into legacy `doc`, `xls`, or `ppt` support.
