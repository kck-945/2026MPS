# Anivance AI × NYCU Waitlist

Static landing page for the MPS World Summit 2026 project announcement, with a small Cloudflare Pages Function for collecting early-access and collaboration leads.

## Files

- `index.html`, `styles.css`, `script.js`: the pure frontend page.
- `functions/api/leads.js`: optional Cloudflare Pages Function endpoint used by the form.
- `schema.sql`: Cloudflare D1 table schema for storing submissions.

## Cloudflare Pages

1. Push this folder to a GitHub repository.
2. In Cloudflare Pages, connect the repository.
3. Use no build command.
4. Set the output directory to `/`.
5. Create a D1 database, then run `schema.sql`.
6. Bind the D1 database to the Pages project with the variable name `DB`.

The form posts to `/api/leads`. If you want to use another service instead, set `window.ANIVANCE_FORM_ENDPOINT` before `script.js` is loaded.

## Important

Do not write submissions directly to GitHub from browser JavaScript. That would require exposing a GitHub token publicly. Keep the database write behind Cloudflare Pages Functions, Workers, or another server-side endpoint.
