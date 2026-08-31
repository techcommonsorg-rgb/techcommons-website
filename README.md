# TechCommons website

The production website for TechCommons, a youth-led community technology education initiative.

## Development

The site is dependency-free static HTML, CSS and JavaScript. Run `python3 -m http.server 8000` from the repository root for a local preview.

## Validation and build

Run `npm run build`. The command validates public pages, metadata, local links, image alternative text and prohibited legacy content, then creates the static deployment in `dist/static` and a Sites-compatible worker in `dist/server`.

GitHub Pages can publish directly from the repository root. Directory-based routes include their own `index.html`, so direct navigation and refresh work without a client-side router.
