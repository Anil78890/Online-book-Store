# BlueLeaf Books — Release Test Report

**Branch:** `blueleaf-final-polish`  
**Test Suite:** Vitest v1.6.1 + TypeScript 5.5 + ESLint 9  
**Execution Timestamp:** 2026-11-24  

---

## 1. Automated Test Results (`npm test`)

All 37 unit and integration tests passed cleanly:

```text
 ✓ tests/normalize.test.ts      (10 tests)
 ✓ tests/content.test.ts        (8 tests)
 ✓ tests/adapters.test.ts       (7 tests)
 ✓ tests/featuredBooks.test.ts  (4 tests)
 ✓ tests/index.test.ts          (5 tests)
 ✓ tests/http.test.ts           (3 tests)

 Test Files  6 passed (6)
      Tests  37 passed (37)
```

### Coverage Highlights
* **`normalize.test.ts`:** Tests truthful reading capabilities across Gutendex (`FULL_TEXT`, `METADATA_ONLY` for audio records) and Open Library (`FULL_TEXT` for public IA, `BORROW_REQUIRED` for borrowable, `METADATA_ONLY` for missing ebooks).
* **`content.test.ts`:** Tests Project Gutenberg boilerplate stripping, same-origin proxy regex allowlisting, safe path verification, chapter detection with headings/offsets, and fallback chunking for unlabelled long texts.
* **`adapters.test.ts`:** Tests provider registry, provider display names, Wikisource text sanitization, and 15-area genre query mapping across providers.
* **`featuredBooks.test.ts`:** Tests capability label mappings (`Read`, `Borrow`, `Details`), scroll bound calculations, and button boundary disabling logic.
* **`index.test.ts`:** Tests cross-provider deduplication prioritizing full text, and `settleBooks()` progressive loading and fault-tolerance when one provider experiences outages.
* **`http.test.ts`:** Tests request deduplication, cache hits, and timeout bounds.

---

## 2. Static Analysis & Type Checking (`npm run typecheck` & `npm run lint`)

| Quality Gate | Command | Result |
| :--- | :--- | :--- |
| **TypeScript Compilation** | `npm run typecheck` (`tsc -b`) | **0 errors** |
| **ESLint Verification** | `npm run lint` (`eslint .`) | **0 errors / 0 warnings** |

---

## 3. Production Build Measurements (`npm run build`)

Production bundle built via Vite 5.4.8:

```text
dist/index.html                          2.42 kB │ gzip:  0.81 kB
dist/assets/index-Drgykd5H.css          45.94 kB │ gzip:  8.47 kB
dist/assets/NotFound-CAWrKaOy.js         0.81 kB │ gzip:  0.47 kB
dist/assets/Contact-BRlfV0yV.js          1.08 kB │ gzip:  0.63 kB
dist/assets/Terms-DeNsH6CY.js            1.19 kB │ gzip:  0.65 kB
dist/assets/InfoPage-CWIDVUrs.js         1.27 kB │ gzip:  0.63 kB
dist/assets/Privacy-7vmibc7j.js          1.46 kB │ gzip:  0.78 kB
dist/assets/BookListItem-Cujg6wT9.js     5.57 kB │ gzip:  1.72 kB
dist/assets/SearchResults-BVhbMf8q.js    6.13 kB │ gzip:  2.33 kB
dist/assets/Sources-D9W0OqXo.js          8.82 kB │ gzip:  3.15 kB
dist/assets/About-CuEzDwGk.js            9.34 kB │ gzip:  3.04 kB
dist/assets/Home-BJpPFzkZ.js            19.70 kB │ gzip:  5.52 kB
dist/assets/icons-DQPJOiij.js           20.78 kB │ gzip:  4.30 kB
dist/assets/BookPage-Crlk_QQE.js        47.06 kB │ gzip: 14.41 kB
dist/assets/index-DnftHPtF.js           82.64 kB │ gzip: 26.00 kB
dist/assets/proxy-DvqhGCes.js          126.05 kB │ gzip: 41.54 kB
dist/assets/vendor-B9B04VyU.js         141.28 kB │ gzip: 45.44 kB
✓ built in 8.13s
```

* Total gzipped CSS: **~8.5 kB**
* Core application bundle: **~26 kB gzipped**
* Large vendor libraries split into separate chunks for efficient long-term browser caching.

---

## 4. End-to-End & Interactive QA Verification

* **In-App Reader:** Verified that Project Gutenberg full-text content displays real prose, preserves chapter headings, supports chapter dropdown navigation, and chunks long books to avoid UI freeze.
* **Embedded Reader:** Verified that Internet Archive public-domain items render via the official embedded reader within the application without breaking CSP.
* **Borrowable Works:** Verified that Open Library controlled digital lending records display honest borrow guidance cards with legitimate provider links.
* **Featured Books Scrolling:** Verified horizontal smooth scrolling with Previous/Next controls, touch-swipe support on mobile, and Left/Right keyboard navigation with visible focus rings.
* **Proxy Hardening:** Removed dependencies on third-party public CORS proxies (`corsproxy.io`, `api.allorigins.win`).
