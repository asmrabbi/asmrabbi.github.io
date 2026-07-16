# Personal website — Rabbi, Lutfor Rahman

A lightweight, accessible academic website built with plain HTML, CSS, and JavaScript. It has no framework or external font dependency, so it can be hosted almost anywhere.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Updating the site

- Main text and publications: edit `index.html`.
- Recent activity: find the `updates` section in `index.html`, then duplicate an existing update article.
- Research-map topics, outputs, and connections: edit the `topics`, `works`, and `connections` data near the top of `script.js`.
- Courses: edit the course cards in the `teaching` section of `index.html`. Every card includes its university link and topic keywords.
- Colours and layout: edit the variables at the top of `styles.css`.
- Portrait and event photos: replace files in `public/assets/images/` while keeping the filenames, or update the matching paths in `index.html`.
- CV: replace `public/assets/docs/Rabbi-CV-2026.pdf` and update the filename in `index.html` if needed.

## Hosting

The website is published through GitHub Pages at `https://asmrabbi.github.io`.

Pushes to the `main` branch automatically rebuild the current Now sharing card and publish the updated site.
