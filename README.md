# BlueLeaf Books

BlueLeaf Books is a calm, accessible, privacy-first web platform for discovering and reading legally accessible public-domain classics and open catalogue records. Built with React 18, TypeScript, Tailwind CSS, and Vite.

Live deployment: [https://blueleaf-books.netlify.app/](https://blueleaf-books.netlify.app/)

---

## Core Product Principles

- **Legal Public-Domain Reading**: Powered by Project Gutenberg (via Gutendex and same-origin proxy text retrieval) and Open Library for open catalogue records.
- **Truthful Availability**: Every record clearly indicates whether it is **Free to read** (full plain text available in-browser) or **Open metadata** (bibliographic and cover details).
- **No Card Grids**: Clean, responsive, accessible **list rows** (`BookListItem`) replace boxed card grids and horizontal carousels throughout the home, curated shelves, and search views.
- **Local-First Privacy**: No user accounts, tracking pixels, or third-party marketing cookies. Reading lists, highlights, notes, and local reading statistics stay exclusively in the reader's browser.
- **Distraction-Free Reader**: Adjustable typography (Serif, Sans, OpenDyslexic), line height, letter spacing, font size, themes (Light, Dark, true OLED), text-to-speech narration, and scroll progress tracking.
- **Offline Storage**: Reading texts are cached in IndexedDB upon opening, allowing previously opened books to remain readable offline.

---

## Architecture & Data Flow

```
+-------------------------------------------------------------+
|                      BlueLeaf Books                         |
|  (React 18 + TypeScript + Vite + Tailwind CSS + PWA SW)     |
+------------------------------+------------------------------+
                               |
            +------------------+------------------+
            |                                     |
    [Catalogue Search]                    [Book Content Reader]
            |                                     |
     +------+------+                      +-------+-------+
     |             |                      |               |
Gutendex      Open Library           IndexedDB       Netlify Proxy
(Gutenberg)   (Catalogue)             (Cache)     (/api/gutenberg/*)
     |             |                      |               |
     +------+------+                      |      Gutenberg Mirrors
            |                             |      (Plain text stream)
   [Deduplicated & Merged                 +---------------+
    by Title + Author]                                    |
            |                                    [Boilerplate Stripper
     [List Row View]                             & Bounded Deadline]
```

1. **Transport & Deduplication Layer (`src/services/books/http.ts`)**:
   - In-flight request deduplication prevents redundant parallel calls to external APIs.
   - Bounded in-memory response cache with TTL (45s search, 2m-3m categories, 10m book records).
   - Defensive response validation, HTTP status inspection, and safe JSON parsing.
   - Caller abort forwarding ensures cancelled searches abort cleanly without false error toasts.

2. **Catalogue & Search Layer (`src/services/books/index.ts`)**:
   - Progressive search returns the first healthy provider immediately without waiting for the slower one.
   - Intelligent cross-provider deduplication prefers full-text Gutenberg records when both providers return the same title and author.
   - Lazy-loaded curated shelves on the homepage prevent initial network congestion.

3. **Content Retrieval Pipeline (`src/services/books/content.ts`)**:
   - Cache-first check against browser IndexedDB.
   - Safe URL allowlisting ensures proxy paths strictly match verified Project Gutenberg text routes.
   - Overall timeout deadline covers both header retrieval and full-body text parsing.
   - Honest error reporting: metadata-only works and non-digitized titles show a dedicated bibliographic record rather than fake content.

4. **Local Reading Analytics (`src/hooks/useReadingAnalytics.ts`)**:
   - Composite keys (`source:id`) eliminate ID collisions between different book sources.
   - Defensible reading metrics calculate estimated pages read based on word counts rather than raw scroll percentages.

---

## Scripts & Development

```bash
# Install dependencies
npm ci

# Start local development server (http://localhost:5173)
npm run dev

# Run unit and integration tests (Vitest)
npm test

# Type check
npm run typecheck

# Lint source code
npm run lint

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Testing

The project uses [Vitest](https://vitest.dev/) for unit and integration testing:

- `tests/normalize.test.ts`: Verifies runtime JSON normalization, truthful availability flags, and error resilience.
- `tests/content.test.ts`: Verifies Gutenberg proxy allowlisting (preventing open proxy vulnerabilities) and header/footer boilerplate stripping.
- `tests/http.test.ts`: Verifies in-flight request deduplication, TTL caching, and invalid JSON handling.
- `tests/index.test.ts`: Verifies cross-provider deduplication (preferring full-text editions) and progressive partial search results.

---

## Deployment (Netlify)

The project is pre-configured for Netlify deployment via `netlify.toml`:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Proxy redirect**: `/api/gutenberg/*` rewrites to `https://www.gutenberg.org/:splat` (must remain above SPA catch-all)
- **SPA routing**: `/*` rewrites to `/index.html` with status 200
- **Security headers**: Strict CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

---

## License & Attribution

- Public domain book texts are provided through [Project Gutenberg](https://www.gutenberg.org/) and [Gutendex](https://gutendex.com/).
- Bibliographic records and covers are provided through [Open Library](https://openlibrary.org/).
- BlueLeaf Books application source code is released under the MIT License.
