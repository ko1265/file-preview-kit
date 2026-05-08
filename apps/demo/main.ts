import { registerFilePreviewElement } from "@file-preview-kit/web-components";

type Locale = "en" | "zh";

type Sample = {
  label: Record<Locale, string>;
  description: Record<Locale, string>;
  url: string;
  mimeType: string;
};

registerFilePreviewElement();

const samples: Sample[] = [
  {
    label: { en: "Markdown", zh: "Markdown" },
    description: {
      en: "README from a public repo",
      zh: "来自公开仓库的 README"
    },
    url: "https://raw.githubusercontent.com/microsoft/TypeScript/main/README.md",
    mimeType: "text/markdown"
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
    label: { en: "Image", zh: "图片" },
    description: {
      en: "High quality sample image",
      zh: "高清示例图片"
    },
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    mimeType: "image/jpeg"
  },
  {
    label: { en: "Video", zh: "视频" },
    description: {
      en: "Short sample video",
      zh: "短视频示例"
    },
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    mimeType: "video/mp4"
  },
  {
    label: { en: "Audio", zh: "音频" },
    description: {
      en: "Short sample audio",
      zh: "短音频示例"
    },
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
    mimeType: "audio/mpeg"
  },
  {
    label: { en: "PDF", zh: "PDF" },
    description: {
      en: "Local sample PDF",
      zh: "本地示例 PDF"
    },
    url: "/sample.pdf",
    mimeType: "application/pdf"
  },
  {
    label: { en: "Office", zh: "Office" },
    description: {
      en: "docx fallback example",
      zh: "docx 示例"
    },
    url: "https://file-examples.com/storage/fe1b1f4dbedf280facafd0f/2017/02/file-sample_100kB.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
      "This demo renders files directly from remote URLs with a plugin-driven client-side architecture. PDF, text, code, image, audio, video, and early Office Open XML hooks are included in the v0.1 foundation.",
    inputPlaceholder: "https://example.com/readme.md",
    loadButton: "Load preview",
    switchLabel: "Language",
    switchTo: "中文"
  },
  zh: {
    strap: "面向远程文件预览的开源组件库",
    title: "用 Web Components 预览远程文件。",
    intro:
      "这个演示会直接从远程 URL 渲染文件，采用插件驱动的前端架构。当前 v0.1 已包含 PDF、文本、代码、图片、音视频，以及 Office Open XML 的基础能力。",
    inputPlaceholder: "https://example.com/readme.md",
    loadButton: "加载预览",
    switchLabel: "语言",
    switchTo: "English"
  }
};

const preview = document.querySelector<HTMLElement>("#preview");
const srcInput = document.querySelector<HTMLInputElement>("#src-input");
const sampleSelect = document.querySelector<HTMLSelectElement>("#sample-select");
const loadButton = document.querySelector<HTMLButtonElement>("#load-button");
const sampleGrid = document.querySelector<HTMLDivElement>("#sample-grid");
const langButton = document.querySelector<HTMLButtonElement>("#lang-button");
const strap = document.querySelector<HTMLElement>("[data-copy='strap']");
const title = document.querySelector<HTMLElement>("[data-copy='title']");
const intro = document.querySelector<HTMLElement>("[data-copy='intro']");
const switchLabel = document.querySelector<HTMLElement>("[data-copy='switch-label']");

if (
  !preview ||
  !srcInput ||
  !sampleSelect ||
  !loadButton ||
  !sampleGrid ||
  !langButton ||
  !strap ||
  !title ||
  !intro ||
  !switchLabel
) {
  throw new Error("Demo UI failed to initialize.");
}

let locale: Locale = "en";

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
  loadSample(sampleSelect.selectedIndex >= 0 ? sampleSelect.selectedIndex : 0);
}

function loadSample(index: number): void {
  const sample = samples[index];
  if (!sample) {
    return;
  }

  srcInput.value = sample.url;
  preview.setAttribute("mime-type", sample.mimeType);
  preview.setAttribute("src", sample.url);
  sampleSelect.value = String(index);
}

sampleSelect.addEventListener("change", () => {
  loadSample(Number(sampleSelect.value));
});

loadButton.addEventListener("click", () => {
  if (srcInput.value) {
    preview.removeAttribute("mime-type");
    preview.setAttribute("src", srcInput.value);
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
