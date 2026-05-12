# Angular and Svelte Adapter Decision

Updated: 2026-05-12

## Decision

Promote Svelte first as a lightweight action/helper over the existing Web Component. Keep Angular on the documented Web Component path until a real Angular package is justified.

## Why

Svelte has a small integration gap: every consumer repeats `onMount`, custom element registration, DOM property assignment, and native event wiring. A tiny action/helper can remove that boilerplate without owning preview rendering or introducing a compiler scaffold.

Angular is different. A useful Angular adapter should be a directive or component packaged in Angular's format, with Angular peer dependencies and Angular build tooling. A plain TypeScript helper would not be meaningfully more Angular-friendly than the current `CUSTOM_ELEMENTS_SCHEMA` Web Component guide, so adding `packages/angular` now would create maintenance cost without enough user value.

## Guardrails

- Do not reimplement preview rendering in framework packages.
- Keep `@ko1265/file-preview-kit-web-components` as the browser-native foundation.
- Keep object options as DOM properties, not serialized attributes.
- Keep registration and DOM work client-only.
- Revisit Angular only when there is a concrete directive/component API that removes real Angular friction.
