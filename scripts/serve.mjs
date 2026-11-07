// Builds the site, then serves _site/ at http://localhost:8080
// Run: node scripts/serve.mjs   (re-run after changes to rebuild)

import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = join(ROOT, "_site");
const PORT = Number(process.env.PORT) || 8080;

execFileSync(process.execPath, [join(ROOT, "scripts", "build.mjs")], { stdio: "inherit" });

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif",
  ".webp": "image/webp", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8",
  ".mp3": "audio/mpeg", ".wav": "audio/wav", ".mp4": "video/mp4", ".woff2": "font/woff2",
};

createServer((req, res) => {
  // Accept /html-dump/... too, matching the live site's paths
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/^\/html-dump(?=\/|$)/, "");
  let file = normalize(join(SITE, path));
  if (!file.startsWith(SITE)) return res.writeHead(403).end();
  if (existsSync(file) && statSync(file).isDirectory()) {
    if (!path.endsWith("/")) return res.writeHead(301, { Location: req.url + "/" }).end();
    file = join(file, "index.html");
  }
  if (!existsSync(file)) {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    return createReadStream(join(SITE, "404.html")).pipe(res);
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Serving at http://localhost:${PORT}`));
