import assert from "node:assert/strict";

const elementRegistry = new Map();

globalThis.window = {
  location: {
    href: "https://consumer.example/app/"
  }
};

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

const sharedModule = await import("@ko1265/file-preview-kit-shared");
assert.ok(sharedModule, "shared package should import successfully");

const { FilePreviewService } = await import("@ko1265/file-preview-kit-core");
const { FilePreviewElement, registerFilePreviewElement } = await import("@ko1265/file-preview-kit-web-components");

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

console.log("consumer smoke verified");
