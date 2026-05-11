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

The project has completed its `v1.0` closeout for the current product scope and is now planning `v2.0` framework adapters.

The stable promise is now:

- browser-only preview
- clear package boundaries
- explicit request-shaping support
- extraction-oriented Office previews
- conservative maintenance instead of broad feature expansion

The first public npm release is already live as `0.1.0`. The next active direction is to make the library easier to consume from React, Vue, Angular, and Svelte without duplicating the preview engine.

## Agent Roles

- `Doc`: implementation
- `Hubble`: testing and verification
- `Claude`: optional code simplification / cleanup, only when explicitly requested

## Current Priorities

1. Preserve the `v1.0` baseline across code, docs, and demo behavior.
2. Add framework-friendly adapters as thin wrappers over the shared core/Web Component foundation.
3. Start with React, then Vue; keep Angular and Svelte as documented integration paths until full package value is proven.
4. Avoid over-investing in new preview scope while doing framework integration.

## Known Constraints

- Office previews are extraction-oriented and readable, not layout-faithful.
- Remote previews depend on browser CORS behavior.
- Some local `vitest` / `vite` flows may hit environment-level `esbuild spawn EPERM`.
- Screenshot-grade browser automation is limited by the current runtime environment.

## Recovery Checklist

When resuming work:

1. Read `ROADMAP.md`
2. Read `NEXT_STEPS.md`
3. Read `V2_DEVELOPMENT_PLAN.md`
4. Read `RELEASE_READINESS.md`
5. Read `README.md`
6. Check current `git status`
7. Continue according to the v2.0 framework-adapter priorities unless the user explicitly reprioritizes

## Notes On Status Files

- `AGENT_STATUS.md` is the long-running agent-facing board used in this workspace.
- `STATUS.md` is the project-facing heartbeat board used in this workspace.
- `KANBAN.md`, when present locally, is the compact right-side task/progress board shown in the app and is not release documentation.
- `AGENT_HANDOFF.md` remains a handoff note rather than the canonical long-term board.
