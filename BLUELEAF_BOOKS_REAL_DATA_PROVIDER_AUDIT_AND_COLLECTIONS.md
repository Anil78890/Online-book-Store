# BlueLeaf Books — Real-Data Provider Audit, Reading Fixes & Genre Collections

**Project:** BlueLeaf Books  
**Live site:** https://blueleaf-books.netlify.app/  
**Working branch:** `blueleaf-final-polish`  
**Previously reported commits:** `95781d6` and `fefdc61`  
**Deployment rule:** Do not deploy to Netlify or alter production. Finish the Git branch, push it to GitHub, and stop so the owner can test it first.

---

## 0. Your assignment

Act as the senior full-stack engineer, API integration engineer, digital-library researcher, QA engineer, and accessibility reviewer responsible for completing BlueLeaf Books.

The product's main purpose is **to let a person discover books from legitimate free/open collections and read the content inside BlueLeaf Books whenever the provider genuinely allows it**. A catalogue full of titles that only show metadata, empty reader pages, broken links, or unnecessary redirects does not satisfy the product goal.

You must inspect the latest Git branch, run the application, inspect real network responses, reproduce the failures, identify root causes, implement fixes, and verify the result with both automated tests and real provider data.

Do not merely write recommendations. Work directly in the existing repository and implement the safe, useful changes.

Do not rebuild the app from scratch, replace the design system, or add speculative features. Preserve the existing React + TypeScript + Vite architecture and the current reader features unless a demonstrated technical reason requires a change.

### Non-negotiable safety and workflow rules

1. Never ask the owner for a Netlify, GitHub, Google, or API-account password, personal access token, session cookie, or private key.
2. Never put credentials or secret API keys in browser code, Git commits, logs, screenshots, reports, or `.env.example`.
3. If authentication is needed, ask the owner to complete the official browser OAuth flow on their own machine.
4. Do not deploy, publish, or change the live Netlify site. Do not run `netlify deploy --prod`.
5. Do not merge `blueleaf-final-polish` into `main` or `master`.
6. Do not overwrite or discard uncommitted work. Inspect `git status` first.
7. Never bypass paywalls, DRM, library lending limits, geo-restrictions, robots policies, provider rate limits, or copyright controls.
8. Never label a book “free to read” merely because its metadata or cover is available.
9. Never invent books, authors, genres, formats, download URLs, availability, licenses, ratings, or catalogue counts.
10. If a provider is unavailable or blocks automated access, record that accurately and use a permitted alternative. Do not disguise a failed source as a successful integration.

---

## 1. Start with the current GitHub branch, not an old ZIP

The previous handoff reported that work was committed locally to `blueleaf-final-polish`, including commits `95781d6` and `fefdc61`. A previous report did not conclusively prove the branch had been pushed to GitHub.

Run these commands (or their equivalent in your Git interface):

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git branch -avv
git log --oneline --decorate -12
```

Then:

- Confirm the repository remote is the intended BlueLeaf Books repository.
- Confirm whether `blueleaf-final-polish` exists locally and/or remotely.
- If the branch exists remotely, check it out and update it with a fast-forward-only pull.
- If the branch only exists locally, retain it and continue from that branch.
- Verify that the previously reported commits are present in its history, if applicable.
- If the latest GitHub branch differs from the old downloaded archive, the latest branch is authoritative. Do not replace it with an older ZIP snapshot.
- Do not reset, force-push, rebase shared work, or delete branches.

At the end of this task, commit the verified changes to `blueleaf-final-polish`, push that branch to GitHub if authentication is already available, and verify the remote commit. If authentication is not available, stop and give the owner the exact safe browser-authentication steps. **Do not deploy to Netlify.**

---

## 2. Known findings from the earlier source snapshot — verify against the latest branch

The following observations came from the project ZIP previously supplied for inspection. The latest `blueleaf-final-polish` branch may already have fixed some of them. Verify each item in the current branch before changing it; do not duplicate completed work.

### 2.1 Only two catalogue sources were represented in the earlier model

The earlier `BookSource` type contained only `gutendex` and `openlibrary`. That limits the number and variety of legitimate collections available to users.

### 2.2 Open Library metadata was not the same as readable book content

The earlier Open Library normalisers created metadata records and assigned the Open Library work page to a field named `formats.html`, while marking the record `metadata-only`. The old content service then attempted to find a matching Gutenberg edition. If it found none, it returned a title/description-like fallback string rather than actual book text.

This explains an important failure mode: **an Open Library result is normally a catalogue record, not proof that the complete book can be read in BlueLeaf Books.** The current branch may have improved the unavailable-content UI; verify that real reading access is now resolved separately.

### 2.3 The earlier text loader mainly supported Gutenberg plain text

The inspected earlier `content.ts` retrieved Project Gutenberg plain text and did not implement general readers for EPUB, PDF, Internet Archive scanned books, Wikisource works, or OpenStax textbooks.

It also relied on third-party public CORS proxy gateways as fallbacks. Do not assume such public proxy services are reliable, private, or suitable for production. Audit and remove that dependency unless there is a documented, reviewed, provider-permitted reason to retain a specific gateway.

### 2.4 Genre coverage was narrow

The earlier category list had only six fixed categories: Fiction, Adventure, Science, History, Philosophy, and Romance. The new catalogue should support a much broader, data-backed genre/subject taxonomy and provider-specific subject mapping.

### 2.5 Previous verification was not enough to prove all provider integrations work

The previous report recorded 21 passing tests, TypeScript, ESLint, and a production build. It also stated that browser QA was based on CSS/layout review and that Playwright was not configured. Passing unit tests do not prove that live APIs, CORS, redirects, book-text downloads, EPUB/PDF rendering, or provider reading links work in a real browser.

### 2.6 Source transparency must be preserved

An earlier README stated that raw source URLs and provider attributions were concealed from readers. Do not hide the provider or the book's rights information. BlueLeaf Books must give appropriate source attribution, show the provider link, and explain the licence/access status of each work. A clean reading experience must not come at the cost of transparency.

---

## 3. Reproduce the real failures before modifying code

Start the application locally using its documented setup. Use the browser's actual Network panel and console, not only mocked tests.

For each provider and each test title:

1. Search a real title/author/subject.
2. Record the request URL and provider endpoint.
3. Record the HTTP status, redirect chain, content type, response time, and response size (do not record secrets or private headers).
4. Validate the response shape at runtime.
5. Check pagination and whether additional results exist.
6. Open a result and inspect its real access/format metadata.
7. Click the primary book action.
8. Confirm whether actual readable content appears inside BlueLeaf Books.
9. Check for a blank reader, metadata shown as text, CORS error, 403/404/429/5xx, HTML error page parsed as a book, incorrect encoding, blocked iframe, timeout, or wrong content identifier.
10. Try refresh, browser back/forward, a second book, and a mobile viewport.
11. Repeat with an item that is only metadata, one that is preview-only, and one that requires borrowing/login.

Produce `docs/LIVE_PROVIDER_DIAGNOSTIC.md` with:

- Test date/time and environment (browser, local build/preview, country/region if relevant).
- Provider name and exact endpoint pattern (never include tokens).
- HTTP result and measured latency for each real test.
- Actual result count and sample real provider identifiers.
- Which formats were present and which were genuinely readable.
- Whether browser CORS, CSP, Netlify redirects, provider robots rules, or rate limits affected it.
- Root cause of every reproduced failure.
- Code change made and the test that proves the fix.
- Any limitation that remains and its honest fallback behaviour.

Do not claim to have tested a live API if the environment could not reach it. In that case, record the network limitation and provide a repeatable manual test command for the owner.

Create a separate script such as `npm run diagnose:providers` for opt-in live API diagnostics. It must be rate-limited, read-only, safe to run, and must not be part of the normal production build. Keep ordinary unit tests deterministic and based on fixtures; keep live API tests separate because third-party services can be temporarily unavailable.

---

## 4. Build a provider adapter architecture

Do not scatter provider-specific API logic across React components. Create a provider registry/adapter pattern in the existing book service layer.

Each adapter should implement clearly typed methods where supported:

- `search(query, options, signal)`
- `browseSubject(subject, options, signal)`
- `getBook(identifier, signal)`
- `getAvailability(identifier, signal)`
- `getReadingSource(identifier, signal)`
- `getNextPage(cursor, signal)`

A provider may implement only the methods it actually supports. Do not invent methods or pretend every source can supply full text.

Use a stable, namespaced identifier such as `provider:recordId` internally. Keep work IDs, edition IDs, item IDs, ISBNs, Gutenberg IDs, Wikisource page IDs, and external URLs distinct. Never deduplicate different translations or materially different editions just because their titles match.

### Recommended normalised model

Extend the current `Book` model carefully. Consider fields such as:

```ts
type ReadingCapability =
  | 'FULL_TEXT'
  | 'PREVIEW'
  | 'BORROW_REQUIRED'
  | 'OFFICIAL_EMBED'
  | 'EXTERNAL_READER'
  | 'METADATA_ONLY'
  | 'UNAVAILABLE';

type ContentFormat = 'plain-text' | 'html' | 'epub' | 'pdf' | 'scanned-pages' | 'unknown';

interface RightsInfo {
  licenseName?: string;
  licenseUrl?: string;
  rightsStatement?: string;
  publicDomainStatus?: 'verified' | 'provider-claimed' | 'unknown' | 'not-public-domain';
  jurisdiction?: string;
  attributionText?: string;
}

interface ReadingSource {
  capability: ReadingCapability;
  format?: ContentFormat;
  contentUrl?: string;
  officialReaderUrl?: string;
  previewUrl?: string;
  downloadUrl?: string;
  rights?: RightsInfo;
  checkedAt?: string;
}
```

Adapt names and shape to the existing codebase rather than copy-pasting blindly. Keep metadata, format availability, content URL, and legal rights as separate concepts.

### Rules for classification

- A cover URL is not a reading format.
- A metadata/work page is not a book text URL.
- A search result is not proof of borrow/read availability.
- A provider's “free” label is not sufficient unless the underlying access terms are verified.
- An available EPUB/PDF is not automatically safe to redistribute or cache; verify the licence and provider terms.
- A book whose status cannot be confirmed must show `Unknown` or `Check provider`, not `Free to read`.
- Never return a fabricated “book text” string containing only title, author, or description.

---

## 5. Integrate legitimate free/open collections — test before shipping

Evaluate the following real sources. Add the ones that provide reliable value and have an appropriate permitted access model. Do not force every source into every book. Implement provider-specific adapters and preserve clear attributions.

### 5.1 Project Gutenberg via Gutendex and approved Gutenberg access methods

Useful for public-domain classics and literature, with a broad set of genres and languages.

- Gutendex is a community/self-hosted API that converts Project Gutenberg catalogue data into JSON; it is not an official Project Gutenberg API.
- Use its real search, topic, sort, pagination, and returned `formats` fields.
- Verify the actual `text/plain`, HTML, EPUB, Kindle, or other formats returned for each specific book.
- Do not manufacture a text URL from an ID if the provider did not return or document that URL pattern.
- Follow Project Gutenberg's current robot-access policy. It explicitly warns that the website is intended for human users and that automated access can lead to temporary or permanent blocking. Use the published robot harvest/catalogue mechanisms and mirroring instructions where appropriate; respect crawl pacing and provider policy.
- Check the book's copyright statement and jurisdiction. US public-domain status does not automatically prove public-domain status in every country.
- Do not use a generic public CORS proxy as a workaround for a provider access restriction.

Official references:

- Gutendex source: https://github.com/garethbjohnson/gutendex
- Gutendex API: https://gutendex.com/
- Project Gutenberg robot access: https://www.gutenberg.org/policy/robot_access.html
- Project Gutenberg policies: https://www.gutenberg.org/policy/

### 5.2 Internet Archive

A high-value source to evaluate for digitised books, public-domain works, and scanned-page reading.

- Use the official Advanced Search API for discovery and pagination.
- Use the official Metadata API (`https://archive.org/metadata/{identifier}`) to inspect actual files and access-related metadata.
- Determine whether an item offers a directly downloadable, permitted text/EPUB/PDF file or only a browser-based BookReader.
- For scanned books where in-app reading is allowed, evaluate the official Internet Archive BookReader integration/embedded reader. Do not try to turn restricted page images or lending-only books into downloadable full text.
- Respect borrow/login restrictions and any item-level rights statements. Do not bypass controlled digital lending, DRM, or access gates.
- If direct in-app content extraction is not permitted or technically appropriate, use the official BookReader experience within an allowed embedded/in-app view, or clearly offer the official reader link.

Official references:

- Search API: https://doc-tools.readthedocs.io/en/ia-test-gsod/item-search-apis.html
- Metadata API: https://doc-tools.readthedocs.io/en/ia-test-gsod/metadata.html
- Book services: https://doc-tools.readthedocs.io/en/ia-test-gsod/book-services.html
- BookReader documentation: https://openlibrary.org/dev/docs/bookreader
- BookReader source: https://github.com/internetarchive/bookreader

### 5.3 Wikisource via the MediaWiki Action API

Evaluate Wikisource as a full-text source for public-domain or appropriately licensed literary, historical, philosophical, religious, scientific, and other texts in supported languages.

- Use the official MediaWiki API, not HTML scraping.
- Resolve work pages, editions, chapter/page structures, and transcluded content correctly.
- Use the documented revisions/parse/content APIs to retrieve page content.
- Preserve headings, chapters, footnotes, links, and language where possible.
- Sanitize rendered HTML before placing provider content into the application.
- Check the specific page/project's licence and attribution requirements; do not assume every page on every Wikimedia project has identical rights.

Official references:

- Page content API: https://www.mediawiki.org/wiki/API:Get_the_contents_of_a_page
- Revisions API: https://www.mediawiki.org/wiki/API:Revisions
- API etiquette/rate limits: https://www.mediawiki.org/wiki/API:Etiquette

### 5.4 Standard Ebooks

Use this as a quality source for carefully formatted public-domain literature.

- Its public New Releases Atom feed is available to everyone.
- Do not assume the all-books OPDS feed, author feeds, or subject feeds are open to anonymous use: the provider says several feeds are a Patrons Circle benefit, with specific access exceptions.
- Start with the genuinely public new-releases feed and verify the official per-book download links and licence/rights information.
- Do not automate access to gated feeds or circumvent membership restrictions.

Official references:

- Feeds and access terms: https://standardebooks.org/feeds
- Public Atom new releases feed: https://standardebooks.org/feeds/atom/new-releases

### 5.5 Directory of Open Access Books (DOAB)

Evaluate this for scholarly, peer-reviewed open-access nonfiction across disciplines.

- Use the official REST API for metadata search and pagination.
- Inspect expanded metadata and bitstream/file information where available.
- Retrieve full text only where the individual book's licence and provider access explicitly permit it.
- Store licence URL, publisher, DOI/ISBN, and attribution details.
- Distinguish an indexed OA record from an actually downloadable/readable bitstream.

Official references:

- DOAB metadata and REST API: https://doabooks.org/en/librarians/doab-metadata
- REST API endpoint pattern: https://directory.doabooks.org/rest/search?query=...

### 5.6 OpenStax

Evaluate this as a source of real textbooks, particularly science, mathematics, business, economics, and computing-related education.

- OpenStax says its textbooks are available free online and as PDFs, but the general textbook licence is CC BY-NC-SA 4.0 (non-commercial, attribution, share-alike).
- Only integrate/reproduce OpenStax content if the planned use complies with the non-commercial restriction and all attribution/share-alike terms. If BlueLeaf Books will be commercial, do not redistribute or adapt OpenStax material without permission; an official link/reader link may be more appropriate.
- Use official book pages and download links. Do not invent a general public catalogue API if one is not documented.
- Where the official full text is accessible online and embedding/reuse is allowed, build a reliable in-app presentation; otherwise link to the official reader transparently.

Official references:

- OpenStax textbook collections: https://openstax.org/higher-education
- Licensing: https://help.openstax.org/s/article/Licensing-information-of-OpenStax-textbooks
- FAQ: https://openstax.org/faq

### 5.7 Google Books — discovery and permitted preview only

- Use the official Books API for metadata and access information.
- Inspect `accessInfo.viewability`, `accessInfo.embeddable`, country, EPUB/PDF availability, and `accessViewStatus` where returned.
- `PARTIAL` means a preview is available; `ALL_PAGES` may indicate a public-domain/full-view item for the indicated country; `NO_PAGES` is not readable. Access can vary by country.
- If an official embedded viewer is supported, use that viewer for the preview. Do not scrape or extract copyrighted preview pages or bypass the viewer/access restrictions.

Official references:

- Volume API reference: https://developers.google.com/books/docs/v1/reference/volumes
- Embedded Viewer API: https://developers.google.com/books/docs/viewer/developers_guide

### 5.8 Open Library — discovery, read/borrow status, not universal full text

- Use the Search API for user-driven book discovery and the Read API to check for online-readable or borrowable editions.
- The Open Library catalogue contains many metadata records for works it does not have available for reading.
- Do not infer full text from a work or edition record.
- Follow the usage guidelines: cache results, identify the application with an appropriate User-Agent/contact where possible, make useful human-driven requests, avoid bulk harvesting, and use the monthly data dumps only if the project genuinely needs bulk catalogue data and can handle the process properly.
- Respect borrow, login, waitlist, and lending status.

Official references:

- API and usage guidelines: https://openlibrary.org/developers/api
- Search API: https://openlibrary.org/dev/docs/api/search
- Read API: https://openlibrary.org/dev/docs/api/read
- BookReader: https://openlibrary.org/dev/docs/bookreader

---

## 6. Genre and subject collections: build broad, real, provider-mapped coverage

Expand beyond the old six-category navigation. Build a maintainable category registry with at least these areas where real provider data exists:

1. Literary fiction and classics
2. Romance
3. Mystery and detective fiction
4. Thriller and suspense
5. Adventure and travel narratives
6. Science fiction
7. Fantasy and folklore
8. Horror and gothic fiction
9. Poetry
10. Drama and plays
11. Children's and young readers' literature
12. Biography and autobiography
13. Memoir and letters
14. History and historical documents
15. Philosophy and ethics
16. Religion, mythology, and sacred texts (subject to source rights and accurate categorisation)
17. Science and nature
18. Mathematics and statistics
19. Computer science and technology
20. Business, management, and entrepreneurship
21. Economics and finance
22. Education and textbooks
23. Social sciences and sociology
24. Politics, civics, and law
25. Arts, music, and culture
26. Language, linguistics, and literature studies
27. Geography and anthropology
28. Health and medicine (only authoritative educational material; do not present as personal medical advice)
29. Agriculture and environment
30. Reference and encyclopaedic works

### Genre implementation requirements

- Create one central genre taxonomy, not hard-coded category arrays repeated throughout components.
- Map each public genre to the subject/topic vocabulary understood by each provider. For example, the same idea may be represented as `science_fiction`, `Science fiction`, `Fiction / Science fiction`, a Wikisource category, or a DOAB subject heading.
- A mapping must be verified against actual API responses; do not assume every provider uses the same slug.
- Support pagination/infinite “load more” for large collections. Do not fetch thousands of results at once.
- Display real provider totals only where the API actually returns reliable counts. Otherwise display “Browse results” or the number currently loaded; never invent counts.
- Deduplicate carefully. Do not merge distinct translations, editions, authors, or versions incorrectly.
- Add genre browsing pages/filters that work on mobile and desktop.
- Use compact, accessible, text-first/list-style book rows, not a wall of cards.
- Featured books should be horizontally scrollable as a **list of compact rows/items**, with previous/next buttons and touch scrolling. No large card grid, autoplay, or decorative carousel. Keep keyboard access and visible focus states.
- Curated/featured entries must come from real, verified provider results or an accurately labelled editorial list with traceable sources. Do not invent bestseller rankings, ratings, or social proof.

---

## 7. Make one reading experience that supports different real formats

The application must understand that different providers expose different kinds of readable content. Implement a safe reader routing layer.

### Supported render paths to evaluate

- **Plain text:** decode correctly, strip only provider boilerplate, preserve chapters/paragraphs/poetry, and stream or process large bodies without freezing the UI.
- **HTML:** sanitise untrusted external HTML with a well-maintained HTML sanitizer; remove scripts, unsafe event handlers, dangerous URLs, and unwanted embeds. Preserve semantic headings, links, tables, footnotes, and images only where safe.
- **EPUB:** evaluate a maintained EPUB renderer such as `epub.js`; verify licence/access, CORS, ZIP processing, chapter navigation, progress, and offline constraints. Do not add a large dependency without a tested reason.
- **PDF:** evaluate PDF.js or a maintained React wrapper for allowed public/open PDFs. Check range requests, worker configuration, mobile memory, page navigation, and offline limitations.
- **Scanned pages:** use the official Internet Archive BookReader or another provider-supported viewer when authorised. Do not attempt OCR or image scraping as a way around restrictions.
- **Google Books preview:** use the official Embedded Viewer if `embeddable` and `viewability` permit it. Keep its content within Google's preview terms.
- **Borrowed/controlled content:** show the official Borrow/Sign in/Read on provider action. Do not mirror, cache, download, or bypass the access model.
- **Metadata only:** show an honest book details page with a clear official source link; never render the description as if it were the book.

Keep source attribution and rights information visible in the reader, perhaps in a concise “Source & rights” disclosure. Each book's detail view should show provider, edition/identifier, access type, licence/rights statement where supplied, and a link to the official record.

### Reader quality checks

- A valid short text should not be rejected solely because it is under an arbitrary 400-character threshold.
- Detect HTML/JSON error bodies, rate-limit messages, wrong content IDs, and truncated responses.
- Decode UTF-8 and other declared encodings safely.
- Preserve language and text direction for multilingual works.
- Support chapter navigation, reading progress, bookmarks, notes, highlights, and offline reading only when the content licence/provider terms permit local caching.
- Keep content requests lazy: do not download a book while browsing or searching.
- Do not persist an item in offline storage if the provider or licence disallows caching.

---

## 8. Reliability and performance requirements

Inspect the current `http.ts`, `content.ts`, provider adapters, Netlify configuration, CSP, service worker, and offline storage. Then implement only the improvements supported by findings.

Requirements:

- Runtime validation (Zod or the existing validation approach) at every external JSON boundary.
- Provider-specific response parsing; never use unchecked TypeScript casts as runtime validation.
- In-flight request deduplication and sensible TTL caching.
- Bounded concurrency and provider-specific rate limits.
- Abort/cancellation that works for both headers and body consumption.
- Retry only transient failures (network errors, 408, 429, selected 5xx) with capped exponential backoff and jitter; do not repeatedly retry 400/401/403/404.
- Respect `Retry-After` when present.
- Progressive search results so a slow API does not block a fast provider.
- Pagination and stable cursors.
- Consistent loading, empty, partial-results, timeout, provider-offline, and unavailable-content states.
- No “loading…” forever states.
- Avoid unnecessary duplicate requests when multiple genre shelves render.
- Do not call every provider for every category on first homepage paint. Load only the initial featured data and fetch further collections when a user navigates/scrolls to them.
- Cache catalogue metadata separately from book content. Use longer TTLs for stable metadata and shorter TTLs for availability status.
- Avoid storing huge book bodies in localStorage. Continue using IndexedDB for permitted offline content.
- Lazy-load cover images, EPUB/PDF reader code, and provider viewer code.
- Keep the initial JS bundle small and measure bundle changes.
- Avoid public open CORS proxy dependencies. Prefer direct supported APIs, official embedded readers, or a tightly allowlisted first-party serverless proxy when necessary and legally permitted.

### Netlify/CSP review

The previous project had a Gutenberg rewrite and a restrictive Content Security Policy. If new providers or embedded readers are added:

- Review `netlify.toml` and every redirect rule.
- Keep SPA fallback rules below specific API/function routes.
- Add only the exact required provider domains to `connect-src`, `img-src`, `media-src`, and `frame-src` as appropriate.
- Do not solve integration failures by setting `connect-src *`, `frame-src *`, or disabling CSP.
- Keep `frame-ancestors 'none'` and `X-Frame-Options` protections unless a documented requirement says otherwise; understand that `frame-src` controls what the BlueLeaf page may embed.
- If a serverless function is necessary, ensure it is an allowlisted proxy with strict host/path validation, method restrictions, response-size limits, timeouts, credentials omitted, and no arbitrary URL forwarding.
- Do not put an API secret in a `VITE_` variable or frontend JavaScript bundle.
- Do not change the production Netlify site or deploy during this task.

---

## 9. UI/UX requirements retained from the owner

- The site should feel welcoming, calm, trustworthy, and easy for a first-time visitor.
- Keep the BlueLeaf Books blue/green visual identity.
- Preserve a text-first catalogue design.
- **No large card grids and no card-based catalogue.**
- Featured book items must be scrollable horizontally in a compact list-row treatment. Use accessible left/right controls plus touch scrolling; no auto-scroll or autoplay.
- Search must be prominent and work for title, author, keyword, and genre where providers support it.
- Show useful filters for language, genre/subject, source, publication year, and reading availability only where data is present.
- Clearly distinguish “Full text”, “Preview”, “Borrow”, “Official reader”, and “Metadata only”.
- Do not display fake ratings, fake reader testimonials, fake popularity, or invented download counts.
- On small screens, rows must remain readable and buttons must be comfortably tappable.

---

## 10. Test matrix: real books, real sources, real genres

Build a set of live canary checks and deterministic fixture tests. Do not rely only on mock tests.

### Minimum live provider matrix

For every provider that you integrate, test at least:

1. A real title that is verified as full-text accessible.
2. A real title that is preview-only or uses an official embedded reader.
3. A real record that is metadata-only, restricted, or requires borrowing/login.
4. A record with an unusual/long title, missing author, multiple authors, or non-English metadata.
5. A failure case (invalid identifier, 404, rate-limit response, or network timeout).

### Minimum genre matrix

Test real results for representative queries from at least these 15 categories:

- Fiction/classics
- Romance
- Mystery/detective
- Adventure
- Science fiction/fantasy
- Horror/gothic
- Poetry/drama
- Children's literature
- Biography/memoir
- History
- Philosophy/religion/mythology
- Science/nature
- Mathematics/statistics
- Computer science/technology
- Business/economics/education

The remaining taxonomy categories should be added where real provider coverage exists. Do not promise every genre has free full-text titles if the sources do not support that claim.

### End-to-end browser checks

Use Playwright or another real browser automation tool if practical. At minimum test:

- Homepage load without fatal console errors.
- Featured horizontal scrolling by mouse, touch simulation, and keyboard.
- Category click opens correct results.
- Search query returns real records and progressive partial results.
- Pagination/load more does not duplicate or lose records.
- Opening a full-text book displays actual content inside BlueLeaf Books.
- Opening a preview/borrow/metadata-only record displays the correct honest action.
- The reader does not display a metadata description as book text.
- Book content is not fetched until the user opens it.
- Reader preferences, bookmarks, highlights, notes, and progress remain intact.
- Offline reading works only for content that may legally be cached.
- Mobile widths around 375px and tablet widths around 768px.
- Hard refresh/deep link works for a book route.

### Quality gates

Run and report actual output for:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Add or update tests as appropriate. Keep live-provider diagnostics separate from deterministic CI tests. Do not claim a test passed unless the command actually completed successfully in the current working copy.

---

## 11. Documentation deliverables

Create or update these files:

### `docs/LIVE_PROVIDER_DIAGNOSTIC.md`

Actual endpoint probes, statuses, latency, response validation, real book examples, content availability, failures, root causes, fixes, and unverified items.

### `docs/PROVIDER_AND_LICENSE_MATRIX.md`

For each provider: discovery API, content/reader route, formats, licence/rights fields, attribution requirements, access restrictions, rate limits/robots rules, and whether content can be cached or rendered inside BlueLeaf Books.

### `docs/GENRE_COVERAGE.md`

List all supported genres, each provider's actual subject mapping, real result counts only where returned by the provider, and the coverage gaps. Record the test query and date.

### `docs/RELEASE_TEST_REPORT.md`

Automated tests, build results, browser E2E results, manual checks not completed, bundle measurements, and known limitations.

Update the root README so it describes only functionality that exists and has been verified. Keep source attribution and rights transparency in the README and application.

---

## 12. Definition of done

The work is complete only when all of the following are true:

- [ ] Current `blueleaf-final-polish` branch was inspected and no existing user work was overwritten.
- [ ] Real API responses were inspected for each integrated provider.
- [ ] Root causes of current provider/search/reader failures are documented.
- [ ] Open Library metadata is no longer mistaken for book content.
- [ ] Gutenberg retrieval follows the provider's current robot-access policy and uses actual returned/documented formats.
- [ ] At least two additional legitimate source integrations are implemented and tested if their live interfaces, access rights, and terms support it. Prefer Wikisource, Internet Archive/BookReader, DOAB, and Standard Ebooks' public new-release feed as appropriate. OpenStax is conditional on its non-commercial licence; Google Books is preview-only unless the API explicitly grants full view.
- [ ] At least 15 genre categories have working, provider-mapped browse/search paths with real data where available.
- [ ] Full-text, preview, borrow, official-reader, metadata-only, and unavailable states are accurately distinguished.
- [ ] Actual full text is shown in-app where permitted; restricted/preview content uses the provider's official reader/viewer.
- [ ] No public arbitrary CORS proxy is required for core book reading.
- [ ] Featured items are horizontally scrollable list rows, not cards/carousels.
- [ ] Source and licence attribution is visible and accurate.
- [ ] API performance, errors, cancellations, caching, and pagination are covered by tests.
- [ ] Typecheck, lint, unit tests, production build, and browser checks have actual recorded results.
- [ ] All changes are committed to `blueleaf-final-polish` and pushed to GitHub, or exact authentication blockers are documented.
- [ ] The remote branch URL and latest commit hash are provided.
- [ ] The live Netlify production site is unchanged; no production deploy was performed.

If an item cannot be completed due to provider restrictions, unavailable network access, missing credentials, or an upstream outage, do not fake completion. Explain the blocker, preserve the stable fallback, and tell the owner exactly what remains.

---

## 13. Final execution instruction

Start now by checking out and inspecting the latest `blueleaf-final-polish` branch. Run the existing application. Reproduce the real API and reading failures. Verify the provider documentation linked above because APIs and terms can change.

Then implement the highest-value fixes, add the new legitimate collections/providers that can be integrated responsibly, expand real genre browsing, and test the complete discovery-to-reading path.

Do not stop after producing an audit. Do not stop after writing a plan. Make the changes, run the tests, document what actually works, commit, push the feature branch, and stop before Netlify deployment.

**The product promise is simple: BlueLeaf Books should help people find real books across diverse legitimate collections and read genuinely accessible content in one clear, fast, trustworthy place.**
