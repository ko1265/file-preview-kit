# Consumer Smoke Test

This directory holds a minimal external-consumer smoke test for the first npm release.

The workflow validates packed package artifacts rather than source-path imports:

1. build the publishable workspace packages
2. pack `@ko1265/file-preview-kit-shared`, `@ko1265/file-preview-kit-core`, `@ko1265/file-preview-kit-web-components`, and `@ko1265/file-preview-kit-react`
3. install those tarballs into a clean sample app under `.workspace/consumer-app`
4. verify that the sample app can import and minimally use the installed packages, including the React adapter

Run it from the repository root:

```bash
pnpm smoke:consumer
```

By default this allows normal registry resolution for third-party dependencies while keeping the
`@ko1265/*` packages pinned to freshly packed local tarballs.

If you intentionally want a cache-only check, run:

```bash
pnpm smoke:consumer --offline
```

Generated tarballs and the clean sample app stay under this directory and are ignored by git:

- `.artifacts/`
- `.workspace/`
