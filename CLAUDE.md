# html-dump

A GitHub Pages site (https://reservetempo.github.io/html-dump/) where each new idea gets its own standalone HTML page. The home page lists them all automatically.

## Isolation rule (most important)

Every idea is made from scratch. Unless the user explicitly names an earlier idea to build on:

- Do not open, read, grep, or otherwise look at the contents of other ideas under `ideas/`. Listing folder names to pick an unused slug is fine.
- Do not reuse their styles, scripts, layouts, palettes, or components, and do not create shared templates or stylesheets for ideas.
- Do not base an idea's design on the home page (`index.html`) either.
- When the user does name an earlier idea, read only that one.

Editing an existing idea (when asked) means working on that idea's folder only.

## Adding a new idea

1. Pick a short kebab-case slug that isn't already a folder in `ideas/`.
2. Create `ideas/<slug>/index.html` as a complete, self-contained HTML document. Put any extra files it needs (images, data, scripts) in the same folder and link them with relative paths.
3. The `<head>` must have these, because the home page list is built from them:
   ```html
   <title>Idea title</title>
   <meta name="description" content="One sentence about the idea.">
   ```
   Optional: `<meta name="date" content="YYYY-MM-DD">` overrides the listed date (default: the date the file was first committed).
4. Don't edit `index.html` to add the idea. `scripts/build.mjs` builds the list on deploy.
5. Preview with the `site` config in `.claude/launch.json` (runs `node scripts/serve.mjs`: builds, then serves `_site/` at http://localhost:8080). Re-run it to pick up changes to the home page list.
6. Commit and push to `main` when the user asks. `.github/workflows/deploy.yml` deploys in about a minute; the idea is live at `https://reservetempo.github.io/html-dump/ideas/<slug>/`.

## Layout

- `index.html` – home page template. The build fills in `<!--IDEAS-->` and `<!--COUNT-->`.
- `404.html` – not-found page.
- `ideas/` – one folder per idea.
- `scripts/build.mjs` – builds the site into `_site/` (gitignored). No dependencies.
- `scripts/serve.mjs` – builds, then serves `_site/` locally on port 8080.
- `.github/workflows/deploy.yml` – builds and deploys to GitHub Pages on push to `main`.
