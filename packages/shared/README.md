# @ko1265/file-preview-kit-shared

Shared preview contracts and types for `file-preview-kit`.

## What it contains

- file source and resolution types
- preview plugin contracts
- request configuration and fetch context types
- Office workbook preview option types

## Install

```bash
pnpm add @ko1265/file-preview-kit-shared
```

## Usage

```ts
import type {
  FilePreviewPlugin,
  FilePreviewRequestConfig,
  FileSource
} from "@ko1265/file-preview-kit-shared";
```

This package is type-focused. Most applications will consume it indirectly through `@ko1265/file-preview-kit-core` or `@ko1265/file-preview-kit-web-components`.
