# html-dump

A place to try out new ideas, one HTML page at a time.

**Live:** https://reservetempo.github.io/html-dump/

## How it works

Every idea is a standalone HTML page in its own folder:

```
ideas/
  some-idea/
    index.html      <- the idea (plus any images/scripts it needs)
  another-idea/
    index.html
```

On every push to `main`, a GitHub Action runs `scripts/build.mjs`, which builds the home page list from each idea's `<title>` and `<meta name="description">`, then deploys the site. The home page never needs editing by hand.

## Adding an idea

1. Create `ideas/<slug>/index.html`.
2. Give it a `<title>` and a `<meta name="description" content="...">`.
3. Push to `main`. It shows up at `https://reservetempo.github.io/html-dump/ideas/<slug>/` about a minute later.

Ideas are listed newest first, dated by when the file was first committed. To set the date yourself, add `<meta name="date" content="YYYY-MM-DD">`.

## Preview locally

```bash
node scripts/serve.mjs
```

This builds the site into `_site/` and serves it at http://localhost:8080. No installs needed, just Node.
