# BlueLeaf Books — Real Data Reader Content Verification & Evidence

**Verification Date:** 2026-11-24  
**Target Branch:** `blueleaf-final-polish`  
**Test Suite:** Playwright Chromium E2E + Live Real-Data Diagnostic  
**Dev Server:** `http://localhost:5173`  

---

## 1. Provider Content Verification Matrix

The following table documents live verification using real books across all integrated libraries. Every entry was tested against live upstream infrastructure without mocks.

| Provider | Real Title | Real ID | Content Type | Response Status | Bytes / Chars / Words | First Body / Chapter Verified? | Middle / Later Verified? | Screenshot / Test Evidence |
|:---|:---|:---|:---|:---:|:---:|:---:|:---:|:---|
| **Project Gutenberg** | Pride and Prejudice | `1342` | `text/plain` | `200 OK` | 772,386 bytes<br>763,082 chars<br>~130,416 words | **YES**<br>Opening & Ch 1 verified ("truth universally acknowledged") | **YES**<br>Ch 2 & Ch 3 navigated via chapter buttons | [gutenberg-chapter-1.png](file:///D:/blueleaf-books-improved/docs/screenshots/gutenberg-chapter-1.png)<br>[gutenberg-chapter-2.png](file:///D:/blueleaf-books-improved/docs/screenshots/gutenberg-chapter-2.png)<br>[gutenberg-later-chapter.png](file:///D:/blueleaf-books-improved/docs/screenshots/gutenberg-later-chapter.png) |
| **Project Gutenberg** | Frankenstein | `84` | `text/plain` | `200 OK` | 448,885 bytes<br>446,582 chars<br>~78,106 words | **YES**<br>Preface & Letters verified; 54 chapter headings | **YES**<br>Later chapters verified (Ch 1–24) | `npm run diagnose:reading`<br>(Probe 2 passed) |
| **Internet Archive (OCR)** | Alice's Adventures in Wonderland | `alicesadventures00carr` | `text/plain`<br>(djvu OCR text) | `200 OK` | 398,292 bytes<br>396,957 chars<br>~65,428 words | **YES**<br>Opening chapters verified; 48 headings | **YES**<br>Full book OCR text scrollable | [internet-archive-reading.png](file:///D:/blueleaf-books-improved/docs/screenshots/internet-archive-reading.png) |
| **Internet Archive (Scan)** | Alice's Adventures in Wonderland | `alicesadventures00carr` | `scanned-reader`<br>(BookReader iframe) | `200 OK` | 239,980 bytes<br>(iframe document) | **YES**<br>BookReader embed loaded with multi-page viewer | **YES**<br>Interactive page flip controls available | `npm run diagnose:reading`<br>(Probe 4 passed) |
| **Standard Ebooks** | Pride and Prejudice | `jane-austen/pride-and-prejudice` | `text/html`<br>(single-page edition) | `200 OK` | 861,844 bytes<br>850,105 chars<br>~125,691 words | **YES**<br>Chapter I verified; clean typography without web headers | **YES**<br>Full unabridged book body navigable | [standardebooks-reading.png](file:///D:/blueleaf-books-improved/docs/screenshots/standardebooks-reading.png) |
| **Wikisource** | The Raven | `The_Raven_and_Other_Poems/The_Raven` | `application/json`<br>(action=parse) | `200 OK` | 14,636 bytes<br>14,636 chars<br>~1,186 words | **YES**<br>Stanza 1 verified ("Once upon a midnight dreary") | **YES**<br>All 18 stanzas rendered through "Nevermore" | [wikisource-reading.png](file:///D:/blueleaf-books-improved/docs/screenshots/wikisource-reading.png) |
| **Open Library** | Pride and Prejudice | `OL27479W` | `application/json`<br>(works record) | `200 OK` | 5,702 bytes<br>(metadata payload) | **N/A**<br>Correctly displays Bibliographic Record; no false "Read Now" | **N/A**<br>Provides official Open Library & Gutenberg links | `npm run diagnose:reading`<br>(Probe 7 passed) |

---

## 2. Failure Case & Corrected Behavior

### Case Study: Internet Archive `OFFICIAL_EMBED`
- **Initial Failure:**
  When a user opened `/book/internetarchive/alicesadventures00carr`, the reader evaluated:
  `hasInAppFullText = false` (since raw OCR download was slow or scan-only), and
  `hasExternalEmbed = false` (because `'OFFICIAL_EMBED'` was not present in the capability check).
  The page fell through to the `/* Metadata-Only Open Library Record */` state.
  **User Symptom:** The reader displayed only the cover thumbnail and the bibliographic details card. No book pages or text were reachable.
- **Corrected Behavior:**
  1. `hasExternalEmbed` checks `book.readingCapability === 'OFFICIAL_EMBED'`.
  2. The interactive Internet Archive BookReader renders inside a responsive `h-[75vh] min-h-[520px] w-full` viewer.
  3. The user can flip through the authentic digitized pages, zoom, toggle two-page view, and read the original 1865 edition directly inside BlueLeaf Books.

---

## 3. Responsive Mobile Layout Verification

- **Viewport:** 375px × 667px (iPhone SE standard emulation)
- **Verified Layout:**
  - On viewports `< 1024px`, CSS flex/grid order places `<section>` (the reader canvas) at `order-1`, above `<aside>` (`order-2`).
  - The reader canvas starts at `y = 120px` (directly below the slim reader header).
  - Users are immediately presented with the book text without having to scroll past the 200px+ cover image or metadata cards.
- **Screenshot Evidence:**
  - [mobile-reader-layout.png](file:///D:/blueleaf-books-improved/docs/screenshots/mobile-reader-layout.png)

---

## 4. Test Suite Execution Summary

### Vitest Unit Tests (`npm test`)
```
✓ tests/normalize.test.ts  (10 tests)
✓ tests/content.test.ts    (9 tests)
✓ tests/adapters.test.ts   (7 tests)
✓ tests/featuredBooks.test.ts (4 tests)
✓ tests/index.test.ts      (5 tests)
✓ tests/http.test.ts       (3 tests)

Test Files  6 passed (6)
     Tests  38 passed (38)
```

### TypeScript Typecheck (`npm run typecheck`)
```
tsc -b — 0 errors, clean output
```

### ESLint (`npm run lint`)
```
eslint . — 0 warnings, 0 errors
```

### Production Build (`npm run build`)
```
vite v5.4.8 building for production...
✓ 1919 modules transformed.
dist/index.html                           2.42 kB │ gzip:  0.82 kB
dist/assets/index-0zTTfo4e.css           46.51 kB │ gzip:  8.58 kB
dist/assets/BookPage-Bi9iRTWf.js         49.80 kB │ gzip: 14.74 kB
✓ built in 7.45s
```

### Live Diagnostic (`npm run diagnose:reading`)
```
================================================================================
DIAGNOSTIC SUMMARY: Passed: 7 | Inconclusive: 0 | Failed: 0
================================================================================
```

### Playwright E2E Suite (`npm run test:e2e`)
```
Running 5 tests using 1 worker
  ✓  1 [chromium] › Project Gutenberg: displays real chapters beyond cover and navigates (24.9s)
  ✓  2 [chromium] › Mobile Reader Layout: reader canvas is primary on small viewports (26.4s)
  ✓  3 [chromium] › Standard Ebooks: renders curated full-text edition in reader (4.5s)
  ✓  4 [chromium] › Wikisource: renders real article and poem body in reader (2.5s)
  ✓  5 [chromium] › Internet Archive: renders OCR text or official BookReader embed beyond cover (5.0s)

5 passed (1.1m)
```
