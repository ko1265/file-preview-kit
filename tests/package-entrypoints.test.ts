import { describe, expect, it } from "vitest";

describe("package entrypoints", () => {
  it("import the built core entrypoint without module resolution errors", async () => {
    await expect(import("../packages/core/dist/index.js")).resolves.toBeTruthy();
  });

  it("import the built shared entrypoint without module resolution errors", async () => {
    await expect(import("../packages/shared/dist/index.js")).resolves.toBeTruthy();
  });

  it("import the built web-components entrypoint without module resolution errors", async () => {
    await expect(import("../packages/web-components/dist/index.js")).resolves.toBeTruthy();
  });

  it("import the built react entrypoint without module resolution errors", async () => {
    await expect(import("../packages/react/dist/index.js")).resolves.toBeTruthy();
  });
});
