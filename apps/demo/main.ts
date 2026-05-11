import {
  registerFilePreviewElement,
  type FilePreviewElement
} from "@ko1265/file-preview-kit-web-components";

type Locale = "en" | "zh";

type Sample = {
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  url: string;
  mimeType: string;
  fileName?: string;
  requestConfig?: FilePreviewElement["requestConfig"];
};

registerFilePreviewElement();

const samples: Sample[] = [
  {
    label: { en: "Public URL", zh: "公开 URL" },
    description: {
      en: "A public README fetched from GitHub raw content",
      zh: "从 GitHub Raw 拉取的公开 README"
    },
    url: "https://raw.githubusercontent.com/microsoft/TypeScript/main/README.md",
    mimeType: "text/markdown"
  },
  {
    label: { en: "Auth URL", zh: "鉴权 URL" },
    description: {
      en: "A basic-auth endpoint showing fetch auth shaping",
      zh: "展示抓取鉴权配置的 basic auth 端点"
    },
    url: "https://httpbin.org/basic-auth/demo/preview",
    mimeType: "application/json",
    requestConfig: {
      authScheme: "Basic",
      authToken: "ZGVtbzpwcmV2aWV3"
    }
  },
  {
    label: { en: "Office DOCX", zh: "Office DOCX" },
    description: {
      en: "A local Word sample rendered as sanitized HTML",
      zh: "公开 Word 样例，展示清洗后的 HTML 预览"
    },
    url: "/office-screenshot.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  },
  {
    label: { en: "Office XLSX", zh: "Office XLSX" },
    description: {
      en: "A local workbook sample with spreadsheet preview limits",
      zh: "展示工作簿预览限制的电子表格样例"
    },
    url: "/office-screenshot.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    requestConfig: {
      office: {
        workbook: {
          maxSheets: 4,
          maxRows: 40,
          maxColumns: 10
        }
      }
    }
  },
  {
    label: { en: "Office PPTX", zh: "Office PPTX" },
    description: {
      en: "A local slide deck sample focused on extracted text",
      zh: "突出提取文本结果的幻灯片样例"
    },
    url: "/office-screenshot.pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  },
  {
    label: { en: "Image", zh: "图片" },
    description: {
      en: "A public image preview",
      zh: "公开图片预览"
    },
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    mimeType: "image/jpeg"
  },
  {
    label: { en: "Video", zh: "视频" },
    description: {
      en: "A short MP4 sample",
      zh: "短视频样例"
    },
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    mimeType: "video/mp4"
  },
  {
    label: { en: "Audio", zh: "音频" },
    description: {
      en: "A short audio sample",
      zh: "短音频样例"
    },
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
    mimeType: "audio/mpeg"
  },
  {
    label: { en: "JSON", zh: "JSON" },
    description: {
      en: "A remote package manifest",
      zh: "远程 package 清单"
    },
    url: "https://raw.githubusercontent.com/vitejs/vite/main/packages/vite/package.json",
    mimeType: "application/json"
  },
  {
    label: { en: "PDF", zh: "PDF" },
    description: {
      en: "A local sample PDF",
      zh: "本地示例 PDF"
    },
    url: "/sample.pdf",
    mimeType: "application/pdf"
  }
];

const copy: Record<
  Locale,
  {
    strap: string;
    title: string;
    intro: string;
    inputPlaceholder: string;
    loadButton: string;
    switchLabel: string;
    switchTo: string;
  }
> = {
  en: {
    strap: "Standalone open-source preview library",
    title: "Remote file preview with Web Components.",
    intro:
      "This demo renders files directly from remote URLs with a plugin-driven client-side architecture. The curated examples below cover public URLs, auth-shaped requests, Office documents, and media previews so the release story stays concrete.",
    inputPlaceholder: "https://example.com/readme.md",
    loadButton: "Load preview",
    switchLabel: "Language",
    switchTo: "中文"
  },
  zh: {
    strap: "面向远程文件预览的开源组件库",
    title: "使用 Web Components 预览远程文件。",
    intro:
      "这个演示直接从远程 URL 渲染文件，采用插件驱动的前端架构。下面的示例覆盖公开 URL、鉴权请求、Office 文档和媒体预览，便于把发布故事讲清楚。",
    inputPlaceholder: "https://example.com/readme.md",
    loadButton: "加载预览",
    switchLabel: "语言",
    switchTo: "English"
  }
};

function requireElement<T>(element: T | null, selector: string): T {
  if (!element) {
    throw new Error(`Demo UI failed to initialize: missing ${selector}.`);
  }

  return element;
}

const preview = requireElement(document.querySelector<FilePreviewElement>("#preview"), "#preview");
const srcInput = requireElement(document.querySelector<HTMLInputElement>("#src-input"), "#src-input");
const sampleSelect = requireElement(
  document.querySelector<HTMLSelectElement>("#sample-select"),
  "#sample-select"
);
const loadButton = requireElement(
  document.querySelector<HTMLButtonElement>("#load-button"),
  "#load-button"
);
const sampleGrid = requireElement(
  document.querySelector<HTMLDivElement>("#sample-grid"),
  "#sample-grid"
);
const langButton = requireElement(
  document.querySelector<HTMLButtonElement>("#lang-button"),
  "#lang-button"
);
const strap = requireElement(document.querySelector<HTMLElement>("[data-copy='strap']"), "[data-copy='strap']");
const title = requireElement(document.querySelector<HTMLElement>("[data-copy='title']"), "[data-copy='title']");
const intro = requireElement(document.querySelector<HTMLElement>("[data-copy='intro']"), "[data-copy='intro']");
const switchLabel = requireElement(
  document.querySelector<HTMLElement>("[data-copy='switch-label']"),
  "[data-copy='switch-label']"
);

let locale: Locale = "en";
let activeSampleIndex = getInitialSampleIndex();

function getInitialSampleIndex(): number {
  const sampleParam = Number(new URLSearchParams(window.location.search).get("sample"));
  return Number.isInteger(sampleParam) && sampleParam >= 0 && sampleParam < samples.length ? sampleParam : 0;
}

function applySample(sample: Sample): void {
  srcInput.value = sample.url;
  preview.setAttribute("mime-type", sample.mimeType);
  preview.setAttribute("src", sample.url);
  preview.requestConfig = sample.requestConfig;
}

function loadCustomSource(source: string): void {
  preview.removeAttribute("mime-type");
  preview.requestConfig = undefined;
  preview.setAttribute("src", source);
}

function renderSamples(): void {
  sampleSelect.innerHTML = samples
    .map(
      (sample, index) =>
        `<option value="${index}">${sample.label[locale]} - ${sample.description[locale]}</option>`
    )
    .join("");

  sampleGrid.innerHTML = samples
    .map(
      (sample, index) => `
        <button class="sample" type="button" data-sample-index="${index}">
          <strong>${sample.label[locale]}</strong>
          <span>${sample.description[locale]}</span>
        </button>
      `
    )
    .join("");
}

function applyLocale(): void {
  const activeCopy = copy[locale];
  document.documentElement.lang = locale;
  strap.textContent = activeCopy.strap;
  title.textContent = activeCopy.title;
  intro.textContent = activeCopy.intro;
  srcInput.placeholder = activeCopy.inputPlaceholder;
  loadButton.textContent = activeCopy.loadButton;
  switchLabel.textContent = `${activeCopy.switchLabel}:`;
  langButton.textContent = activeCopy.switchTo;
  renderSamples();
  sampleSelect.value = String(activeSampleIndex);
}

function loadSample(index: number): void {
  const sample = samples[index];
  if (!sample) {
    return;
  }

  activeSampleIndex = index;
  applySample(sample);
  sampleSelect.value = String(index);
}

sampleSelect.addEventListener("change", () => {
  loadSample(Number(sampleSelect.value));
});

loadButton.addEventListener("click", () => {
  if (srcInput.value) {
    loadCustomSource(srcInput.value);
  }
});

sampleGrid.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest<HTMLButtonElement>("[data-sample-index]");
  if (!button) {
    return;
  }

  loadSample(Number(button.dataset.sampleIndex));
});

langButton.addEventListener("click", () => {
  locale = locale === "en" ? "zh" : "en";
  applyLocale();
});

applyLocale();
loadSample(activeSampleIndex);
