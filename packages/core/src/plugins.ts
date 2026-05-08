import { fetchTextContent } from "./content";
import { formatJson, renderCodeHtml, renderMarkdownHtml } from "./formatters";
import type {
  FilePreviewDescriptor,
  FilePreviewMatchContext,
  FilePreviewPlugin,
  FilePreviewRenderContext
} from "@file-preview-kit/shared";
import { hasExtension, hasMimeType } from "./file-source";
import { officePlugin } from "./office";
import { pdfPlugin } from "./pdf";
import { createContainer, createMessageCard } from "./render-utils";

const textExtensions = [
  "txt",
  "md",
  "markdown",
  "json",
  "xml",
  "yaml",
  "yml",
  "csv",
  "log"
];

const codeExtensions = [
  "ts",
  "tsx",
  "js",
  "jsx",
  "mjs",
  "cjs",
  "css",
  "scss",
  "html",
  "sh",
  "py",
  "java",
  "go",
  "rs"
];

const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "bmp"];
const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac", "flac"];
const videoExtensions = ["mp4", "webm", "mov", "m4v", "ogv"];

function createTextPreviewElement(
  descriptor: FilePreviewDescriptor,
  renderer: (
    content: string,
    context: FilePreviewRenderContext
  ) => HTMLElement | Promise<HTMLElement>
): FilePreviewPlugin {
  return {
    descriptor,
    canPreview(context: FilePreviewMatchContext) {
      return (
        hasExtension(context.source, descriptor.extensions ?? []) ||
        hasMimeType(context.source, descriptor.mimeTypes ?? [])
      );
    },
    async render(context: FilePreviewRenderContext) {
      const content = await fetchTextContent(context);
      return renderer(content, context);
    }
  };
}

function createMediaPlugin(
  descriptor: FilePreviewDescriptor,
  tagName: "img" | "audio" | "video"
): FilePreviewPlugin {
  return {
    descriptor,
    canPreview(context: FilePreviewMatchContext) {
      return (
        hasExtension(context.source, descriptor.extensions ?? []) ||
        hasMimeType(context.source, descriptor.mimeTypes ?? [])
      );
    },
    async render(context: FilePreviewRenderContext) {
      const wrapper = createContainer("fpk-media-preview");
      const element = document.createElement(tagName);
      element.setAttribute("src", context.source.url);
      if (tagName === "audio" || tagName === "video") {
        element.setAttribute("controls", "true");
      }
      if (tagName === "video") {
        element.setAttribute("playsinline", "true");
      }
      wrapper.append(element);
      return wrapper;
    }
  };
}

export const markdownPlugin = createTextPreviewElement(
  {
    id: "markdown",
    kind: "markdown",
    label: "Markdown",
    priority: 70,
    extensions: ["md", "markdown"],
    mimeTypes: ["text/markdown", "text/x-markdown"],
    capabilities: {
      textFetch: true
    }
  },
  async (content) => {
    const wrapper = createContainer("fpk-markdown-preview");
    wrapper.innerHTML = await renderMarkdownHtml(content);
    return wrapper;
  }
);

export const structuredTextPlugin = createTextPreviewElement(
  {
    id: "structured-text",
    kind: "json",
    label: "Structured text",
    priority: 60,
    extensions: ["json", "xml", "yaml", "yml", "csv"],
    mimeTypes: [
      "application/json",
      "application/xml",
      "text/xml",
      "application/yaml",
      "text/yaml",
      "text/csv"
    ],
    capabilities: {
      textFetch: true
    }
  },
  (content, context) => {
    const wrapper = createContainer("fpk-text-preview");
    const pre = document.createElement("pre");
    pre.textContent = context.source.extension === "json" ? formatJson(content) : content;
    wrapper.append(pre);
    return wrapper;
  }
);

export const codePlugin = createTextPreviewElement(
  {
    id: "code",
    kind: "code",
    label: "Code",
    priority: 55,
    extensions: codeExtensions,
    mimeTypes: ["text/javascript", "application/javascript", "text/css", "text/html"],
    capabilities: {
      textFetch: true
    }
  },
  async (content, context) => {
    const wrapper = createContainer("fpk-code-preview");
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    code.innerHTML = await renderCodeHtml(content, context.source.extension);
    pre.append(code);
    wrapper.append(pre);
    return wrapper;
  }
);

export const plainTextPlugin = createTextPreviewElement(
  {
    id: "text",
    kind: "text",
    label: "Plain text",
    priority: 50,
    extensions: textExtensions,
    mimeTypes: ["text/plain"],
    capabilities: {
      textFetch: true
    }
  },
  (content) => {
    const wrapper = createContainer("fpk-text-preview");
    const pre = document.createElement("pre");
    pre.textContent = content;
    wrapper.append(pre);
    return wrapper;
  }
);

export const imagePlugin = createMediaPlugin(
  {
    id: "image",
    kind: "image",
    label: "Image",
    priority: 80,
    extensions: imageExtensions,
    mimeTypes: [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "image/avif",
      "image/bmp"
    ],
    capabilities: {
      mediaStreaming: true
    }
  },
  "img"
);

export const audioPlugin = createMediaPlugin(
  {
    id: "audio",
    kind: "audio",
    label: "Audio",
    priority: 80,
    extensions: audioExtensions,
    mimeTypes: [
      "audio/mpeg",
      "audio/wav",
      "audio/ogg",
      "audio/mp4",
      "audio/flac"
    ],
    capabilities: {
      mediaStreaming: true
    }
  },
  "audio"
);

export const videoPlugin = createMediaPlugin(
  {
    id: "video",
    kind: "video",
    label: "Video",
    priority: 80,
    extensions: videoExtensions,
    mimeTypes: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
    capabilities: {
      mediaStreaming: true
    }
  },
  "video"
);

export const fallbackPlugin: FilePreviewPlugin = {
  descriptor: {
    id: "fallback",
    kind: "unknown",
    label: "Fallback",
    priority: -100
  },
  canPreview() {
    return true;
  },
  async render(context) {
    return createMessageCard(
      "Preview unavailable",
      `No registered previewer can render ${context.source.normalizedName} yet.`
    );
  }
};

export function createDefaultPlugins(): FilePreviewPlugin[] {
  return [
    pdfPlugin,
    imagePlugin,
    audioPlugin,
    videoPlugin,
    markdownPlugin,
    structuredTextPlugin,
    codePlugin,
    plainTextPlugin,
    officePlugin,
    fallbackPlugin
  ];
}
