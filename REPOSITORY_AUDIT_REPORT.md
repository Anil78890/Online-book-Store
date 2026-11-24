# BlueLeaf Books — Repository Audit Report

**Audit Date:** November 2026  
**Project:** BlueLeaf Books  
**Target Environment:** Netlify Deployment (`https://blueleaf-books.netlify.app/`)  
**Audit Scope:** Full codebase audit, security preflight, API reliability, architectural integrity, catalogue UX compliance, and release readiness.

---

## 1. Executive Summary & Repository Health

BlueLeaf Books is an established, high-quality open-book and public-domain reading web application built on React 18, TypeScript, Tailwind CSS, and Vite. 

### What Was Already Sound & Preserved
- **Clean Application Shell**: Modular React architecture with well-defined routing via `react-router-dom` (`/`, `/search`, `/book/:source/:id`, `/about`, `/sources`, `/privacy`, `/terms`, `/contact`).
- **PWA & Offline Text Architecture**: Service worker setup in `public/sw.js` with network-first navigation caching, plus client-side IndexedDB caching in `src/services/offlineStorage.ts` for full-text offline access.
- **Reader Accessibility & Ergonomics**: Full-featured in-browser reading experience with OpenDyslexic / Serif / Sans-serif typefaces, light / dark / OLED themes, SpeechSynthesis TTS, and text highlighting.
- **Netlify Configuration**: `netlify.toml` with same-origin `/api/gutenberg/*` proxy rewrite rules placed correctly above the SPA catch-all rule, coupled with strong Content Security Policy (CSP) and security headers.

---

## 2. Extra Work Assessment

### What Genuinely Needed Engineering Improvement (Implemented)
1. **Security & Distribution Hardening**: `.gitignore` was basic and did not exclude local agent configurations (`.codex/`, `.claude/`), machine-specific settings, build information (`*.tsbuildinfo`), or test coverage directories.
2. **Elimination of Card-Based Catalogue Components**: Legacy components `FeaturedFreeReads.tsx` and `TrendingCarousel.tsx` still rendered `BookCard` components with 3-column card grids and horizontal scrolling carousels, conflicting with the explicit product requirement for clean list rows throughout all discovery views.
3. **Transport Concurrency & In-Flight Request Deduplication**: Simultaneous requests for identical API URLs (e.g. popular shelves, category loads, or search typing) were previously executed as independent network requests.
4. **Truthful Availability Logic**: `normalizeGutendexBook` previously hardcoded `availability: 'full-text'` for all Gutenberg entries regardless of whether readable plain text/HTML formats actually existed on the record.
5. **Safe Gutenberg Proxy Path Allowlisting**: Content fetching required strict hostname and path validation to prevent acting as an open proxy or permitting path traversal.
6. **Semantic Correctness in Reading Analytics**: `useReadingAnalytics` used plain `id` as key (risking collisions between Gutenberg and Open Library books with the same numeric ID) and previously added scroll percentage differences directly to `pagesReadToday`.
7. **Progressive Search & Provider Partial Failure**: Cross-provider deduplication was basic; deduplication now merges titles across providers and prioritizes full-text editions.
8. **Removal of Fictional Reader Testimonials**: `SocialProof.tsx` contained invented reader names and quotes, which have been replaced with factual product capability commitments.
9. **Automated Verification Harness**: No automated test runner was configured; added Vitest with 4 comprehensive test suites covering transport, security allowlisting, normalization, and deduplication.

### What Was Optional or Intentionally Excluded
- **No Heavy Redesign**: Did not replace the aesthetic identity, color palette, or calm typography of BlueLeaf Books.
- **No Third-Party Backend or Tracking SDKs**: Kept the architecture strictly static and local-first. Did not introduce unnecessary databases, auth providers, or telemetry servers.
- **No Speculative Commerce or AI Features**: Avoided shopping carts, user accounts, fake newsletter endpoints, or hallucinated AI summary services.

---

## 3. Security Preflight & Audit Findings

### Local Configuration & Exposed Credential Alert
> [!CAUTION]
> **Owner Action Required (Immediate Credential Rotation):**  
> In the source archive snapshot provided prior to this audit pass, an API token was detected in a local `.codex/config.toml` file alongside machine-specific tool permissions in `.claude/settings.local.json`.
> - **Action Required:** Treat that credential as compromised. The owner must immediately revoke and rotate that API key through the upstream provider's console.
> - **Verification:** In this clean working copy, no `.codex/` or `.claude/` directories exist, no credentials exist in `.env.example`, and no secrets or private tokens are present in any frontend source file, build artifact, or configuration file.
> - **Exclusion Hardening:** `.gitignore` was updated with explicit patterns covering `.codex/`, `.claude/`, `*.local.json`, `.mcp/`, `.env*.local`, `dist/`, `coverage/`, and `*.tsbuildinfo`.

### Network & Proxy Security
- **Strict Hostname Allowlisting**: `toSameOriginProxyUrl` in `src/services/books/content.ts` validates that targets strictly match `www.gutenberg.org` or `gutenberg.org`.
- **Safe Path Allowlisting**: Path checking verifies that requests only access designated `/cache/epub/*`, `/ebooks/*`, or `/files/*` plain-text endpoints (`.txt`, `.txt.utf-8`). Path traversal attempts (`..`) are rejected.
- **Credentials Omitted**: All outbound fetch requests specify `credentials: 'omit'` to prevent unintended cookie leakage.
- **Content-Security-Policy (CSP)**: Confirmed in `netlify.toml` that `connect-src` is bounded to authorized origins (`self`, `gutendex.com`, `openlibrary.org`, `covers.openlibrary.org`, `gutenberg.org`, and authorized fallbacks).

---

## 4. Architectural & API Reliability Findings

| Area | Previous State | Improved State | File Evidence |
|---|---|---|---|
| **In-Flight Deduplication** | Multiple callers made separate concurrent HTTP requests | Shared in-flight promise map (`inFlightRequests`) deduplicates concurrent calls | `src/services/books/http.ts` |
| **Response Validation** | Generic type cast without runtime structure check | Runtime object/array check, HTTP status check, friendly JSON syntax error handling | `src/services/books/http.ts` |
| **Timeout Boundary** | Timeout cleared when headers arrived; stalled text bodies could hang | Deadline encompasses both response header arrival and body text streaming | `src/services/books/http.ts`, `content.ts` |
| **Availability Truthfulness** | Every Gutenberg record hardcoded as `full-text` | Checks actual presence of plain text/HTML formats before assigning `full-text` | `src/services/books/normalize.ts` |
| **Open Library Work Matching** | Title-starts-with match could pick unrelated author works | Normalized title matching requires matching author tokens | `src/services/books/content.ts` |
| **Non-Readable Reader State** | Returned 2-line description as reader body text | Throws explicit `FULL_TEXT_UNAVAILABLE`; BookPage displays clear metadata record | `src/services/books/content.ts`, `BookPage.tsx` |
| **Catalogue UI Mode** | `FeaturedFreeReads` and `TrendingCarousel` used `BookCard` card grids | Replaced with accessible, responsive `BookListItem` rows | `FeaturedFreeReads.tsx`, `TrendingCarousel.tsx` |
| **Reading Analytics** | Keyed by `id` only; scroll percentage deltas added to `pagesReadToday` | Composite keys (`source:id`); honest page calculation from word counts | `src/hooks/useReadingAnalytics.ts` |
| **Social Proof / Claims** | Named fictional reader testimonials | Factual product commitments (Open Access, Local Privacy, Offline Storage) | `src/components/SocialProof.tsx` |

---

## 5. UX & Accessibility Assessment

1. **Card-Free Catalogue Compliance**:
   - The catalogue is now 100% list-row based (`BookListItem`).
   - Every row provides: small cover thumbnail with deterministic gradient fallback (`CoverFallback`), source & availability badges, title, author, subject tags, and direct Read / Details and Save actions.
   - `BookCard.tsx` has been deprecated and re-routed to `BookListItem` to prevent accidental card regressions.
2. **Homepage Request Volume**:
   - Initial homepage paint loads only `FeaturedBooks` (8 items) with a 3-minute TTL cache and in-flight deduplication.
   - Secondary curated shelves (`FeaturedFreeReads`) utilize an `IntersectionObserver` to defer fetching until the reader scrolls down toward the section.
3. **Dedicated Reader & Honest Metadata View**:
   - For readable titles: Dedicated in-app reader with scroll progress, time remaining estimates, customizable typography, and text-to-speech narration.
   - For metadata-only titles: Honest bibliographic card explaining why full text is unavailable online, offering external Open Library links and internal Gutenberg search alternatives.

---

## 6. Automated Verification Summary

All verification gates have been executed and passed:

1. **Unit & Integration Test Suite (`npm test`)**:
   - 4 test files, 21 tests passing (100% success rate).
   - Test suites: `normalize.test.ts`, `content.test.ts`, `http.test.ts`, `index.test.ts`.
2. **TypeScript Compilation (`npm run typecheck`)**:
   - `tsc -b` executed with 0 type errors.
3. **Static Analysis & Linting (`npm run lint`)**:
   - `eslint .` executed with 0 errors and 0 warnings.
4. **Production Build (`npm run build`)**:
   - `vite build` generated optimized production assets in `dist/` with valid chunks and gzip compression in 9.81s.
