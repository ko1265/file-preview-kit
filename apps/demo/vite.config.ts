import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // pdf.js and spreadsheet parsing are intentionally large optional chunks in the demo.
    chunkSizeWarningLimit: 1400
  },
  resolve: {
    alias: {
      "@ko1265/file-preview-kit-web-components": fileURLToPath(
        new URL("../../packages/web-components/src/index.ts", import.meta.url)
      ),
      "@ko1265/file-preview-kit-core": fileURLToPath(
        new URL("../../packages/core/src/index.ts", import.meta.url)
      ),
      "@ko1265/file-preview-kit-shared": fileURLToPath(
        new URL("../../packages/shared/src/index.ts", import.meta.url)
      )
    }
  }
});
