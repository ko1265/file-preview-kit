import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const elementRegistry = new Map();
const consumerPackageJson = JSON.parse(await readFile(new URL("./package.json", import.meta.url), "utf8"));
const consumerDependencies = consumerPackageJson.dependencies ?? {};
const hasVueAdapter = "@ko1265/file-preview-kit-vue" in consumerDependencies;

globalThis.HTMLElement = class HTMLElement {
  attachShadow() {
    return {
      innerHTML: "",
      querySelector() {
        return null;
      },
      replaceChildren() {}
    };
  }
};

globalThis.customElements = {
  define(name, constructor) {
    if (!elementRegistry.has(name)) {
      elementRegistry.set(name, constructor);
    }
  },
  get(name) {
    return elementRegistry.get(name);
  }
};

globalThis.window = {
  customElements: globalThis.customElements,
  location: {
    href: "https://consumer.example/app/"
  }
};

const sharedModule = await import("@ko1265/file-preview-kit-shared");
assert.ok(sharedModule, "shared package should import successfully");

const { FilePreviewService } = await import("@ko1265/file-preview-kit-core");
const { FilePreviewElement, registerFilePreviewElement } = await import("@ko1265/file-preview-kit-web-components");
const React = await import("react");
const { FilePreview, ensureFilePreviewElementRegistered } = await import("@ko1265/file-preview-kit-react");

const service = new FilePreviewService();
const resolution = service.resolve({
  url: "https://consumer.example/files/readme.md"
});

assert.equal(
  resolution.plugin.descriptor.id,
  "markdown",
  "consumer app should resolve a built-in markdown preview plugin"
);

const registered = registerFilePreviewElement("consumer-smoke-preview");
assert.equal(
  registered,
  FilePreviewElement,
  "registerFilePreviewElement should return the exported constructor"
);
assert.equal(
  globalThis.customElements.get("consumer-smoke-preview"),
  FilePreviewElement,
  "consumer app should be able to register the custom element"
);

await ensureFilePreviewElementRegistered();
assert.equal(
  globalThis.customElements.get("file-preview"),
  FilePreviewElement,
  "React adapter should register the default custom element"
);

const reactElement = React.createElement(FilePreview, {
  src: "https://consumer.example/files/readme.md",
  fileName: "readme.md",
  requestConfig: {
    headers: {
      "X-Smoke": "react"
    }
  },
  onLoad() {}
});
assert.equal(reactElement.type, FilePreview, "React adapter should be consumable through React.createElement");

if (hasVueAdapter) {
  const Vue = await import("vue");
  const vueAdapter = await import("@ko1265/file-preview-kit-vue");

  await vueAdapter.ensureFilePreviewElementRegistered();
  assert.equal(
    globalThis.customElements.get("file-preview"),
    FilePreviewElement,
    "Vue adapter should register the default custom element"
  );

  const vnode = Vue.h(vueAdapter.FilePreview, {
    src: "https://consumer.example/files/readme.md",
    fileName: "readme.md",
    requestConfig: {
      headers: {
        "X-Smoke": "vue"
      }
    },
    onLoad() {}
  });

  assert.equal(vnode.type, vueAdapter.FilePreview, "Vue adapter should be consumable through Vue.h");
}

console.log("consumer smoke verified");
