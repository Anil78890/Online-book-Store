# BlueLeaf Books — Cover-Only Reader: Root-Cause Diagnosis and End-to-End Fix

**Target branch:** `blueleaf-final-polish`  
**Production site:** https://blueleaf-books.netlify.app/  
**Scope:** Fix the defect where opening a book shows only its cover/cover screen instead of the actual book pages or readable text.

## Mission

Act as the senior engineer responsible for the existing BlueLeaf Books repository. The user reports that books are displaying only a cover screen and are not showing the actual book content. Treat this as a release-blocking defect.

Do not assume the previous audit proves the reader works. Reproduce the exact user-visible failure with real provider data, trace the request and rendering pipeline, identify the root cause, fix it in the existing application, and verify the fix in a real browser. Do not just write a report or add mock data.

**Do not deploy to Netlify or modify production.** Work on `blueleaf-final-polish`, preserve existing changes, commit and push only after all checks pass, and give the owner the branch URL and evidence.

---

## 1. What the previous reports say — and what still needs proof

Read all four reports supplied with this task:

- `LIVE_PROVIDER_DIAGNOSTIC.md`
- `PROVIDER_AND_LICENSE_MATRIX.md`
- `RELEASE_TEST_REPORT.md`
- `GENRE_COVERAGE.md`

They report that:

- Gutendex search returns book metadata and format URLs; direct Gutenberg requests returned 503 in the diagnostic probe, with a same-origin Netlify rewrite proposed as the workaround.
- Internet Archive metadata returns a `files` array and may expose a `*_djvu.txt` OCR text file; the reports also describe an official embedded BookReader route.
- Wikisource search returns results/snippets, while the MediaWiki `action=parse` endpoint is intended to return actual page content.
- Standard Ebooks exposes an Atom feed and single-page web editions / EPUB links.
- Open Library is a metadata/discovery layer; actual reading access depends on the Internet Archive item and its access state.
- The release report claims 37 tests passed and says Gutenberg text and the Internet Archive embedded reader were tested.

However, the reports do **not** give reproducible proof for the user's exact symptom. They do not include a list of tested real book IDs with first/middle/last chapter assertions, actual extracted text lengths, screenshots of later pages, network traces, or proof that the reader is not rendering only a cover/title page. A green unit-test/build report is not sufficient evidence that every provider's real book body is displayed.

The latest genre report defines 15 subject areas. Do not silently describe this as 30 genres or fabricate collection counts.

---

## 2. Reproduce the actual failure before editing

1. Check out and pull the latest `blueleaf-final-polish` branch. Confirm the working tree is clean before changes.
2. Run the application using the repository's documented commands.
3. Use Playwright (or add it as a development-only test tool if absent) to open the homepage, search for real books from each integrated provider, open at least one book, and capture screenshots.
4. Reproduce the reported cover-only outcome. Record the exact search term, provider, book title, provider identifier, route, browser, viewport, timestamp, and reproduction steps.
5. In browser DevTools/Playwright, capture:
   - Console errors and warnings.
   - Network requests, status codes, content types, redirects, CORS/CSP failures, response sizes and durations.
   - The exact content URL or embed URL used by the reader.
   - The DOM rendered in the reader (is it only an image/iframe cover, metadata, a title page, or actual text/pages?).
6. Do not claim a provider works because its search API returns 200. Discovery success is not content retrieval success.
7. Do not claim a reader works because an iframe element exists. Verify that the iframe loaded, contains navigable content, and can advance beyond the cover.

Create `docs/cover-only-reproduction.md` with exact reproducible findings before or alongside the fix.

---

## 3. Trace the entire book-to-reader path

Follow one real book record through every stage:

`Provider search -> raw provider response -> normalisation -> Book model -> reading capability -> book route -> content resolver -> fetch/iframe/EPUB parser -> reader renderer -> next chapter/page navigation`

Inspect especially:

- Whether cover image URLs are accidentally assigned as content URLs.
- Whether a provider's `preview`, `thumbnail`, `image`, `cover`, `web page`, `manifest`, or `metadata` link is mistakenly treated as a full-text file.
- Whether provider IDs are confused across Gutendex, Open Library, Internet Archive, Wikisource and Standard Ebooks.
- Whether Open Library work IDs, edition IDs and Internet Archive identifiers are being interchanged.
- Whether a route parameter is decoded/encoded incorrectly or the wrong provider adapter is selected.
- Whether the reader uses a fallback that displays the book cover when content fetch/parse fails, while incorrectly reporting success.
- Whether an iframe is clipped behind an overlay, has zero height, is blocked by CSP/X-Frame-Options, or is being pointed at a cover/metadata endpoint.
- Whether a loading state ends after metadata/cover fetch rather than actual body-content readiness.
- Whether `srcDoc`, sanitizer, HTML parser, EPUB parser, iframe sandbox or CSS removes/hides the real content.
- Whether the service worker or IndexedDB returns a stale cached cover/metadata payload under a book-content cache key.
- Whether reader state is reused across books and shows the previous book or a cover-only state.

Add temporary structured diagnostics during development, but remove secrets and avoid logging the full copyrighted text or personal information.

---

## 4. Implement provider-correct content handling

Use one adapter per provider and one common reader contract. Never treat a cover, metadata page, abstract, API search snippet, or bibliographic description as the book body.

Every provider adapter must return an explicit, truthful content result, for example:

```ts
 type BookContentResult =
   | { kind: 'plain-text'; text: string; sourceUrl: string; attribution: string }
   | { kind: 'html'; html: string; sourceUrl: string; attribution: string }
   | { kind: 'epub'; url: string; sourceUrl: string; attribution: string }
   | { kind: 'pdf'; url: string; sourceUrl: string; attribution: string }
   | { kind: 'scanned-reader'; embedUrl: string; pageCount?: number; sourceUrl: string; attribution: string }
   | { kind: 'borrow-required'; url: string; attribution: string }
   | { kind: 'preview-only'; url: string; attribution: string }
   | { kind: 'metadata-only'; url?: string; attribution: string }
   | { kind: 'unavailable'; reason: string };
```

Adapt this type to the codebase rather than copying blindly. Keep the `kind` distinction explicit all the way into the UI.

### Project Gutenberg / Gutendex

- Read the live `formats` map from Gutendex and choose an actually available text/HTML/EPUB format.
- Prefer a validated text/HTML/EPUB URL from the record; only construct a URL if the provider documents that pattern and the identifier is validated.
- Check the same-origin Netlify rewrite and ensure it maps to the correct upstream path without double-prefixing or dropping path segments.
- Keep the request deadline active until the full response body has been consumed.
- Detect HTML error pages, bot-protection pages, 503/403 responses, redirects to a landing page and too-short bodies. Do not call these book text.
- Strip Gutenberg front/back boilerplate without removing the actual first chapter.
- Confirm that the displayed reader contains the actual first chapter and later text, not only the title/cover page.
- Respect Project Gutenberg access and trademark/attribution guidance for the particular user's territory; do not assume US public-domain status is worldwide public-domain status.

### Internet Archive / Open Library

This is a high-priority likely source of the cover-only symptom.

- Treat Open Library as a discovery/metadata source, not as proof that the book body can be read.
- Resolve the Open Library work/edition to the correct Internet Archive identifier only when the record actually provides a valid mapping.
- Fetch `https://archive.org/metadata/{identifier}` and inspect its `files` list and access/rights metadata.
- Look for a real OCR full-text file such as `{identifier}_djvu.txt` (or another documented text derivative actually listed in the metadata response). Do not guess that the file exists.
- If a valid OCR text file exists and is accessible, fetch it through the appropriate provider path, verify the response is text, parse it, and render the actual book text in the BlueLeaf reader.
- If OCR is absent but an authorised official BookReader is available, render the **official reader** in a properly sized, visible, responsive reader viewport. Verify navigation past the cover to the first text page, a middle page and a later page. The cover alone is not a successful result.
- Ensure the iframe uses the correct Internet Archive identifier and documented embed URL. Check frame permissions, CSP, sandbox attributes, sizing, loading state and responsive behaviour.
- Add explicit page controls/reader guidance when needed. Do not claim text extraction for an image-only scan.
- Respect item-level rights, controlled lending, login and borrow states. Never cache controlled-lending content offline or bypass access controls.
- If the item is borrow-only, show a clear Borrow action and use the official lending flow.

### Wikisource

- Do not render the search result snippet as the book.
- Resolve the actual page title/page ID returned by search.
- Call the MediaWiki parse/content endpoint for the actual page and retrieve its complete available content (and continuation/sections where relevant).
- Sanitize returned HTML safely while preserving paragraphs, headings, lists, footnotes and links.
- Handle disambiguation pages, index pages and multi-page works by following their actual page/chapter structure. Do not treat an index page as the complete book.
- Add source attribution and a link to the source/revision history.

### Standard Ebooks

- Parse the Atom feed and use the actual item links/identifiers; do not invent slugs from titles.
- Retrieve the official single-page HTML edition or EPUB resource only when the feed/item provides a valid link.
- For HTML, sanitize and render the actual text and chapter headings.
- For EPUB, use a maintained, browser-compatible EPUB renderer/parser if needed (evaluate a suitable open-source library such as epub.js, including licence, bundle size and security implications). Parse the package/OPF/manifest/spine and render the reading order, not just the cover image.
- Detect unavailable links and provide an honest official-source action.

### Other sources

- Google Books: show only the official preview/embed when the API confirms preview availability. Do not scrape or claim full text from the thumbnail/cover URL.
- DOAB/OpenStax/other open collections: integrate only when their official APIs or documented feeds expose a legitimate downloadable/readable resource. Verify each item’s licence and terms.
- Keep provider attribution and item-level access conditions visible.

---

## 5. Fix the reader UI so a cover cannot masquerade as a book

The reader must show distinct states:

1. `Loading book content…` while the actual body/content viewer is loading.
2. A full-text reader with actual text and chapter navigation.
3. An EPUB/PDF reader with actual document pages and working navigation.
4. An official scanned BookReader with a visible page navigator and total page count where available.
5. A borrow/preview/metadata/unavailable state with a clearly labelled provider action.
6. A retryable error state when content retrieval fails.

Rules:

- A cover image may appear in book details or before reading, but it must never be displayed as the only content while the UI says `Read now` or marks the book as fully readable.
- Do not silently fall back from failed content to the cover, synopsis or description and call it success.
- Do not mark `contentLoaded` until a meaningful body is rendered or the official reader reports a loaded document with navigable pages.
- For text content, show word count, chapter/section count when available, and a source attribution.
- For scanned books, show `Scanned pages` or `Official scanned reader`, not `Full text` unless OCR text is actually available.
- Make the reader viewport tall enough and visible on desktop and mobile. Test sticky headers, overlays, z-index, scroll containers, iframe dimensions and touch controls.
- Preserve the existing reader themes, font controls, bookmarks, highlights, notes, narration and reading progress where compatible.
- Use the actual book body for narration; never narrate title/description/cover alt text as though it were a full book.

---

## 6. Add real-data diagnostics and repeatable end-to-end tests

Create a diagnostic command, for example `npm run diagnose:reading`, that probes representative live books from each integrated provider. The script must report:

- Provider and real provider identifier.
- Title and author.
- Capability assigned by normalisation.
- Exact selected content resource type (text, HTML, EPUB, PDF, scanned embed, borrow, metadata).
- HTTP status, final URL host/path (no secrets), content type, content length and request duration.
- Whether the response is valid content or an error/landing/cover-only response.
- Extracted character count and word count for text/HTML.
- Number of headings/chapters/sections when detectable.
- Page count and navigation evidence for a scanned/PDF/EPUB viewer where available.
- Final reader route and result.

Use safe, legally accessible real sample books. Do not hardcode a success result. If an external service is unavailable, report `INCONCLUSIVE/PROVIDER_UNAVAILABLE`, not `PASS`.

Add deterministic automated tests for:

- Cover URL rejected as a content URL.
- Search snippet/description rejected as full text.
- Gutenberg valid plain text returns substantial real body text after boilerplate removal.
- Gutenberg HTML error or 503 is not accepted as text.
- Internet Archive metadata selects only a text derivative actually listed in `files`.
- IA text derivative parser returns body text, not just metadata.
- IA embed has correct identifier, visible viewport and accessible next-page navigation.
- Open Library public/borrowable/no-ebook states are correctly distinguished.
- Wikisource returns actual parsed article/page content, not search snippets.
- Standard Ebooks single-page/EPUB path renders the spine/body, not just cover.
- A missing or failed provider produces a truthful fallback and does not set a false success flag.
- No cached cover/metadata response is served as book text.

Add Playwright end-to-end tests that open a real book and prove the user can get beyond the cover. Capture screenshots for:

- Book detail/cover state.
- First actual text chapter or first readable page.
- A middle chapter/page.
- A later chapter/page.
- Mobile reader layout.

For plain text, assert meaningful text length (set a sensible provider-specific threshold, generally at least 1,000 characters for a full-text test), and assert that the content includes known text from the chosen real book. Do not use an arbitrary non-empty title as proof.

For scanned/image-only books, assert that the official viewer displays multiple navigable pages and can advance beyond the cover/title page. Do not falsely assert extracted text.

Keep live-provider diagnostics separate from deterministic tests so temporary network outages do not make all CI tests flaky.

---

## 7. Required debugging evidence

Create `docs/reader-content-evidence.md` with a table containing at least one representative real book per provider:

| Provider | Real title | Real ID | Content type | Response status | Bytes/chars/pages | First body/chapter verified? | Middle/later verified? | Screenshot/test |
|---|---|---|---|---|---:|---|---|---|

Attach/retain sanitized screenshots and test artifacts. Include one failure case and show the corrected behaviour. Do not include copyrighted full-text excerpts in the report; use short identifying snippets only where permitted, or hashes/word counts and chapter titles.

If a provider has no legally accessible full text for a tested item, record its honest capability and official access route. Do not invent successful content.

---

## 8. Search and catalogue rules

- Keep the existing compact list-row design; do not reintroduce large cards or a card grid.
- Keep the requested horizontal scrolling for Featured Books if already implemented, but do not turn every shelf into an autoplay carousel.
- Keep genre results sourced from live provider responses. Do not fabricate titles, cover images, ratings, counts or availability.
- Search may combine providers progressively, but deduplicate carefully and preserve the provider identifier needed for content resolution.
- Do not discard a working full-text edition in favour of a metadata-only duplicate.
- Do not show `Read` for cover-only, metadata-only or borrow-only records.

---

## 9. Security, licensing and reliability

- Never bypass DRM, paywalls, controlled lending, login requirements, rate limits or provider access restrictions.
- Do not introduce unrestricted CORS proxies or open proxy endpoints.
- Validate every provider URL and identifier; allowlist upstream hosts and safe paths where a server-side proxy is required.
- Do not expose credentials, cookies, private tokens or user data in logs or client bundles.
- Respect each provider's terms, licence, attribution and caching conditions.
- Do not persist controlled-lending or restricted content for offline use.
- Do not assume public-domain status in every country. Display source/license notes and avoid blanket legal claims.
- Keep request deadlines active through body download and parsing. Use bounded retries with jitter only for retryable errors. Avoid retrying 403/404 or access-denied responses as if they were transient.

---

## 10. Release gates

Before committing, run and report actual output for:

```bash
npm test
npm run typecheck
npm run lint
npm run build
npm run diagnose:reading
npm run test:e2e
```

If a script does not yet exist, add it and document it. If a live service cannot be reached, state that exact provider check as inconclusive.

Do not claim `all providers verified` unless there is per-provider real-data evidence.

Do not claim `full-text reader` for a provider whose verified behaviour is only a cover image, metadata page, search snippet, or a scanned cover with no page navigation.

---

## 11. Git workflow and final response

1. Work on `blueleaf-final-polish` and pull the latest remote branch first.
2. Preserve the existing implementation and all changes already committed.
3. Fix the reproduced root cause; do not perform an unrelated rewrite.
4. Run tests, real-data diagnostics and Playwright browser checks.
5. Review `git diff` for secrets, local settings, generated files and accidental large assets.
6. Commit with a clear message describing the reader/content fix.
7. Push `blueleaf-final-polish` to GitHub and verify the remote commit.
8. Do not merge to `main`/`master`.
9. Do not deploy to Netlify or change production. The owner will test and deploy later.

Final response must include:

- Exact root cause(s) found for the cover-only display.
- Files changed and what each fix does.
- Per-provider real-book test results and limitations.
- Screenshots showing the actual book body/pages beyond the cover.
- All test/build/diagnostic outcomes, including failures.
- Git branch URL and commit hash.
- Any remaining provider/API restriction that cannot legally or technically be fixed.

**Definition of done: a user can open a supported book and actually read its body or navigate its real pages inside BlueLeaf Books. Seeing a cover image alone is a failed test.**
