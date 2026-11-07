// Builds the site into _site/.
// Copies everything that gets published and fills the home page list
// with one entry per idea, read from each idea's <title> and description.
//
// Run locally: node scripts/build.mjs   (then open _site/index.html)

import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "_site");
const IDEAS = join(ROOT, "ideas");

// Each idea is either ideas/<slug>/index.html or ideas/<slug>.html
function findIdeas() {
  if (!existsSync(IDEAS)) return [];
  const found = [];
  for (const name of readdirSync(IDEAS)) {
    const full = join(IDEAS, name);
    if (statSync(full).isDirectory()) {
      const file = join(full, "index.html");
      if (existsSync(file)) found.push({ file, rel: `ideas/${name}/index.html`, href: `ideas/${name}/`, slug: name });
    } else if (name.endsWith(".html")) {
      found.push({ file: full, rel: `ideas/${name}`, href: `ideas/${name}`, slug: name.slice(0, -5) });
    }
  }
  return found;
}

function decode(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");
}

function escape(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function meta(html, name) {
  for (const tag of html.match(/<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi) ?? []) {
    const n = tag.match(/\bname\s*=\s*["']([^"']*)["']/i);
    if (n && n[1].toLowerCase() === name) {
      const c = tag.match(/\bcontent\s*=\s*"([^"]*)"|\bcontent\s*=\s*'([^']*)'/i);
      if (c) return decode(c[1] ?? c[2]).trim();
    }
  }
  return "";
}

// When the file was first committed; falls back to its modified time for
// ideas that haven't been committed yet (local previews).
function addedDate(idea) {
  try {
    const out = execFileSync("git", ["log", "--follow", "--diff-filter=A", "--format=%cI", "--", idea.rel], {
      cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    }).trim().split("\n").filter(Boolean);
    if (out.length) return new Date(out[out.length - 1]);
  } catch {}
  return statSync(idea.file).mtime;
}

function readIdea(idea) {
  const html = readFileSync(idea.file, "utf8");
  const title = decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/<[^>]+>/g, "")).trim();
  const override = meta(html, "date");
  const date = /^\d{4}-\d{2}-\d{2}/.test(override) ? new Date(override) : addedDate(idea);
  return { ...idea, title: title || idea.slug, description: meta(html, "description"), date };
}

const ideas = findIdeas().map(readIdea).sort((a, b) => a.date - b.date);
ideas.forEach((idea, i) => (idea.n = i + 1));
ideas.reverse(); // newest first

const items = ideas.map((idea) => {
  const day = idea.date.toISOString().slice(0, 10);
  const desc = idea.description ? `\n          <span class="desc">${escape(idea.description)}</span>` : "";
  return `      <li>
        <a href="${escape(idea.href)}">
          <span class="num">${String(idea.n).padStart(3, "0")}</span>
          <time datetime="${day}">${day}</time>
          <span class="title">${escape(idea.title)}</span>${desc}
        </a>
      </li>`;
}).join("\n");

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const template = readFileSync(join(ROOT, "index.html"), "utf8");
writeFileSync(
  join(OUT, "index.html"),
  template
    .replace("<!--IDEAS-->", items)
    .replace(/<!--COUNT-->/g, `${ideas.length} idea${ideas.length === 1 ? "" : "s"}`),
);
cpSync(join(ROOT, "404.html"), join(OUT, "404.html"));
if (existsSync(IDEAS)) cpSync(IDEAS, join(OUT, "ideas"), { recursive: true });

console.log(`Built ${ideas.length} idea${ideas.length === 1 ? "" : "s"} into _site/`);
