# Project Context

## Project

- Name: `file-preview-kit`
- Type: pure-frontend npm library
- Delivery shape: TypeScript monorepo + Web Components + demo app

## Goal

Provide a reusable browser-side file preview library for remote URLs with:

- PDF
- text / markdown / JSON / XML / YAML / CSV
- code files
- image / audio / video
- basic Office previews for `docx` / `xlsx` / `pptx`

The product direction is readable preview first, not Office layout fidelity.

## Current Stage

The project has completed the main `v0.1` to `v0.3` implementation and hardening work.
The active roadmap is now in `v1.0-prep`, focused on:

- roadmap / next-step clarity
- demo and public-facing examples
- release-readiness checks
- public demo / launch-note style presentation

## Agent Roles

- `Doc`: implementation
- `Hubble`: testing and verification
- `Claude`: optional code simplification / cleanup, only when explicitly requested

## Current Priorities

1. Finish `v1.0-prep` release-facing artifacts.
2. Improve demo/public presentation rather than expanding more Office scope.
3. Keep `pptx` low priority.

## Known Constraints

- Office previews are extraction-oriented and readable, not layout-faithful.
- Remote previews depend on browser CORS behavior.
- Some local `vitest` / `vite` flows may hit environment-level `esbuild spawn EPERM`.
- Screenshot-grade browser automation is limited by the current runtime environment.

## Recovery Checklist

When resuming work:

1. Read `ROADMAP.md`
2. Read `NEXT_STEPS.md`
3. Read `RELEASE_READINESS.md`
4. Read `PUBLIC_DEMO_NOTE.md`
5. Read `README.md`
6. Check current `git status`
7. Continue according to the roadmap order unless the user explicitly reprioritizes

## Notes On Status Files

- `AGENT_STATUS.md` is a transient handoff file for agent-to-agent continuation.
- `STATUS.md` is a transient project heartbeat/log.
- Both are intentionally treated as working notes rather than stable repository docs.
