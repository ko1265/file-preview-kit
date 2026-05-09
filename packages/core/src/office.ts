import type {
  FilePreviewRenderContext,
  FilePreviewPlugin,
  FilePreviewWorkbookPreviewOptions
} from "@file-preview-kit/shared";
import { hasExtension } from "./file-source";
import { fetchBinaryContent } from "./content";
import { createContainer, createMessageCard, createParagraph, createSectionTitle } from "./render-utils";

const MAX_WORKBOOK_SHEETS = 6;
const MAX_WORKBOOK_ROWS = 100;
const MAX_WORKBOOK_COLS = 12;

type MammothMessage = {
  message: string;
  type: string;
};

type SheetCellPreview = {
  formula?: string;
  isCovered?: boolean;
  rowSpan?: number;
  colSpan?: number;
  value: string;
};

type SheetPreviewData = {
  name: string;
  rows: SheetCellPreview[][];
  rowCount: number;
  columnCount: number;
  visibleRowStart: number;
  visibleColumnStart: number;
  visibleRowEnd: number;
  visibleColumnEnd: number;
  formulaCount: number;
  mergeCount: number;
  trimmedRows: boolean;
  trimmedColumns: boolean;
};

type MammothConverter = {
  convertToHtml(input: { buffer?: ArrayBuffer | Buffer; arrayBuffer?: ArrayBuffer }): Promise<{
    value: string;
    messages: MammothMessage[];
  }>;
};

type XlsxModule = typeof import("xlsx");

let mammothLoaderForTesting: (() => Promise<MammothConverter>) | undefined;
let xlsxLoaderForTesting: (() => Promise<XlsxModule>) | undefined;

function createOfficeNote(title: string, body: string): HTMLElement {
  const note = createContainer("fpk-office-note");
  const heading = document.createElement("strong");
  heading.textContent = title;
  note.append(heading, createParagraph(body));
  return note;
}

function createOfficeMeta(text: string): HTMLElement {
  const meta = document.createElement("p");
  meta.className = "fpk-office-meta";
  meta.textContent = text;
  return meta;
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  return value !== undefined && Number.isInteger(value) && value > 0 ? value : fallback;
}

function formatCellLabel(rowIndex: number, columnIndex: number): string {
  return `${indexToColumnLabel(columnIndex)}${rowIndex + 1}`;
}

function formatCellRange(startRow: number, startColumn: number, endRow: number, endColumn: number): string {
  return `${formatCellLabel(startRow, startColumn)}:${formatCellLabel(endRow, endColumn)}`;
}

function resolveWorkbookOptions(context: FilePreviewRenderContext): Required<FilePreviewWorkbookPreviewOptions> {
  const workbookOptions = context.request?.office?.workbook;
  return {
    maxSheets: normalizePositiveInteger(workbookOptions?.maxSheets, MAX_WORKBOOK_SHEETS),
    maxRows: normalizePositiveInteger(workbookOptions?.maxRows, MAX_WORKBOOK_ROWS),
    maxColumns: normalizePositiveInteger(workbookOptions?.maxColumns, MAX_WORKBOOK_COLS)
  };
}

function isSafeOfficeUrl(value: string, allowDataImage = false): boolean {
  const trimmed = value.trim();
  if (trimmed.startsWith("#") || trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
    return true;
  }

  try {
    const url = new URL(trimmed, window.location.href);
    if (allowDataImage && url.protocol === "data:") {
      return /^data:image\//i.test(trimmed);
    }

    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeOfficeHtml(root: ParentNode): void {
  root.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href || !isSafeOfficeUrl(href)) {
      anchor.removeAttribute("href");
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
      return;
    }

    anchor.setAttribute("rel", "noopener noreferrer");
  });

  root.querySelectorAll("img[src]").forEach((image) => {
    const src = image.getAttribute("src");
    if (!src || !isSafeOfficeUrl(src, true)) {
      image.removeAttribute("src");
    }
  });
}

function collectDocxContentSummary(root: ParentNode): string | null {
  const counts = [
    ["table", root.querySelectorAll("table").length],
    ["heading", root.querySelectorAll("h1, h2, h3, h4, h5, h6").length],
    ["list", root.querySelectorAll("ul, ol").length],
    ["image", root.querySelectorAll("img").length],
    ["link", root.querySelectorAll("a[href]").length],
    ["note ref", root.querySelectorAll('a[href^="#footnote-"], a[href^="#endnote-"]').length]
  ] as Array<[string, number]>;
  const visibleCounts = counts.filter(([, count]) => count > 0);

  if (visibleCounts.length === 0) {
    return null;
  }

  return `Detected ${visibleCounts.map(([label, count]) => `${count} ${label}${count === 1 ? "" : "s"}`).join(", ")}.`;
}

async function sanitizeOfficeHtml(html: string): Promise<string> {
  const domPurifyModule = await import("dompurify");
  const createDOMPurify = domPurifyModule.default;
  const purify = createDOMPurify(window);
  const template = document.createElement("template");
  template.innerHTML = purify.sanitize(html);
  normalizeOfficeHtml(template.content);
  return template.innerHTML.trim();
}

function resolveMammothModule(module: unknown): MammothConverter {
  const resolved = module as { default?: MammothConverter };
  return (resolved.default ?? module) as MammothConverter;
}

async function convertDocxToHtml(
  mammothModule: MammothConverter,
  buffer: ArrayBuffer
): Promise<Awaited<ReturnType<MammothConverter["convertToHtml"]>>> {
  try {
    return await mammothModule.convertToHtml({ arrayBuffer: buffer });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "Could not find file in options") {
      throw error;
    }

    if (typeof Buffer === "undefined") {
      throw error;
    }

    const fallbackInput = { buffer: Buffer.from(buffer) };
    return mammothModule.convertToHtml(fallbackInput);
  }
}

async function loadMammothModule(): Promise<MammothConverter> {
  if (mammothLoaderForTesting) {
    return mammothLoaderForTesting();
  }

  try {
    return resolveMammothModule(await import("mammoth/mammoth.browser.js"));
  } catch {
    return resolveMammothModule(await import("mammoth"));
  }
}

async function renderDocx(context: FilePreviewRenderContext): Promise<HTMLElement> {
  const [mammothModule, buffer] = await Promise.all([loadMammothModule(), fetchBinaryContent(context)]);
  const wrapper = createContainer("fpk-office-preview");
  const title = createSectionTitle("Document preview");
  const result = await convertDocxToHtml(mammothModule, buffer);
  const article = document.createElement("article");
  article.className = "fpk-docx-preview";

  const sanitizedHtml = await sanitizeOfficeHtml(result.value);
  const template = document.createElement("template");
  template.innerHTML = sanitizedHtml.trim();
  const contentSummary = collectDocxContentSummary(template.content);
  article.innerHTML = template.innerHTML || "<p>No extractable document content found.</p>";
  wrapper.append(title);

  if (contentSummary) {
    wrapper.append(createOfficeMeta(contentSummary));
  }

  const warningMessages = result.messages.filter((message) => message.type === "warning");
  if (warningMessages.length > 0) {
    wrapper.append(
      createOfficeNote(
        warningMessages.length > 1 ? "Conversion notes" : "Conversion note",
        warningMessages.map((message) => message.message).join(" ")
      )
    );
  }

  wrapper.append(article);
  return wrapper;
}

export function setMammothLoaderForTesting(loader: (() => Promise<MammothConverter>) | undefined): void {
  mammothLoaderForTesting = loader;
}

async function loadXlsxModule(): Promise<XlsxModule> {
  if (xlsxLoaderForTesting) {
    return xlsxLoaderForTesting();
  }

  return import("xlsx");
}

export function setXlsxLoaderForTesting(loader: (() => Promise<XlsxModule>) | undefined): void {
  xlsxLoaderForTesting = loader;
}

function getSheetCell(
  xlsxModule: XlsxModule,
  sheet: import("xlsx").WorkSheet,
  rowIndex: number,
  colIndex: number
): SheetCellPreview {
  const address = xlsxModule.utils.encode_cell({ r: rowIndex, c: colIndex });
  const cell = sheet[address];
  if (!cell) {
    return {
      value: ""
    };
  }

  return {
    value: xlsxModule.utils.format_cell(cell) ?? "",
    ...(typeof cell.f === "string" ? { formula: cell.f } : {})
  };
}

function trimVisibleMatrix(rows: SheetCellPreview[][]): SheetCellPreview[][] {
  let visibleRows = rows.slice();
  let visibleColumnCount = visibleRows[0]?.length ?? 0;

  while (
    visibleRows.length > 1 &&
    visibleRows[visibleRows.length - 1]?.every((cell) => !cell.value && !cell.formula)
  ) {
    visibleRows = visibleRows.slice(0, -1);
  }

  while (visibleColumnCount > 1) {
    const columnHasContent = visibleRows.some((row) => {
      const cell = row[visibleColumnCount - 1];
      return Boolean(cell?.value || cell?.formula);
    });
    if (columnHasContent) {
      break;
    }
    visibleColumnCount -= 1;
  }

  return visibleRows.map((row) => row.slice(0, visibleColumnCount));
}

function applyVisibleMerges(
  xlsxModule: XlsxModule,
  sheet: import("xlsx").WorkSheet,
  rows: SheetCellPreview[][],
  visibleRange: { startRow: number; startCol: number }
): number {
  const merges = sheet["!merges"] ?? [];
  let visibleMergeCount = 0;

  merges.forEach((merge) => {
    const startRow = merge.s.r - visibleRange.startRow;
    const endRow = merge.e.r - visibleRange.startRow;
    const startCol = merge.s.c - visibleRange.startCol;
    const endCol = merge.e.c - visibleRange.startCol;

    if (
      startRow < 0 ||
      startCol < 0 ||
      startRow >= rows.length ||
      startCol >= (rows[startRow]?.length ?? 0)
    ) {
      return;
    }

    const anchorCell = rows[startRow]?.[startCol];
    if (!anchorCell) {
      return;
    }

    anchorCell.rowSpan = Math.min(endRow, rows.length - 1) - startRow + 1;
    anchorCell.colSpan = Math.min(endCol, (rows[startRow]?.length ?? 1) - 1) - startCol + 1;
    visibleMergeCount += 1;

    for (let rowIndex = startRow; rowIndex <= Math.min(endRow, rows.length - 1); rowIndex += 1) {
      const row = rows[rowIndex];
      if (!row) {
        continue;
      }

      for (let colIndex = startCol; colIndex <= Math.min(endCol, row.length - 1); colIndex += 1) {
        if (rowIndex === startRow && colIndex === startCol) {
          continue;
        }
        const cell = row[colIndex];
        if (cell) {
          cell.isCovered = true;
        }
      }
    }
  });

  return visibleMergeCount;
}

function getSheetPreviewData(
  xlsxModule: XlsxModule,
  name: string,
  sheet: import("xlsx").WorkSheet,
  options: Required<FilePreviewWorkbookPreviewOptions>
): SheetPreviewData {
  const ref = sheet["!ref"];
  if (!ref) {
    return {
      name,
      rows: [],
      rowCount: 0,
      columnCount: 0,
      visibleRowStart: 0,
      visibleColumnStart: 0,
      visibleRowEnd: 0,
      visibleColumnEnd: 0,
      formulaCount: 0,
      mergeCount: 0,
      trimmedRows: false,
      trimmedColumns: false
    };
  }

  const range = xlsxModule.utils.decode_range(ref);
  const rowCount = range.e.r - range.s.r + 1;
  const columnCount = range.e.c - range.s.c + 1;
  const visibleRows = Math.min(rowCount, options.maxRows);
  const visibleCols = Math.min(columnCount, options.maxColumns);
  const matrix: SheetCellPreview[][] = [];
  let formulaCount = 0;

  for (let rowOffset = 0; rowOffset < visibleRows; rowOffset += 1) {
    const rowIndex = range.s.r + rowOffset;
    const cells: SheetCellPreview[] = [];

    for (let colOffset = 0; colOffset < visibleCols; colOffset += 1) {
      const colIndex = range.s.c + colOffset;
      const cell = getSheetCell(xlsxModule, sheet, rowIndex, colIndex);
      if (cell.formula) {
        formulaCount += 1;
      }
      cells.push(cell);
    }

    matrix.push(cells);
  }

  const rows = trimVisibleMatrix(matrix);
  const mergeCount = applyVisibleMerges(xlsxModule, sheet, rows, {
    startRow: range.s.r,
    startCol: range.s.c
  });
  const visibleColumnCount = rows[0]?.length ?? 0;
  const visibleRowEnd = rows.length > 0 ? range.s.r + rows.length - 1 : range.s.r;
  const visibleColumnEnd = visibleColumnCount > 0 ? range.s.c + visibleColumnCount - 1 : range.s.c;

  return {
    name,
    rows,
    rowCount,
    columnCount,
    visibleRowStart: range.s.r,
    visibleColumnStart: range.s.c,
    visibleRowEnd,
    visibleColumnEnd,
    formulaCount,
    mergeCount,
    trimmedRows: rowCount > rows.length,
    trimmedColumns: columnCount > (rows[0]?.length ?? 0)
  };
}

function renderSheetTable(preview: SheetPreviewData): HTMLElement {
  if (preview.rows.length === 0) {
    return createOfficeNote("Empty sheet", "This worksheet does not expose any populated cell range.");
  }

  const scrollRegion = createContainer("fpk-sheet-scroll");
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");
  const headerRow = document.createElement("tr");
  const corner = document.createElement("th");
  corner.scope = "col";
  corner.textContent = "#";
  headerRow.append(corner);

  const visibleColumnCount = preview.rows[0]?.length ?? 0;
  for (let colIndex = 0; colIndex < visibleColumnCount; colIndex += 1) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = indexToColumnLabel(preview.visibleColumnStart + colIndex);
    headerRow.append(th);
  }

  thead.append(headerRow);

  preview.rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    const rowHeader = document.createElement("th");
    rowHeader.scope = "row";
    rowHeader.textContent = String(preview.visibleRowStart + index + 1);
    tr.append(rowHeader);

    row.forEach((cell) => {
      if (cell.isCovered) {
        return;
      }

      const td = document.createElement("td");
      td.textContent = cell.value || " ";
      if (cell.rowSpan && cell.rowSpan > 1) {
        td.rowSpan = cell.rowSpan;
      }
      if (cell.colSpan && cell.colSpan > 1) {
        td.colSpan = cell.colSpan;
      }
      if (cell.formula) {
        td.dataset.formula = cell.formula;
        td.title = `Formula: ${cell.formula}`;
      } else if (cell.value.length > 120) {
        td.title = cell.value;
      }
      tr.append(td);
    });

    tbody.append(tr);
  });

  table.append(thead, tbody);
  scrollRegion.append(table);
  return scrollRegion;
}

function indexToColumnLabel(index: number): string {
  let current = index;
  let label = "";

  do {
    label = String.fromCharCode(65 + (current % 26)) + label;
    current = Math.floor(current / 26) - 1;
  } while (current >= 0);

  return label;
}

function renderSheetPreview(
  preview: SheetPreviewData,
  options: Required<FilePreviewWorkbookPreviewOptions>
): HTMLElement {
  const fragment = document.createDocumentFragment();
  const detailParts = [`${preview.rowCount} row(s)`, `${preview.columnCount} column(s)`];
  if (preview.mergeCount > 0) {
    detailParts.push(`${preview.mergeCount} merge(s)`);
  }
  if (preview.formulaCount > 0) {
    detailParts.push(`${preview.formulaCount} formula cell(s)`);
  }

  fragment.append(
    createOfficeMeta(`${preview.name} · ${detailParts.join(" · ")}`),
    renderSheetTable(preview)
  );

  if (preview.trimmedRows || preview.trimmedColumns) {
    const parts: string[] = [];
    if (preview.trimmedRows) {
      parts.push(`showing the first ${options.maxRows} rows`);
    }
    if (preview.trimmedColumns) {
      parts.push(`the first ${options.maxColumns} columns`);
    }
    fragment.append(
      createOfficeNote("Large sheet truncated", `For stability, this preview is ${parts.join(" and ")} only.`)
    );
  }

  const wrapper = createContainer("fpk-sheet-panel");
  wrapper.append(fragment);
  return wrapper;
}

function renderWorkbookSheetPreview(
  preview: SheetPreviewData,
  options: Required<FilePreviewWorkbookPreviewOptions>,
  sheetIndex: number,
  sheetCount: number
): HTMLElement {
  const fragment = document.createDocumentFragment();
  const detailParts = [`${preview.rowCount} row(s)`, `${preview.columnCount} column(s)`];
  if (preview.mergeCount > 0) {
    detailParts.push(`${preview.mergeCount} merge(s)`);
  }
  if (preview.formulaCount > 0) {
    detailParts.push(`${preview.formulaCount} formula cell(s)`);
  }

  fragment.append(
    createOfficeMeta(`${preview.name} • ${detailParts.join(" • ")}`),
    createOfficeMeta(
      `Showing ${formatCellRange(
        preview.visibleRowStart,
        preview.visibleColumnStart,
        preview.visibleRowEnd,
        preview.visibleColumnEnd
      )}${sheetCount > 1 ? ` on sheet ${sheetIndex + 1} of ${sheetCount}` : ""}`
    ),
    renderSheetTable(preview)
  );

  if (preview.trimmedRows || preview.trimmedColumns) {
    const parts: string[] = [];
    if (preview.trimmedRows) {
      parts.push(`showing the first ${options.maxRows} rows`);
    }
    if (preview.trimmedColumns) {
      parts.push(`the first ${options.maxColumns} columns`);
    }
    fragment.append(
      createOfficeNote("Large sheet truncated", `For stability, this preview is ${parts.join(" and ")} only.`)
    );
  }

  const wrapper = createContainer("fpk-sheet-panel");
  wrapper.append(fragment);
  return wrapper;
}

async function renderXlsx(context: FilePreviewRenderContext): Promise<HTMLElement> {
  const wrapper = createContainer("fpk-office-preview");
  const options = resolveWorkbookOptions(context);
  try {
    const [xlsxModule, buffer] = await Promise.all([loadXlsxModule(), fetchBinaryContent(context)]);
    const workbook = xlsxModule.read(buffer, { type: "array" });
    const title = createSectionTitle("Workbook preview");
    const tabs = createContainer("fpk-sheet-tabs");
    const content = createContainer("fpk-sheet-content");
    const sheetNames = workbook.SheetNames.slice(0, options.maxSheets);
    const previews = new Map<string, SheetPreviewData>();
    wrapper.append(title);
    wrapper.append(
      createOfficeMeta(
        `${workbook.SheetNames.length} worksheet(s) • showing ${sheetNames.length} tab(s)${
          workbook.SheetNames.length > options.maxSheets ? ` • limited to the first ${options.maxSheets}` : ""
        }`
      )
    );

    const mountSheet = (sheetName: string, sheetIndex: number) => {
      const sheet = workbook.Sheets[sheetName];
      content.replaceChildren(
        sheet
          ? renderWorkbookSheetPreview(
              previews.get(sheetName) ?? getSheetPreviewData(xlsxModule, sheetName, sheet, options),
              options,
              sheetIndex,
              sheetNames.length
            )
          : createOfficeNote("Sheet unavailable", "This worksheet could not be parsed from the workbook.")
      );
    };

    sheetNames.forEach((sheetName, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fpk-sheet-tab";
      button.textContent = sheetName;
      button.title = sheetName;
      button.setAttribute("aria-label", `Show sheet ${sheetName}`);
      if (index === 0) {
        button.dataset.active = "true";
      }

      const sheet = workbook.Sheets[sheetName];
      if (sheet) {
        previews.set(sheetName, getSheetPreviewData(xlsxModule, sheetName, sheet, options));
      }

      button.addEventListener("click", () => {
        tabs.querySelectorAll(".fpk-sheet-tab").forEach((node) => {
          delete (node as HTMLElement).dataset.active;
        });
        button.dataset.active = "true";
        mountSheet(sheetName, index);
      });
      tabs.append(button);
    });

    if (workbook.SheetNames.length > options.maxSheets) {
      wrapper.append(
        createOfficeNote(
          "Workbook trimmed",
          `Showing the first ${options.maxSheets} sheet tabs to keep large workbooks responsive.`
        )
      );
    }

    const firstSheetName = sheetNames[0];
    wrapper.append(tabs, content);

    if (!firstSheetName) {
      content.append(createOfficeNote("No worksheets found", "The workbook does not contain any visible sheets."));
      return wrapper;
    }

    mountSheet(firstSheetName, 0);
    return wrapper;
  } catch {
    return createMessageCard(
      "Workbook preview unavailable",
      "This workbook could not be parsed safely. Try re-downloading the file or opening it locally."
    );
  }
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
