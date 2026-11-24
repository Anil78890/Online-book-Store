# BlueLeaf Books — Full Repository Audit, Reliability Fixes & Final Polish

**Target coding model:** Google Gemini 3.8 Flash (or a coding agent with full repository access)  
**Project:** BlueLeaf Books  
**Live deployment:** https://blueleaf-books.netlify.app/  
**Mode:** Inspect the existing finished project, identify worthwhile extra work, implement the highest-value safe improvements, and verify them.  
**Important product constraint:** Do not rebuild the app from scratch. Preserve its identity and working features. Do not use a card-based catalogue UI.

---

## Your role

Act as a senior full-stack engineer, API reliability engineer, performance specialist, accessibility reviewer, security reviewer, and product-minded UI engineer.

I have downloaded the complete repository. The application already exists and is deployed. I do **not** want another generic redesign or a new application. I want you to inspect the entire repository, determine whether additional engineering work is genuinely needed, and make the best justified improvements in this working copy.

Work independently. Do not stop after giving recommendations. After the initial audit, implement the highest-value safe fixes in this pass. Do not ask me to approve routine, low-risk changes. Do not perform destructive changes, publish to production, push to GitHub, rotate credentials, or modify external accounts.

## 0. SECURITY PREFLIGHT — DO THIS BEFORE SHARING OR RUNNING THE REPOSITORY

The repository snapshot I supplied contains a local `.codex/config.toml` with what appears to be an API credential in plaintext, and a `.claude/settings.local.json` containing machine-specific tool permissions and local paths.

1. **Never print, quote, copy, log, commit, or include any secret value in a report.** Refer to the file and line only, with the value redacted.
2. Treat the exposed credential as compromised. Tell the owner to revoke/rotate it through the provider before using the repository in any shared or cloud coding environment. Do not attempt to rotate it yourself.
3. Exclude local agent configuration and machine-specific files from any source bundle or Git commit: `.codex/`, `.claude/settings.local.json`, local proxy/JAR binaries, local MCP configuration, and local machine paths. Keep only project configuration that is genuinely required to build the website.
4. Inspect for other secrets in `.env*`, config files, source maps, build output, Git-tracked files, and repository history if available. Do not echo secret values. Do not assume `.env.example` contains a real secret; inspect it safely.
5. Check and improve `.gitignore` so local secrets, `node_modules`, `dist`, coverage, local agent configuration, `*.tsbuildinfo`, logs, and large local binaries are excluded. Preserve `.env.example` as a safe example file. If a secret file is already tracked, explain the required untracking and history-cleanup steps; do not rewrite Git history automatically.
6. Do not upload the unredacted repository to any external AI service until the credential and local configuration have been removed or safely excluded.

If the credential cannot be safely handled, stop any operation that would expose it and continue only with the clean application source.

---

## 1. Understand the existing repository before changing it

The supplied archive has a repository-level wrapper and the actual web application under the `project/` directory. Locate the real application root by finding its `package.json`; do not assume the archive root is the Vite app root.

The supplied snapshot indicates this existing stack:

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide icons
- Sonner toast notifications
- Netlify deployment configuration
- Gutendex for Project Gutenberg metadata
- Open Library for book metadata and covers
- IndexedDB for downloaded book text
- Browser local storage for the personal reading list and reader preferences
- Browser Speech Synthesis for text-to-speech

Confirm this against the current files before relying on it. Do not migrate frameworks or replace the stack without a clear, measured reason.

Important existing files/modules to inspect in full:

- `project/package.json`, `project/package-lock.json`, `project/netlify.toml`, `project/index.html`
- `project/src/App.tsx`, `project/src/main.tsx`, `project/src/index.css`
- `project/src/pages/Home.tsx`, `project/src/pages/Contact.tsx`, `project/src/pages/Privacy.tsx`, `project/src/pages/Sources.tsx`, `project/src/pages/Terms.tsx`
- `project/src/components/Header.tsx`, `HeroSection.tsx`, `FeaturedBooks.tsx`, `FeaturedFreeReads.tsx`, `TrendingCarousel.tsx`, `BookCard.tsx`, `SearchResults.tsx`, `BookPage.tsx`, `TTSControls.tsx`, `HighlightsPanel.tsx`, `SocialProof.tsx`, `EmailCapture.tsx`, `Footer.tsx`
- `project/src/services/books/gutendex.ts`, `openLibrary.ts`, `normalize.ts`, `content.ts`, `index.ts`
- `project/src/services/offlineStorage.ts`
- `project/src/hooks/useReadingList.ts`, `useReadingAnalytics.ts`, `useHighlights.ts`, `useDebouncedValue.ts`
- `project/src/types/book.ts`
- `project/public/` (especially the service worker, manifest, icons, robots and sitemap)
- all existing tests, CI files, deployment configuration and documentation

Do not rely solely on this list. Search the full source tree for fetch calls, API endpoints, timers, service-worker registration, local storage, IndexedDB, hard-coded copy, placeholder contact details, TODOs and duplicate components.

---

## 2. Product goals and non-negotiable constraints

BlueLeaf Books is a calm, user-friendly public-domain/open-book discovery and reading website. It should feel like a real, trustworthy reading product, not a demo dashboard.

### Preserve these product behaviours

- Search and browse books from Gutendex and Open Library.
- Show clearly which items have readable full text and which are metadata-only.
- Read supported books inside BlueLeaf Books; do not force users to an external reader.
- Save and remove books from the local reading library.
- Preserve the dedicated, reloadable book route.
- Preserve reader typography controls, theme options, text-to-speech, highlights/notes, reading progress and local-only reading analytics where they genuinely work.
- Preserve IndexedDB offline text caching and the installable/offline PWA behaviour where it is configured correctly.
- Keep the source/data information and appropriate attribution. A unified reader does not mean hiding legally required attribution or misrepresenting book rights.
- Keep the site deployable on the existing Netlify setup.

### Do not add

- No shopping cart, payments, subscriptions, ads, or commerce features.
- No forced sign-up, account system, backend database, or user tracking.
- No AI summaries, chatbot, social network, or newsletter integration unless an actual working provider and clear product requirement already exist.
- No fake reviews, fabricated user numbers, fake ratings, made-up recommendations or invented book metadata.
- No unnecessary microservices, Kubernetes, Kafka, or new infrastructure for this static web app.
- No new heavy UI libraries if the existing stack can do the job.

### No card-based catalogue

The owner explicitly does not want card mode. Replace book tiles/cards, book-card grids and horizontal book carousels with clean, accessible, responsive **list rows**. Each row may include a small cover thumbnail, title, author, language/availability, a short source/subject detail and clear actions such as Read, Details or Save. It must not look like a collection of boxed cards. Do not merely remove shadows from the cards and keep the same card layout.

Keep the visual hierarchy attractive: a strong but calm hero, readable headings, generous whitespace, clear search, subtle blue/green identity, warm reading surface, and a simple catalogue. Respect reduced-motion preferences and avoid animation that delays interaction.

---

## 3. Initial findings from the supplied snapshot — verify before changing

These are code-review observations from the provided repository snapshot, not a claim that every issue is still present in the latest working copy. Re-open each file and confirm the current state first.

### A. Homepage request volume

`Home.tsx` mounts `FeaturedBooks`, `TrendingCarousel`, and `FeaturedFreeReads`. In the snapshot, these independently call `getPopularBooks()` and `getBooksByCategory()` for different collections. Each service call can query both Gutendex and Open Library. This can create several initial API calls even before a visitor searches.

**Review and improve:**

- Avoid loading every below-the-fold shelf immediately.
- Load only the content needed for the first viewport, then lazy-load secondary shelves when they approach the viewport or when the visitor asks to browse them.
- Deduplicate identical in-flight requests and cache safe catalogue responses for a short TTL.
- Avoid refetching the same categories on navigation or component remount.
- Keep the homepage useful if one provider is slow or unavailable.

### B. Search waits for both sources

`src/services/books/index.ts` uses `Promise.allSettled()` in `settleBooks()`. This gives graceful partial failure, but it waits for every provider to settle before returning any combined list. A slow provider can delay results from a healthy provider.

**Review and improve:**

- Make results available progressively or return the first healthy source promptly while allowing the second source to update the list later.
- Preserve deduplication and source labels.
- Do not let a failed Open Library request hide successful Gutendex results, or vice versa.
- Ensure stale queries are aborted and cannot overwrite newer results.
- Keep the search box responsive, keyboard accessible and debounced. Enter and the Search button must work. Keep the query shareable in the URL.

### C. API parsing is only statically typed in the snapshot

The `fetchJson<T>()` helpers in `gutendex.ts` and `openLibrary.ts` parse JSON and cast it to `T`. TypeScript generics do not validate remote JSON at runtime.

**Review and improve:**

- Check HTTP status, content type where useful, empty body, malformed JSON, unexpected HTML/error pages, and missing/wrong-shaped fields.
- Add runtime guards for the fields the app actually consumes. Use a small, maintainable validation approach; do not add a large validation library unless there is a clear benefit.
- Normalize missing/nullable fields safely.
- Do not crash if `authors`, `formats`, `subjects`, `languages`, `results`, or `docs` are absent or malformed.
- Do not invent IDs, covers, authors, descriptions, ratings or publication information.
- Return useful typed errors and preserve partial results.

### D. Network timeouts need a full-body deadline

In the snapshot, `fetchWithTimeout()` in `content.ts` clears its timeout after `fetch()` resolves with response headers. `fetchPlainText()` then calls `response.text()` after that timeout has been cleared. A slow or stalled response body may therefore take longer than the intended request timeout.

**Review and improve:**

- Ensure the timeout remains active through response-body consumption and validation, not just until headers arrive.
- Forward caller cancellation reliably.
- Use a bounded total deadline for the full content-fetch operation, not an unbounded sequence of per-proxy waits.
- Cancel or release response bodies when a response is rejected.
- Do not convert a caller-initiated cancellation into an ordinary timeout/retry.

### E. Book text fallback chain may be slow and fragile

The snapshot tries a same-origin Gutenberg proxy, direct fetch and multiple public CORS proxies across multiple candidate URLs. Serial fallback can become slow, and public proxy services are third-party dependencies that may fail, rate-limit, inject HTML errors or see the requested URL.

**Review and improve:**

- Keep the existing same-origin Netlify Gutenberg route as the primary path if it is verified to work.
- Validate that only approved Gutenberg hosts and safe GET paths can be requested; do not turn the endpoint into an open proxy.
- Prefer a first-party/Netlify-supported path over third-party CORS proxy services.
- Use public CORS proxies only as an explicitly bounded last resort, if they are still necessary and their privacy/reliability implications are explained.
- Bound the number of attempts and the total elapsed time.
- Detect HTML, proxy error pages, empty content, truncated text and invalid encoding before accepting a response.
- Avoid returning a metadata description as though it were the full text of a book. Clearly distinguish “full text unavailable” from a successful reader load.
- Match an Open Library work to a Gutenberg title carefully. Do not pick a different author's book solely because its title is similar.
- Cache valid full text in IndexedDB and read the cache before making a network request.
- Make offline cache failures non-fatal where possible, but do not pretend a book was cached when it was not.

### F. Book availability must be truthful

In the snapshot, `normalizeGutendexBook()` marks every Gutendex record as `full-text`. Verify that this is justified by the actual `formats` data and the available content pipeline.

**Review and improve:** mark a record as readable only when a supported, legal text format or verified text fallback is available. Open Library metadata records should remain metadata-only unless a genuinely authorised readable text source is found. Keep labels and actions accurate.

### G. Current catalogue components are card-based

The snapshot uses `BookCard` from `FeaturedBooks`, `TrendingCarousel`, `FeaturedFreeReads`, and `SearchResults` with grids and horizontal carousels.

**Change required:** create/reuse a compact `BookListItem` or equivalent and move all discovery/search results to list rows. Remove the card grids and horizontal card carousel from the book catalogue. Keep the layout responsive and accessible, with visible focus states and adequate tap targets.

### H. Local reading analytics need semantic correctness

In the snapshot, `useReadingAnalytics.ts` keys completion by `id` only, while the app has two book sources. It also increments a field named `pagesReadToday` using differences in scroll progress percentages. That can produce collisions and misleading statistics.

**Review and improve:**

- Use a composite key such as `source:id` for book identity.
- Do not label progress percentage points as actual pages read. Either compute a defensible reading metric or rename/rework the statistic so it is honest.
- Preserve existing local user data through a safe, backward-compatible migration or fallback.
- Keep analytics local-only and explain what is stored.

### I. Trust, contact and social proof need fact checking

In the snapshot, `SocialProof.tsx` contains named reader testimonials, while `Contact.tsx`, `Privacy.tsx` and `Footer.tsx` reference suggested `blueleafbooks.com` mailbox addresses and describe them as placeholders/recommended addresses. The supplied live deployment URL is the Netlify domain.

**Review and improve:**

- Do not present invented testimonials or fictional named readers as genuine. Remove them or replace them with factual product capabilities unless authentic, consented testimonials are present elsewhere in the repository.
- Do not show an email address as a working support contact unless the mailbox is configured and verified. Use a truthful contact method or clearly explain that email support is not currently configured.
- Verify whether `blueleafbooks.com` is configured and owned for this deployment before using it in canonical, Open Graph, Twitter, sitemap or contact details. If not verified, use the actual deployed domain consistently or leave the custom-domain change as a documented owner action.
- Do not imply a newsletter, analytics provider, account system or data collection exists when it does not.

### J. PWA and deployment must be tested, not assumed

The snapshot registers `/sw.js` in `src/main.tsx`, has a Netlify configuration and refers to IndexedDB offline reading. Inspect the actual `public/` assets and service-worker code.

**Review and improve:**

- Verify `/sw.js`, the manifest, app icons, offline fallback and update lifecycle actually exist and are served correctly.
- Avoid stale deployment caches that keep old JavaScript after a new Netlify release.
- Use appropriate cache strategies for static hashed assets versus API data and book text. Do not cache error responses as successful book data.
- Ensure service-worker registration fails silently without breaking normal online app usage, but surface useful diagnostics during development.
- Verify SPA deep links such as `/book/gutendex/123` work after refresh on Netlify.
- Review Netlify proxy redirects and CSP/security headers together; avoid breaking legitimate provider requests or allowing unnecessary origins.

---

## 4. What to implement in this pass

After confirming the current code, make a risk-ranked plan and implement the following if the repository confirms they are needed.

### Priority 0 — Security and data integrity

1. Remove secrets and local agent configuration from any distributable or Git-tracked project set; improve `.gitignore` safely.
2. Ensure no API key or private credential is present in frontend source, `dist`, source maps, logs, docs or client-visible environment variables.
3. Validate provider responses before normalisation.
4. Ensure a metadata-only title is never labelled or presented as a verified full-text book.
5. Ensure the Gutenberg proxy cannot fetch arbitrary hosts or act as an open proxy.
6. Remove fake testimonials and unverified contact claims.

### Priority 1 — Reliability and speed

1. Implement request timeouts that cover both response headers and response-body parsing.
2. Support cancellation and stale-request protection everywhere network requests are triggered.
3. Add a small in-memory request cache with a sensible TTL and in-flight deduplication for repeated catalogue requests. Do not store user data in a shared cache.
4. Return or display partial search results as soon as a provider succeeds; do not wait indefinitely for the slower provider.
5. Lazy-load below-the-fold homepage shelves and avoid redundant first-load calls.
6. Use a bounded, observable book-text retrieval pipeline with a total deadline, cache-first behaviour and accurate error states.
7. Add controlled retries only for transient network errors and rate limits. Do not retry ordinary 4xx errors blindly. Use small backoff and cap attempts.
8. Make the app useful when one data provider is down.
9. Ensure a bad provider response cannot crash the whole page.

### Priority 2 — Product finish and usability

1. Replace book-card grids and horizontal card carousels with clean list-style book rows throughout home, search and category browsing.
2. Improve the hero/search entry point so a first-time visitor immediately understands how to search and read.
3. Add accessible keyboard behaviour and clear loading, partial-results, empty, error, retry and offline states.
4. Add or improve search suggestions only if they use real API results and do not create excessive requests. Suggestions must be keyboard accessible and dismissible.
5. Keep book-cover thumbnails optional and small in list rows; provide a tasteful deterministic fallback when there is no cover.
6. Improve typography, contrast, responsive layout, touch targets and reduced-motion handling.
7. Do not add decorative interactions that delay search, navigation or reading.

### Priority 3 — Documentation and release readiness

1. Update README with actual setup, scripts, architecture, providers, legal/accessibility notes, offline behaviour and deployment instructions.
2. Add `REPOSITORY_AUDIT_REPORT.md` with findings, severity, file evidence and decisions.
3. Add `IMPLEMENTATION_SUMMARY.md` with files changed, features fixed, validation results and remaining owner actions.
4. If there is no test framework, add a small focused test setup only if it is proportionate. Prioritise tests for API parsing/normalisation, availability logic, URL allowlisting, request timeout/cancellation and search partial-failure behaviour. Do not add a heavy test stack solely for appearance.

---

## 5. Specific API and asynchronous behaviour requirements

For Gutendex and Open Library:

- Use the existing official public endpoints already present in the code unless you verify a documented replacement.
- Build URLs with `URL` and `URLSearchParams` where practical; encode search terms correctly.
- Validate HTTP status and response shape.
- Handle malformed JSON, HTML error bodies, missing properties, empty arrays, rate limits, network errors and cancellation.
- Keep provider-specific failures separate from total search failure.
- Normalize results into the existing canonical `Book` type, or make a deliberate, documented improvement to it.
- Deduplicate duplicate provider records carefully. Do not discard a verified full-text record in favour of metadata-only data.
- Do not invent values for absent fields.
- Respect source pagination where the UI offers pagination or “load more”.
- Avoid uncontrolled fan-out. Use a bounded concurrency strategy if multiple requests are needed.

For asynchronous UI:

- Debounce typing without making the UI feel unresponsive.
- Abort obsolete search requests.
- Prevent older responses from overwriting newer results.
- Display the successful provider's results even if the other provider fails.
- Keep the current results visible during a refresh where appropriate, with a subtle updating indicator.
- Do not reset the entire page to a blocking spinner for every minor interaction.
- Cache metadata results briefly; revalidate when appropriate.

For book-text fetching:

- Cache-first in IndexedDB.
- Use only verified, approved Gutenberg URL patterns and the existing same-origin route if confirmed.
- Keep the request deadline active through `response.text()` and validation.
- Cap total attempts and total elapsed time.
- Validate text payloads before saving.
- Strip Gutenberg boilerplate only when the expected markers are found; preserve legitimate book content otherwise.
- Avoid truncating a large book without clearly documenting the limit. If limits are required, make them safe and explicit.
- Never return a proxy HTML page as a book.
- Show a clear retry option and honest unavailable/offline message.

---

## 6. UX acceptance criteria

A normal visitor should be able to:

1. Open the homepage and understand immediately that BlueLeaf Books helps them discover and read public-domain/open-access books.
2. Search by title, author or subject using keyboard or touch.
3. See results quickly without waiting for an unhealthy provider to time out.
4. Understand whether a result has full text or is metadata-only.
5. Browse categories without a wall of cards or horizontally scrolling card shelves.
6. Open a valid book detail/reader URL directly, including after a page refresh.
7. Read a supported book in-app with typography and theme controls.
8. Use text-to-speech when the browser supports it, with graceful unsupported-browser behaviour.
9. Save a book and find it again in the personal library.
10. Reopen already downloaded content offline, with a clear message if it was never cached.
11. Use the website on mobile, tablet and desktop.
12. Navigate the site with a keyboard and screen reader basics.

The design should feel welcoming to readers with different levels of technical ability. Use plain language, predictable controls and visible feedback. Do not require users to understand API providers, CORS, IndexedDB or technical implementation details.

---

## 7. Verification — no unsupported “done” claims

Use the package manager and scripts actually present in the repository. The supplied snapshot has an `npm` package lock and these scripts in `package.json`:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

Run them from the actual application root. If the lockfile or scripts have changed, follow the repository's current configuration instead.

Also verify, to the extent the available environment allows:

- malformed API JSON does not crash the app;
- Gutendex works when Open Library fails;
- Open Library works when Gutendex fails;
- cancellation does not show a false error;
- a slow response body is aborted by the full request timeout;
- retry count and total book-text load time are bounded;
- metadata-only books are not misrepresented as readable;
- duplicate/in-flight requests are deduplicated;
- cached book text opens without a network call;
- the reader shows an honest unavailable message for non-readable titles;
- no card-based book catalogue remains;
- service worker and Netlify deep routes function;
- no secrets appear in browser bundles or committed files.

If browser automation is available, run a smoke test at desktop and mobile viewports. If it is not available, explicitly state which behaviours were only code-reviewed and not browser-tested.

Do not claim performance improved by a specific percentage unless you measured before and after under comparable conditions. Record actual timings and test conditions if you benchmark.

---

## 8. Boundaries — do not do these automatically

- Do not deploy to Netlify or change production configuration in the user's account.
- Do not push commits to GitHub.
- Do not rewrite Git history.
- Do not rotate credentials; tell the owner what to rotate.
- Do not add a real newsletter, email service, auth provider, analytics SDK or database.
- Do not add paid APIs or create API keys.
- Do not download copyrighted book files from unauthorised sources.
- Do not fabricate social proof, reviews, ratings, author biographies or usage statistics.
- Do not delete existing features unless you confirm they are broken, redundant or violate the stated product direction. Explain significant removals.
- Do not replace the project with a new template or generate a second competing app.

---

## 9. Final output required from you

At the end, provide a concise but evidence-based report with:

1. **Repository health:** what is already good and should remain unchanged.
2. **Extra work assessment:** what genuinely needed improvement, what was optional, and what did not need to be added.
3. **Security:** affected local files, what must be rotated by the owner, what was excluded, and whether any secret remains in the distributable project. Never show secret values.
4. **Changes implemented:** exact files changed and why.
5. **API reliability:** how parsing, timeouts, cancellation, partial failure, caching and text retrieval now work.
6. **UX:** how the no-card list interface and normal reader journeys work.
7. **Verification:** exact commands run and actual pass/fail outputs. Identify anything not tested.
8. **Deployment instructions:** exact build and Netlify steps, but do not deploy automatically.
9. **Remaining owner actions:** only actions that require the user's accounts, real contact details, domain ownership, secrets, or production approval.

Also write these two files into the repository:

- `REPOSITORY_AUDIT_REPORT.md`
- `IMPLEMENTATION_SUMMARY.md`

## Final instruction

Start by auditing the whole repository and protecting secrets. Then make the highest-value safe fixes in this pass. **Do not add work just to make the project larger.** The goal is a faster, more reliable, truthful, accessible and polished BlueLeaf Books—not a bigger codebase.
