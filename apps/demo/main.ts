import { registerFilePreviewElement } from "@file-preview-kit/web-components";

registerFilePreviewElement();

const samples = [
  {
    label: "Markdown",
    description: "README from a public repo",
    url: "https://raw.githubusercontent.com/microsoft/TypeScript/main/README.md",
    mimeType: "text/markdown"
  },
  {
    label: "JSON",
    description: "A remote package manifest",
    url: "https://raw.githubusercontent.com/vitejs/vite/main/packages/vite/package.json",
    mimeType: "application/json"
  },
  {
    label: "Image",
    description: "High quality sample image",
    url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80",
    mimeType: "image/jpeg"
  },
  {
    label: "Video",
    description: "Short sample video",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    mimeType: "video/mp4"
  },
  {
    label: "Audio",
    description: "Short sample audio",
    url: "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
    mimeType: "audio/mpeg"
  },
  {
    label: "PDF",
    description: "Local sample PDF",
    url: "/sample.pdf",
    mimeType: "application/pdf"
  },
  {
    label: "Office",
    description: "docx fallback example",
    url: "https://file-examples.com/storage/fe1b1f4dbedf280facafd0f/2017/02/file-sample_100kB.docx",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  }
];

const preview = document.querySelector<HTMLDivElement>("#preview");
const srcInput = document.querySelector<HTMLInputElement>("#src-input");
const sampleSelect = document.querySelector<HTMLSelectElement>("#sample-select");
const loadButton = document.querySelector<HTMLButtonElement>("#load-button");
const sampleGrid = document.querySelector<HTMLDivElement>("#sample-grid");

if (!preview || !srcInput || !sampleSelect || !loadButton || !sampleGrid) {
  throw new Error("Demo UI failed to initialize.");
}

sampleSelect.innerHTML = samples
  .map(
    (sample, index) =>
      `<option value="${index}">${sample.label} - ${sample.description}</option>`
  )
  .join("");

sampleGrid.innerHTML = samples
  .map(
    (sample, index) => `
      <button class="sample" type="button" data-sample-index="${index}">
        <strong>${sample.label}</strong>
        <span>${sample.description}</span>
      </button>
    `
  )
  .join("");

function loadSample(index: number): void {
  const sample = samples[index];
  if (!sample) {
    return;
  }

  srcInput.value = sample.url;
  if (sample.mimeType) {
    preview.setAttribute("mime-type", sample.mimeType);
  } else {
    preview.removeAttribute("mime-type");
  }
  preview.setAttribute("src", sample.url);
}

sampleSelect.addEventListener("change", () => {
  loadSample(Number(sampleSelect.value));
});

loadButton.addEventListener("click", () => {
  if (srcInput.value) {
    preview.setAttribute("src", srcInput.value);
    preview.removeAttribute("mime-type");
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

loadSample(0);
