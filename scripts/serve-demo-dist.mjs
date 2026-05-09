import { createReadStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(process.argv[2] ?? process.cwd());
const distDir = path.join(rootDir, "apps", "demo", "dist");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".pdf", "application/pdf"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"]
]);

function resolveRequestPath(urlPath) {
  const normalized = decodeURIComponent(urlPath.split("?")[0] ?? "/");
  const candidate = normalized === "/" ? "index.html" : normalized.replace(/^\/+/, "");
  const fullPath = path.resolve(distDir, candidate);
  if (fullPath.startsWith(distDir)) {
    return fullPath;
  }

  return path.join(distDir, "index.html");
}

async function serveFile(filePath, response) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      throw new Error("not a file");
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "content-type": mimeTypes.get(ext) ?? "application/octet-stream",
      "cache-control": "no-store"
    });
    createReadStream(filePath).pipe(response);
  } catch {
    const indexPath = path.join(distDir, "index.html");
    response.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    });
    createReadStream(indexPath).pipe(response);
  }
}

await mkdir(distDir, { recursive: true });

const server = http.createServer(async (request, response) => {
  if (!request.url) {
    response.writeHead(400);
    response.end("Missing URL");
    return;
  }

  await serveFile(resolveRequestPath(request.url), response);
});

server.listen(port, host, () => {
  console.log(`Serving ${distDir} at http://${host}:${port}`);
});

process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
