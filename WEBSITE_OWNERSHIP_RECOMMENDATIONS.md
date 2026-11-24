# BlueLeaf Books — Bulletproof Build Spec (Gemini 3.1 Pro Edition)

Date: 2026-07-27
Model target: **Gemini 3.1 Pro** (also valid for GLM 5.2 / Opus). No token
limits — be thorough. This edition adds strict anti-hallucination guardrails.

**To the AI (Gemini 3.1 Pro):** You have unlimited budget. Implement EVERYTHING
below completely and correctly. Do not cut corners, do not stub features unless
the spec says so, and do not stop until the Definition of Done is fully met. You
have standing permission to write, edit, and install packages needed to fulfill
this spec. Stack: React + TypeScript + Vite + Tailwind. Data sources: Gutendex
(`gutendex.com`) and Open Library (`openlibrary.org`).

## 🛑 ANTI-HALLUCINATION RULES (READ FIRST — NON-NEGOTIABLE)
Gemini, you have a known tendency to invent things. Obey these or you will break
the app:

1. **NEVER invent APIs, endpoints, fields, props, hooks, or file paths.** If you
   are not 100% certain something exists, OPEN THE FILE and confirm. Only use
   endpoints/fields explicitly written in this spec or that you have verified in
   a real API response.
2. **READ BEFORE YOU WRITE.** Before editing ANY file, open and read it fully.
   Before importing from a module, open it and confirm the export exists. Before
   using a package, open `package.json` and confirm it is installed; if not,
   install it with the project's package manager (this repo uses **pnpm**).
3. **NO wholesale overwrites.** Make targeted edits. Never replace a working file
   with a guess. Preserve existing working functionality.
4. **VERIFY, don't assume.** Do not say a task is done until you have confirmed
   it: for code, run `pnpm lint` and `pnpm exec tsc --noEmit`; for a feature,
   trace the actual data path. If you cannot verify, say so — do NOT claim
   success.
5. **Do not fabricate cover URLs, book IDs, or sample data.** Use real API
   responses. For Gutendex covers use the `formats["image/jpeg"]` field. For
   Open Library covers use `https://covers.openlibrary.org/b/id/<cover_id>-L.jpg`
   from a real `cover_id`.
6. **When unsure between two valid approaches, pick the simplest that compiles,
   and leave a one-line `// TODO:` — never silently invent a complex fake.**
7. **Confirm field names against the real schema** (see "Verified API Facts"
   below). Do not guess property names like `book.plainText` — the real Gutendex
   text lives under `formats` keyed by MIME type.

## Verified API Facts (use these exactly — do not paraphrase)
- **Gutendex search:** `GET https://gutendex.com/books?search=<query>`.
- **Gutendex result fields:** `id`, `title`, `authors[].name`,
  `subjects[]`, `languages[]`, `download_count`, and `formats` — an object keyed
  by MIME type. Plain text keys: `"text/plain; charset=utf-8"`, `"text/plain"`.
  Cover key: `"image/jpeg"`.
- **Gutenberg plain-text mirror fallback:**
  `https://www.gutenberg.org/cache/epub/<id>/pg<id>.txt`.
- **Open Library search:** `GET https://openlibrary.org/search.json?q=<query>`;
  docs under `docs[]` with `key`, `title`, `author_name[]`, `cover_i`.
- **Open Library covers:** `https://covers.openlibrary.org/b/id/<cover_i>-L.jpg`.
- If any field is missing on a record, handle it gracefully — do NOT invent it.

## Operating Principles
- Prefer dedicated file-read/search/edit tools over shell utilities
  (`cat`/`ls`/`grep`/`sed`).
- Before any tool call, consider the full tool set and pick the most specific
  one; skip redundant calls.
- Type everything. Zero `any`. Keep lint and `tsc --noEmit` green.
- Small, composable components. Reuse before rewriting.
- Handle every async state: loading, empty, error, retry, offline.
- After EACH phase: run lint + typecheck, and confirm the phase's feature
  actually works before moving on. Report what you verified.

---

## ⭐ CRITICAL FIX — CORS / "The book could not be loaded"

**Root cause:** Project Gutenberg servers omit the
`Access-Control-Allow-Origin` header, so a browser `fetch()` of
`book.formats.plainText` directly from Gutenberg is blocked. This is why in-app
reading fails after removing external links.

**Required robust solution — implement a resilient text-loading pipeline in
`src/services/books/content.ts`:**

1. **Primary — Server proxy (best, do this if a backend/edge is available):**
   Add a serverless/edge function (or Vite dev proxy for local) at
   `/api/book-content?url=...` that fetches the Gutenberg text server-side (no
   CORS in server-to-server) and streams it back with
   `Access-Control-Allow-Origin: *`. Route all book-text fetches through it.
   - Vite dev: add a `server.proxy` entry in `vite.config` for local testing.
   - Production: deploy the function (Vercel/Netlify/Cloudflare edge) — pick one
     and wire it up.

2. **Fallback chain — public CORS proxies (use if no backend):** Try in order,
   moving to the next on failure/timeout:
   - `https://corsproxy.io/?url=<encoded>`
   - `https://api.allorigins.win/raw?url=<encoded>`
   - `https://thingproxy.freeboard.io/fetch/<url>`
   Wrap each in a 10s `AbortController` timeout.

3. **URL normalization:** Prefer Gutendex `formats["text/plain; charset=utf-8"]`
   or `text/plain`. If a `.zip`/`.htm` only is available, fall back to the
   `https://www.gutenberg.org/cache/epub/<id>/pg<id>.txt` mirror pattern.

4. **Cache-first:** Before any network call, check IndexedDB. On success, store
   the full text in IndexedDB so it never re-fetches (also powers offline).

5. **Graceful failure:** Only after ALL strategies fail, show a friendly retry
   UI (not a dead-end error). Never redirect the user off-site.

`getBookContent(book)` must implement: IndexedDB → proxy/backend → fallback
chain → cache result → return text. This makes reading bulletproof.

---

## PHASE 1 — Core Reading Experience

1. **In-app reading only.** Every book opens on `/book/:source/:id` and renders
   full text inside the app. Add `react-router-dom`. Detail pages load from
   route params (reloadable, shareable), not in-memory state.
2. **No external redirects.** Remove every link to Gutenberg / Open Library /
   external readers. All reading happens in-app via the pipeline above.
3. **White-label reader.** Hide raw source URLs, domains, and provider branding.
   One unified "BlueLeaf Books" reading view.
4. **Remove commerce.** Delete cart, prices, discounts, deals, bestsellers,
   "Add to Cart." Replace with Reading List / Save to Library. Count =
   `readingList.length`. Persist in `localStorage`.

## PHASE 2 — Data Foundation

5. **Shared type:** `src/types/book.ts` — one canonical `Book`. Separate raw
   response types for Gutendex and Open Library. No `any`.
6. **Service layer:** `src/services/books/` → `gutendex.ts`, `openLibrary.ts`,
   `normalize.ts`, `content.ts` (the pipeline above), `index.ts`. Expose:
   `searchBooks(query)`, `getPopularBooks()`, `getBooksByCategory(category)`,
   `getBookContent(book)`. Route ALL fetches here. Consistent errors + abort
   stale requests.

## PHASE 3 — Reader Superpowers

7. **Offline / PWA:** Service Worker + IndexedDB caching of full texts. Saved
   books read fully offline. Add manifest + installable PWA.
8. **Text-to-Speech:** Web Speech API narrator — play/pause, voice select,
   speed 0.75x–2x, sentence highlight synced to audio, progress.
9. **Typography / a11y:** font choice (serif, sans, OpenDyslexic), adjustable
   line-height, letter-spacing, margin/width, and OLED true-black dark mode.
   Persist in `localStorage`.
10. **Highlights & notes:** select text → multi-color highlights + notes +
    bookmarks, stored in IndexedDB, re-rendered on reopen.
11. **Reading estimates:** track reading speed → per-chapter & whole-book "time
    remaining." Optional AI chapter summaries (graceful stub if no key).
12. **Private analytics:** local-only streaks, pages/session, completion %.
    Never sent anywhere.

## PHASE 4 — Enhanced UI / Visual Appeal (my additions)

13. **Design system & tokens:** Define a cohesive palette (deep blue-green
    "leaf" brand, warm paper reading surface), consistent spacing scale, and
    reusable primitives. Use existing design-system components where present.
14. **Polished home:** hero with clear value prop, curated shelves (Popular,
    Classics, By Genre) as horizontal scroll rows, elegant book cards with
    cover, hover lift, and Save-to-Library action.
15. **Immersive reader chrome:** distraction-free mode, sticky slim progress
    bar, floating settings drawer, chapter drawer/TOC, smooth transitions
    (`motion/react`), respect reduced-motion.
16. **Micro-interactions & states:** skeleton loaders for search/covers,
    animated empty/error states, toast feedback (`sonner`) for saves, subtle
    page-turn or fade transitions between chapters.
17. **Responsive & mobile-first:** bottom nav on mobile, comfortable tap
    targets, reader gestures (tap edges / swipe to page), fluid typography.
18. **Cover fallback:** generate attractive gradient+title covers when no cover
    art exists, so the grid never looks broken.

## PHASE 5 — Launch Hardening

19. Trust pages: About, Contact, Privacy, Terms, Data Sources — linked in
    footer. (Attribution page satisfies source-credit obligations even while the
    reader stays white-labeled.)
20. SEO: real `<title>`, meta description, Open Graph + Twitter cards, favicon/
    app icons, `robots.txt`, generated `sitemap.xml`, JSON-LD for books.
21. Performance: debounce search, abort stale requests, lazy-load routes,
    virtualize very long texts, image dimensions to avoid layout shift.
22. Accessibility: aria-labels on icon buttons, focus states, focus trap +
    Escape to close modals, semantic landmarks, contrast checks.
23. Cleanup: rename package to `blueleaf-books`; ensure `npm run lint` and
    `npx tsc --noEmit` pass; add `README.md` + `.env.example`.

---

## Legal Note
Only surface texts the source legally permits to read free (Gutenberg public
domain = full text OK). You may present a white-labeled reader, but keep a
Data Sources / attribution page and never claim authorship of the works.

## Definition of Done (all must be true)
- ✅ Books load reliably in-app via the CORS-proof pipeline (proxy/backend +
  fallback chain + IndexedDB cache). No "could not be loaded" under normal use.
- ✅ Zero external redirects; no source branding in the reader.
- ✅ No commerce UI; Reading List persists.
- ✅ All data flows through `src/services/books` on the canonical `Book`.
- ✅ Offline reading, TTS, typography controls, highlights, estimates, and
  private analytics all work.
- ✅ Enhanced, responsive, animated UI with skeletons, toasts, and cover
  fallbacks.
- ✅ Trust pages + SEO + a11y present; lint and type checks pass.

## Build Order
CRITICAL FIX → Phase 1 → 2 → 3 → 4 → 5. Verify each phase compiles and the
feature works before continuing.

## Final Reminder to Gemini
Every claim of "done" must be backed by a verification step (lint passed,
typecheck passed, data path traced). If you catch yourself about to write an
endpoint, field, prop, or import you have not confirmed exists — STOP, open the
source, and check. Correct-but-simple beats impressive-but-fabricated.


