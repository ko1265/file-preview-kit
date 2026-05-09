import { mkdir, readFile, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import * as XLSX from "xlsx";

const rootDir = path.resolve(process.argv[2] ?? process.cwd());
const publicDir = path.join(rootDir, "apps", "demo", "public");

async function resolveMammothTestDataDir() {
  const pnpmRoot = path.join(rootDir, "node_modules", ".pnpm");
  const directoryEntries = await readdir(pnpmRoot, { withFileTypes: true });
  const mammothEntry = directoryEntries.find((entry) => entry.isDirectory() && entry.name.startsWith("mammoth@"));
  if (!mammothEntry) {
    throw new Error("Unable to locate installed mammoth fixture data.");
  }

  return path.join(pnpmRoot, mammothEntry.name, "node_modules", "mammoth", "test", "test-data");
}

async function writeDocx(filePath) {
  const testDataDir = await resolveMammothTestDataDir();
  const buffer = await readFile(path.join(testDataDir, "simple-list.docx"));
  await writeFile(filePath, buffer);
}

async function writeXlsx(filePath) {
  const workbook = XLSX.utils.book_new();
  const summary = XLSX.utils.aoa_to_sheet([
    ["Section", "Status"],
    ["Public screenshot", "Stable"],
    ["Office preview", "Local sample"],
    ["Media preview", "Remote sample"]
  ]);
  summary["!merges"] = [XLSX.utils.decode_range("A1:B1")];

  const metrics = XLSX.utils.aoa_to_sheet([
    ["Metric", "Value"],
    ["Rows", 24],
    ["Columns", 8],
    ["Notes", "Use local assets for screenshot capture"]
  ]);

  XLSX.utils.book_append_sheet(workbook, summary, "Summary");
  XLSX.utils.book_append_sheet(workbook, metrics, "Metrics");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  await writeFile(filePath, buffer);
}

async function writePptx(filePath) {
  const zip = new JSZip();

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`
  );

  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  zip.folder("ppt")?.file(
    "presentation.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
</p:presentation>`
  );

  zip.folder("ppt")?.folder("_rels")?.file(
    "presentation.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`
  );

  zip.folder("ppt")?.folder("slides")?.file(
    "slide1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:sp>
        <p:txBody>
          <a:p><a:r><a:t>Local Office sample</a:t></a:r></a:p>
          <a:p><a:r><a:t>Stable screenshot capture for the public demo</a:t></a:r></a:p>
          <a:p><a:r><a:t>Readable slide text only</a:t></a:r></a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`
  );

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  await writeFile(filePath, buffer);
}

async function main() {
  await mkdir(publicDir, { recursive: true });
  await Promise.all([
    writeDocx(path.join(publicDir, "office-screenshot.docx")),
    writeXlsx(path.join(publicDir, "office-screenshot.xlsx")),
    writePptx(path.join(publicDir, "office-screenshot.pptx"))
  ]);
}

await main();
