# BlueLeaf Books

[![Netlify Status](https://api.netlify.com/api/v1/badges/529b2105-df3b-4d38-90be-8cf4dad6eabc/deploy-status)](https://app.netlify.com/projects/sage-khapse-0934ef/deploys)

BlueLeaf Books is a calm, accessible, privacy-first web platform for discovering and reading legally accessible public-domain classics and open library collections. Built with React 18, TypeScript, Tailwind CSS, and Vite.

Live deployment: [https://sage-khapse-0934ef.netlify.app/](https://sage-khapse-0934ef.netlify.app/)  
Current working branch: `blueleaf-final-polish`

---

## Core Product Principles

- **Legal Free/Open Collections**: Multi-provider registry integrating Project Gutenberg (via Gutendex & first-party proxy), Open Library (Internet Archive), Internet Archive direct collections, Wikisource (Wikimedia Foundation), and Standard Ebooks.
- **Truthful Reading Capabilities**: Every record accurately reflects its true access model:
  * `FULL_TEXT`: Genuine in-browser reading with chapter Table of Contents and long-text chunking.
  * `OFFICIAL_EMBED`: In-app embedded reading via the official Internet Archive BookReader.
  * `BORROW_REQUIRED`: Honest guidance for Open Library's Controlled Digital Lending library.
  * `METADATA_ONLY`: Bibliographic records with a single-click search for public-domain editions.
- **No Card Grids**: Clean, responsive, accessible **compact list rows** (`BookListItem`) throughout homepage, search, and category views.
- **Horizontally Scrollable Featured Books**: Compact list-style book entries with subtle Previous/Next controls, touch-swipe support on mobile, and Left/Right keyboard arrow navigation.
- **15-Area Curated Genre Taxonomy**: Centralized subject mapping across all providers covering classics, philosophy, science fiction, adventure, mystery, history, romance, horror, poetry, drama, children's literature, biography, natural sciences, law/economics, and mythology.
- **Source Transparency & Rights**: Every title displays its verified provider attribution, license status (Public Domain, CC BY-SA 4.0, or Lending), and direct link to the official record.
- **Local-First Privacy**: No user accounts, tracking pixels, or marketing cookies. Reading progress, highlights, notes, and local analytics remain strictly in the reader's browser.
- **Offline Storage**: Public-domain reading texts are cached in IndexedDB upon opening, allowing previously opened books to remain accessible offline.

---

## Architecture & Data Flow

```
+-------------------------------------------------------------------------+
|                              BlueLeaf Books                             |
|          (React 18 + TypeScript + Vite + Tailwind CSS + PWA SW)         |
+------------------------------------+------------------------------------+
                                     |
               +---------------------+---------------------+
               |                                           |
       [Provider Registry]                       [Book Content Reader]
               |                                           |
  +------------+------------+                     +--------+--------+
  |            |            |                     |                 |
Gutendex  Open Library  Archive.org           IndexedDB       Netlify Proxy
(Gutenberg) (Catalogue)  (Direct/Embed)        (Cache)     (/api/gutenberg/*)
  |            |            |                     |                 |
Wikisource Standard Ebooks  |                     |        Gutenberg Mirrors
  |            |            |                     +--------+--------+
  +------------+------------+                              |
               |                                   [Chapter Detection &
    [Multi-Provider Search                         Chunked Text Pipeline]
    & Progressive Streaming]
               |
     [List Row View & TOC]
```

---

## Scripts & Development

```bash
# Install dependencies
npm ci

# Start local development server (http://localhost:5173)
npm run dev

# Run unit and integration tests (Vitest)
npm test

# Run opt-in live provider diagnostic probe
npm run diagnose:providers

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

## Testing & Quality Gates

The project uses [Vitest](https://vitest.dev/) with 37 tests across 6 test suites:

- `tests/adapters.test.ts`: Verifies multi-provider registration, display names, and 15-area genre query mapping.
- `tests/normalize.test.ts`: Verifies runtime JSON normalization and truthful reading capability flags.
- `tests/content.test.ts`: Verifies Project Gutenberg proxy allowlisting, boilerplate stripping, chapter detection, and chunking.
- `tests/featuredBooks.test.ts`: Verifies action labels, availability labels, and horizontal scroll boundary calculations.
- `tests/index.test.ts`: Verifies cross-provider deduplication and `settleBooks()` progressive loading and fault-tolerance.
- `tests/http.test.ts`: Verifies request deduplication, cache hits, and timeout bounds.
