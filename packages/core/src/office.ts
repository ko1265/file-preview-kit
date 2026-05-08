import type { FilePreviewRenderContext, FilePreviewPlugin } from "@file-preview-kit/shared";
import { hasExtension } from "./file-source";
import { fetchBinaryContent } from "./content";
import { createContainer, createMessageCard, createParagraph, createSectionTitle } from "./render-utils";

async function renderDocx(context: FilePreviewRenderContext): Promise<HTMLElement> {
  const mammothModule = await import("mammoth");
  const buffer = await fetchBinaryContent(context);
  const wrapper = createContainer("fpk-office-preview");
  const title = createSectionTitle("Document preview");
  const result = await mammothModule.default.convertToHtml({ arrayBuffer: buffer });
  const article = document.createElement("article");
  article.className = "fpk-docx-preview";
  article.innerHTML = result.value;
  wrapper.append(title, article);
  return wrapper;
}

async function renderXlsx(context: FilePreviewRenderContext): Promise<HTMLElement> {
  const xlsxModule = await import("xlsx");
  const buffer = await fetchBinaryContent(context);
  const wrapper = createContainer("fpk-office-preview");
  const workbook = xlsxModule.read(buffer, { type: "array" });
  const title = createSectionTitle("Workbook preview");
  const tabs = createContainer("fpk-sheet-tabs");
  const content = createContainer("fpk-sheet-content");

  workbook.SheetNames.slice(0, 4).forEach((sheetName, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "fpk-sheet-tab";
    button.textContent = sheetName;
    if (index === 0) {
      button.dataset.active = "true";
    }

    button.addEventListener("click", () => {
      tabs.querySelectorAll(".fpk-sheet-tab").forEach((node) => {
        delete (node as HTMLElement).dataset.active;
      });
      button.dataset.active = "true";
      const sheet = workbook.Sheets[sheetName];
      content.innerHTML = sheet ? xlsxModule.utils.sheet_to_html(sheet) : "<p>Sheet unavailable.</p>";
    });
    tabs.append(button);
  });

  const firstSheetName = workbook.SheetNames[0];
  const firstSheet = firstSheetName ? workbook.Sheets[firstSheetName] : undefined;
  content.innerHTML = firstSheet ? xlsxModule.utils.sheet_to_html(firstSheet) : "<p>No worksheets found.</p>";
  wrapper.append(title, tabs, content);
  return wrapper;
}

function getSlidePaths(zip: { files: Record<string, unknown> }): string[] {
  return Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));
}

async function renderPptx(context: FilePreviewRenderContext): Promise<HTMLElement> {
  const jszipModule = await import("jszip");
  const buffer = await fetchBinaryContent(context);
  const zip = await jszipModule.default.loadAsync(buffer);
  const wrapper = createContainer("fpk-office-preview");
  const title = createSectionTitle("Presentation preview");
  wrapper.append(title);

  const parser = new DOMParser();
  const slidePaths = getSlidePaths(zip).slice(0, 12);

  if (slidePaths.length === 0) {
    wrapper.append(createParagraph("No slides found in this presentation."));
    return wrapper;
  }

  for (const [index, path] of slidePaths.entries()) {
    const xml = await zip.file(path)?.async("text");
    if (!xml) {
      continue;
    }

    const slide = createContainer("fpk-slide");
    const slideTitle = createSectionTitle(`Slide ${index + 1}`);
    const doc = parser.parseFromString(xml, "application/xml");
    const texts = [...doc.getElementsByTagName("a:t")].map((node) => node.textContent?.trim()).filter(Boolean);

    slide.append(slideTitle);

    if (texts.length === 0) {
      slide.append(createParagraph("No extractable slide text found."));
    } else {
      const list = document.createElement("ul");
      list.className = "fpk-slide-list";
      for (const text of texts) {
        const item = document.createElement("li");
        item.textContent = text;
        list.append(item);
      }
      slide.append(list);
    }

    wrapper.append(slide);
  }

  return wrapper;
}

export const officePlugin: FilePreviewPlugin = {
  descriptor: {
    id: "office",
    kind: "docx",
    label: "Open XML office",
    priority: 40,
    extensions: ["docx", "xlsx", "pptx"]
  },
  canPreview(context) {
    return hasExtension(context.source, ["docx", "xlsx", "pptx"]);
  },
  async render(context) {
    if (hasExtension(context.source, ["docx"])) {
      return renderDocx(context);
    }

    if (hasExtension(context.source, ["xlsx"])) {
      return renderXlsx(context);
    }

    if (hasExtension(context.source, ["pptx"])) {
      return renderPptx(context);
    }

    return createMessageCard(
      "Preview unavailable",
      `${context.source.normalizedName} is an unsupported Office format.`
    );
  }
};
