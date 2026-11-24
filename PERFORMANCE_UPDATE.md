# BlueLeaf Books — focused improvement pass

This update preserves the existing React + TypeScript + Vite application and reader. It does not introduce a new backend, account system, payment feature, AI agent, or additional dependency.

## What changed

1. **Faster catalogue requests**
   - Added a shared JSON request helper with a seven-second request timeout.
   - Added one retry for transient network errors, HTTP 429, and HTTP 5xx responses.
   - Added short-lived in-memory response caching for repeated searches, popular lists, categories, and book details.
   - Invalid JSON and unexpected top-level payloads now produce controlled errors instead of opaque parsing exceptions.

2. **Safer API normalisation**
   - Normalisers tolerate missing, null, or incorrectly shaped fields.
   - Catalogue arrays are checked before mapping so malformed records do not break the whole results page.
   - A provider failure no longer removes results returned by the other provider.

3. **Progressive results**
   - Gutendex and Open Library results are surfaced independently as each request completes.
   - The UI can show useful results while the other catalogue is still responding.
   - Search debounce was reduced from 350 ms to 275 ms.

4. **Lower homepage request load**
   - Removed three independent homepage catalogue shelves and replaced them with one popular-books request plus static category discovery.
   - This reduces duplicate requests and removes repeated book-card carousels.

5. **Simpler catalogue interface**
   - Added compact book rows with cover, title, author, availability, open and save controls.
   - Search and featured books use list-style results rather than card grids.
   - Category discovery and trust information use cleaner row layouts.
   - Added a working homepage search field.

6. **Faster and more bounded book-text loading**
   - IndexedDB remains the first lookup.
   - The same-origin Gutenberg proxy is tried first.
   - Timeouts remain active until the response body is fully read.
   - A limited fallback set is attempted in parallel instead of serially waiting through every gateway.
   - The existing IndexedDB save behaviour remains in place for repeat and offline reading.

7. **Cache and trust-page polish**
   - Service-worker cache version was updated; navigation is now network-first to avoid stale app shells after deploys.
   - Canonical, Open Graph, robots and sitemap URLs now use the supplied Netlify deployment hostname.
   - Unconfigured placeholder contact email addresses were removed from the public-facing footer and contact/privacy text.

## Verification

- TypeScript project check: passed (`tsc -b`).
- ESLint on `src`: passed.
- Production build: not completed in this workspace because the uploaded `node_modules` folder contains the Windows Rollup binary, while this environment is Linux. The expected Linux optional package (`@rollup/rollup-linux-x64-gnu`) is missing. A fresh `npm install` on the target machine should install the correct platform binary before running `npm run build`.

## Deployment

From the project root:

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

Then deploy the generated `dist` directory via the existing Netlify Git integration or Netlify deploy workflow. Keep the `netlify.toml` build command, publish folder, and Gutenberg proxy redirect in place.

No production deployment was performed from this workspace.
