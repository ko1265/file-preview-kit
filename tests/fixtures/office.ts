import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import JSZip from "jszip";
import * as XLSX from "xlsx";

export function createWorkbookFixture(options?: { sheetCount?: number }): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const primarySheet = XLSX.utils.aoa_to_sheet([
    ["Region", "Q1", "Q2", "Formula"],
    ["North", 12, 18, 30],
    ["South", 9, 14, 23]
  ]);

  primarySheet.D2 = { t: "n", f: "B2+C2", v: 30 };
  primarySheet.D3 = { t: "n", f: "B3+C3", v: 23 };

  primarySheet["!merges"] = [
    XLSX.utils.decode_range("A1:B1")
  ];

  XLSX.utils.book_append_sheet(workbook, primarySheet, "Summary");

  const extraSheets = options?.sheetCount ?? 0;
  for (let index = 0; index < extraSheets; index += 1) {
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([[`extra-${index + 1}`]]),
      `Extra ${index + 1}`
    );
  }

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export function createLargeWorkbookFixture(): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const rows = Array.from({ length: 105 }, (_, index) => ({
    safe: index === 0 ? "<script>alert('x')</script>" : `row-${index + 1}`,
    value: `value-${index + 1}`
  }));

  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Primary");

  for (let index = 1; index <= 6; index += 1) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([[`sheet-${index}`]]), `Tab ${index}`);
  }

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export function createDocxConversionFixture(options?: { includeImages?: boolean }) {
  return {
    value: [
      "<h1>Title</h1>",
      "<ul><li>Readable bullet</li></ul>",
      '<table><tr><th>Label</th><th>Value</th></tr><tr><td>Alpha</td><td>42</td></tr></table>',
      options?.includeImages ? '<p><img src="data:image/png;base64,abc" alt="Preview image" /></p>' : "",
      "<script>alert('x')</script>",
      "<p>Body copy</p>"
    ].join(""),
    messages: [
      { type: "warning", message: "Comments were omitted." },
      { type: "warning", message: "Tracked changes were flattened." }
    ]
  };
}

export function createWideWorkbookFixture(columnCount = 27): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const headers = Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);
  const values = Array.from({ length: columnCount }, (_, index) => `value-${index + 1}`);
  const sheet = XLSX.utils.aoa_to_sheet([headers, values]);

  XLSX.utils.book_append_sheet(workbook, sheet, "Wide Sheet");
  return XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export async function createDocxFixture(options?: { unsafeLink?: boolean }): Promise<ArrayBuffer> {
  const zip = new JSZip();
  const hyperlinkTarget = options?.unsafeLink ? "javascript:alert(1)" : "https://example.com";

  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );
  zip.folder("_rels")?.file(
    ".rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );
  zip.folder("word")?.file(
    "document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>
    <w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Title</w:t></w:r></w:p>
    <w:p><w:r><w:t>Body copy</w:t></w:r></w:p>
    <w:tbl>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Label</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>Value</w:t></w:r></w:p></w:tc>
      </w:tr>
      <w:tr>
        <w:tc><w:p><w:r><w:t>Alpha</w:t></w:r></w:p></w:tc>
        <w:tc><w:p><w:r><w:t>42</w:t></w:r></w:p></w:tc>
      </w:tr>
    </w:tbl>
    <w:p><w:r><w:t xml:space="preserve">Visit </w:t></w:r><w:hyperlink r:id="rId2"><w:r><w:t>Example</w:t></w:r></w:hyperlink></w:p>
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/></w:sectPr>
  </w:body>
</w:document>`
  );
  zip.folder("word")?.file(
    "styles.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/></w:style>
</w:styles>`
  );
  zip.folder("word")?.folder("_rels")?.file(
    "document.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${hyperlinkTarget}" TargetMode="External"/>
</Relationships>`
  );

  return zip.generateAsync({ type: "arraybuffer" });
}

async function resolveMammothTestDataDir(): Promise<string> {
  const pnpmRoot = join(process.cwd(), "node_modules", ".pnpm");
  const directoryEntries = await readdir(pnpmRoot, { withFileTypes: true });
  const mammothEntry = directoryEntries.find((entry) => entry.isDirectory() && entry.name.startsWith("mammoth@"));
  if (!mammothEntry) {
    throw new Error("Unable to locate installed mammoth fixture data.");
  }

  return join(pnpmRoot, mammothEntry.name, "node_modules", "mammoth", "test", "test-data");
}

export async function createRealDocxFixture(fileName = "simple-list.docx"): Promise<ArrayBuffer> {
  const testDataDir = await resolveMammothTestDataDir();
  const buffer = await readFile(join(testDataDir, fileName));
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
