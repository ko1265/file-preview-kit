# Next Steps

Updated: 2026-05-11

## Immediate Queue

1. Keep v2.0 work on `v2-framework-adapters`.
2. Use [V2_DEVELOPMENT_PLAN.md](V2_DEVELOPMENT_PLAN.md) as the v2.0 implementation plan.
3. Keep any active kanban as a local working board; do not treat it as release documentation.
4. Start with the React adapter package and prove the adapter boundary before adding Vue.
5. Keep Angular and Svelte as documented integration paths until full package value is proven.

## Decision Points

- If a framework adapter starts duplicating preview rendering logic, stop and move the logic back to `core` or `web-components`.
- If React exposes missing Web Component ergonomics, fix the shared Web Component surface before copying workarounds into every adapter.
- If Vue does not add enough value beyond direct Web Component usage, keep it thin and documentation-heavy.
- If Angular or Svelte users need more than docs/smoke examples, promote that framework to a package milestone.

## Checkpoint

The current stage boundary is: `v1.0` remains the stable browser-only preview baseline, and `v2.0` adds framework-friendly integration without expanding preview scope.
