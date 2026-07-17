# Personal website — Rabbi, Lutfor Rahman

A lightweight, accessible academic website built with plain HTML, CSS, and JavaScript. It has no framework or external font dependency, so it can be hosted almost anywhere.

## Preview locally

From this folder, run:

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Updating the site

- Website content is maintained once in `content/site-content.json`, preferably through the Pages CMS editor at `/admin/`.
- The detailed profile, compact network, Explore navigator, publications, ongoing work, projects, teaching, experience, education, and both research matrices read from that shared catalogue.
- Optional `compact_title`, `compact_body`, and `compact_meta` fields provide shorter copy for the network view; detailed text is the automatic fallback.
- Colours and layout: edit the variables at the top of `styles.css`.
- Portrait and event photos: replace files in `public/assets/images/` while keeping the filenames, or update the matching paths in `index.html`.
- CV: replace `public/assets/docs/Rabbi-CV-2026.pdf` and update the filename in `index.html` if needed.

## Hosting

The website is published through GitHub Pages at `https://asmrabbi.github.io`.

Pushes to the `main` branch automatically rebuild the current Now sharing card and publish the updated site.
