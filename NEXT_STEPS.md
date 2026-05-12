# Next Steps

Updated: 2026-05-11

## Immediate Queue

1. Keep v2.0 work on `v2-framework-adapters`.
2. Use [V2_DEVELOPMENT_PLAN.md](V2_DEVELOPMENT_PLAN.md) as the v2.0 implementation plan.
3. Keep any active kanban as a local working board; do not treat it as release documentation.
4. React and Vue adapter milestones are complete enough for review.
5. Promote Svelte as a lightweight action/helper only if it removes repeated Web Component boilerplate without adding a compiler scaffold.
6. Keep Angular as a documented Web Component integration until an Angular-specific directive/component package is justified.

## Decision Points

- If a framework adapter starts duplicating preview rendering logic, stop and move the logic back to `core` or `web-components`.
- If React exposes missing Web Component ergonomics, fix the shared Web Component surface before copying workarounds into every adapter.
- If Vue does not add enough value beyond direct Web Component usage, keep it thin and documentation-heavy.
- If Svelte users need less boilerplate, keep the package as a tiny action/helper over the Web Component.
- If Angular users need more than docs/smoke examples, promote Angular only with real Angular package tooling; do not ship a fake plain-TS Angular package.

## Checkpoint

The current stage boundary is: `v1.0` remains the stable browser-only preview baseline, and `v2.0` adds framework-friendly integration without expanding preview scope.
