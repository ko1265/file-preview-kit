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

The project has completed its `v1.0` closeout for the current product scope.

The stable promise is now:

- browser-only preview
- clear package boundaries
- explicit request-shaping support
- extraction-oriented Office previews
- conservative maintenance instead of broad feature expansion

The first public npm release is already live as `0.1.0`. The repository itself remains in a maintenance-oriented post-closeout state until any future operator-led public GitHub opening or follow-up package release.

## Agent Roles

- `Doc`: implementation
- `Hubble`: testing and verification
- `Claude`: optional code simplification / cleanup, only when explicitly requested

## Current Priorities

1. Preserve the `v1.0` baseline across code, docs, and demo behavior.
2. Improve real consumer ergonomics when issues are low-risk and well-scoped.
3. Avoid over-investing in new preview scope before a clear product decision.

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
7. Continue according to the stable maintenance priorities unless the user explicitly reprioritizes

## Notes On Status Files

- `AGENT_STATUS.md` is the long-running agent-facing board used in this workspace.
- `STATUS.md` is the project-facing heartbeat board used in this workspace.
- `KANBAN.md` is the compact right-side task/progress board shown in the app.
- `AGENT_HANDOFF.md` remains a handoff note rather than the canonical long-term board.
