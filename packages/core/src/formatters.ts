const extensionToLanguage: Record<string, string> = {
  css: "css",
  html: "html",
  js: "javascript",
  json: "json",
  jsx: "javascript",
  md: "markdown",
  markdown: "markdown",
  mjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  xml: "xml",
  yml: "plaintext",
  yaml: "plaintext"
};

let markdownRendererPromise: Promise<(content: string) => string> | undefined;
let codeRendererPromise: Promise<(content: string, extension: string) => string> | undefined;

async function loadMarkdownRenderer(): Promise<(content: string) => string> {
  if (!markdownRendererPromise) {
    markdownRendererPromise = Promise.all([import("dompurify"), import("marked")]).then(
      ([domPurifyModule, markedModule]) => {
        const createDOMPurify = domPurifyModule.default;
        const purify = createDOMPurify(window);
        const { marked } = markedModule;

        marked.setOptions({
          gfm: true,
          breaks: true
        });

        return (content: string) => purify.sanitize(marked.parse(content) as string);
      }
    );
  }

  return markdownRendererPromise;
}

async function loadCodeRenderer(): Promise<(content: string, extension: string) => string> {
  if (!codeRendererPromise) {
    codeRendererPromise = Promise.all([
      import("highlight.js/lib/core"),
      import("highlight.js/lib/languages/css"),
      import("highlight.js/lib/languages/javascript"),
      import("highlight.js/lib/languages/json"),
      import("highlight.js/lib/languages/markdown"),
      import("highlight.js/lib/languages/plaintext"),
      import("highlight.js/lib/languages/typescript"),
      import("highlight.js/lib/languages/xml")
    ]).then(
      ([
        hljsModule,
        cssModule,
        javascriptModule,
        jsonModule,
        markdownModule,
        plaintextModule,
        typescriptModule,
        xmlModule
      ]) => {
        const hljs = hljsModule.default;
        hljs.registerLanguage("css", cssModule.default);
        hljs.registerLanguage("html", xmlModule.default);
        hljs.registerLanguage("javascript", javascriptModule.default);
        hljs.registerLanguage("json", jsonModule.default);
        hljs.registerLanguage("markdown", markdownModule.default);
        hljs.registerLanguage("plaintext", plaintextModule.default);
        hljs.registerLanguage("typescript", typescriptModule.default);
        hljs.registerLanguage("xml", xmlModule.default);

        return (content: string, extension: string) => {
          const language = extensionToLanguage[extension];
          if (language) {
            return hljs.highlight(content, { language }).value;
          }

          return hljs.highlightAuto(content).value;
        };
      }
    );
  }

  return codeRendererPromise;
}

export function formatJson(content: string): string {
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    return content;
  }
}

export async function renderMarkdownHtml(content: string): Promise<string> {
  const renderer = await loadMarkdownRenderer();
  return renderer(content);
}

export async function renderCodeHtml(content: string, extension: string): Promise<string> {
  const renderer = await loadCodeRenderer();
  return renderer(content, extension);
}

