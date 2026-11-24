# BlueLeaf Books — Final Engineering Execution, Verification & Safe Netlify Release

## Role

Act as a senior full-stack engineer, security reviewer, performance engineer, QA engineer, and release engineer. Work directly in the existing BlueLeaf Books repository supplied by the owner.

Live site: https://blueleaf-books.netlify.app/

The application is already built and deployed. This is a **final quality, reliability, and release pass** — not a greenfield rebuild.

## Non-negotiable security rule: never request or expose credentials

- **Do not ask the owner to send a Netlify password, GitHub password, API token, session cookie, SSH private key, recovery code, or any other secret in chat or in a prompt.**
- Do not put credentials in source code, Markdown, terminal output, logs, screenshots, commits, issue descriptions, or environment files that are tracked by Git.
- Do not print secret values when scanning files. Report only the filename, secret type, and recommended action; redact values completely.
- Never ask the owner to paste a `NETLIFY_AUTH_TOKEN` into the agent conversation.
- If Netlify authentication is needed, ask the owner to authenticate personally through Netlify's official browser-based OAuth flow on their own computer/terminal. The owner should run `netlify login` themselves and complete the browser authorization. The agent may then use the already-authenticated local Netlify CLI session without viewing or copying the token.
- Prefer Git-connected deployment and a Deploy Preview. Do not deploy to production without the owner's separate, explicit approval after they review the preview.
- If any credential is found in the repository or Git history, do not reproduce it. Identify the location, recommend immediate revocation/rotation with the issuing provider, and remove it from the working tree where appropriate. Removing a secret from the current file does not invalidate a token already exposed in history.

## Context from the previous repository assessment

The previous assessment reported the following changes and verification. Treat these as **claims to verify against the actual current checkout**, not as proof that the current working tree contains them:

- Catalogue card grids and carousels were replaced with accessible list rows.
- Search was made progressive across catalogue providers and duplicate results were reduced.
- HTTP requests gained in-flight deduplication, caching, timeout handling, and runtime response validation.
- Gutenberg text proxy requests gained host/path allowlisting and bounded deadlines.
- Book format availability was made truthful; unavailable full text should not be presented as readable content.
- Reading analytics use source-qualified identifiers and more defensible estimated-page calculations.
- Fictional reader testimonials were replaced by factual platform commitments.
- Four Vitest suites and 21 tests were reported as passing.
- TypeScript, ESLint, and the Vite production build were reported as passing.
- A plaintext API credential was reported in an earlier `.codex/config.toml` snapshot, with local machine settings in `.claude/settings.local.json`.

First inspect the current repository and Git history/status to determine what is already implemented. Do not redo working changes or assume the previous report is accurate without checking.

## Primary objective

Deliver the most reliable and polished version of the existing BlueLeaf Books application while preserving its current product identity and working features.

The finished site should:

1. Feel straightforward and welcoming to ordinary readers.
2. Make it easy to say hello/understand the service, search for a book, discover a title, open its details, and read or follow a legitimate source.
3. Respond quickly and progressively rather than making users wait for every provider.
4. Handle API failures, malformed responses, missing book text, timeouts, duplicate requests, and offline states gracefully.
5. Work well on mobile, tablet, and desktop.
6. Use **list-based catalogue results**. Do not reintroduce card grids, card carousels, or horizontal card shelves.
7. Remain deployable on the existing Netlify site.

## Phase 1 — Establish the actual state before editing

1. Inspect the full source tree, package scripts, dependencies, Vite configuration, Netlify configuration, routes, service worker, API clients, book normalisation, search, reader, offline storage, and existing tests.
2. Run `git status --short`, inspect the current branch and recent commit history, and review existing diffs before changing files.
3. Read the previous audit/report supplied with the project, then map each claimed change to the actual implementation.
4. Identify the real application entry points and data flows. Do not infer framework behaviour from filenames alone.
5. Produce a short private work checklist, then proceed with implementation without waiting for the owner unless a decision would affect production data, credentials, billing, or irreversible account settings.

## Phase 2 — Security and repository hygiene

1. Inspect tracked files for secrets, local agent configuration, private environment files, machine-specific paths, and accidental build artifacts.
2. Search safely: never echo the secret itself. Redact it in all output.
3. Ensure `.gitignore` excludes at least local agent settings such as `.codex/`, `.claude/`, `.mcp/`, `*.local.json`, `.env*.local`, build output such as `dist/`, coverage output, and TypeScript build metadata where appropriate.
4. Check whether any exposed key was committed previously. Do not claim that deleting a file from the latest commit removes it from Git history.
5. Report any exposed credential and tell the owner to revoke/rotate it at the issuing provider before release. Do not attempt to use it.
6. Keep public configuration public only when it is designed to be public. Keep private server-side credentials out of client bundles.

## Phase 3 — API parsing and reliability

Audit and improve the complete catalogue and book-content data path:

- Validate external JSON at runtime. Do not rely on TypeScript type assertions as runtime validation.
- Handle non-2xx HTTP responses, invalid JSON, empty bodies, unexpected content types, missing fields, nulls, and malformed arrays safely.
- Normalise provider records into one consistent internal book model.
- Validate book identifiers together with their provider/source to avoid cross-provider ID collisions.
- Distinguish clearly between full text available, metadata only, and unavailable content. Never label metadata as a full-text book.
- Keep request timeout/abort protection active through body reading/parsing, not only until response headers arrive.
- Deduplicate identical in-flight requests and ensure cancellation by one caller does not incorrectly cancel unrelated callers sharing the same request.
- Use sensible cache TTLs and ensure errors are not cached as successful empty results.
- Search providers concurrently and surface partial results as soon as a provider responds. A slow or failed provider must not block a successful provider indefinitely.
- Deduplicate cross-provider results carefully; preserve the best readable edition and avoid merging unrelated books with similar titles.
- Bound proxy and fallback attempts by a single total deadline. Use strict host and path allowlists for any same-origin proxy. Do not create an open proxy.
- Add useful, privacy-preserving error states and retry options. Do not expose internal stack traces or secrets to users.
- Avoid repeated homepage API bursts. Load secondary shelves only when needed/visible, and cancel obsolete searches when the query changes.

## Phase 4 — Reader journey and everyday usability

Review the complete journey from landing to reading:

1. A new visitor immediately understands what BlueLeaf Books offers.
2. The search field is prominent, keyboard accessible, labelled, and usable on mobile.
3. Search accepts normal human input, trims whitespace, handles case differences, and does not fire a network request for every keystroke without sensible debouncing/cancellation.
4. Results appear progressively, with clear loading, partial-results, no-results, offline, and error states.
5. Each result clearly identifies title, author, source, and whether it has readable full text or metadata only.
6. “Read” is offered only when readable text is actually available. Use “Details” or an honest external-source action otherwise.
7. Saving/bookmarking and offline library behaviour remain intact and provide clear feedback.
8. The reading view remains comfortable and accessible: font size, spacing, contrast/theme, keyboard navigation, and reading progress should work if already supported.
9. Do not add fake ratings, fake testimonials, fabricated counts, or claims that cannot be verified.
10. Do not scrape or redistribute copyrighted content without permission. Preserve source attribution and public-domain/license information where applicable.

Keep the visual language consistent with the existing BlueLeaf Books brand. Make changes that improve clarity and comfort, not design churn for its own sake. Maintain the no-card/no-carousel catalogue requirement.

## Phase 5 — Performance

Measure before optimising where practical. Check:

- Initial JavaScript/CSS bundle size and route-level code splitting.
- Initial render and first useful content.
- Duplicate API requests and homepage request bursts.
- Search debounce, stale-request cancellation, progressive results, and cache effectiveness.
- Book cover image dimensions, lazy loading, and fallback behaviour.
- Reader content loading and proxy fallback time.
- Service worker cache correctness and update behaviour.
- Memory leaks from event listeners, observers, timers, or pending requests.

Prefer targeted improvements over adding heavy dependencies. Do not introduce analytics/tracking SDKs or paid third-party APIs without explicit owner approval.

## Phase 6 — Accessibility and responsive QA

Check semantic HTML, heading order, labels, accessible names, focus visibility, keyboard operation, screen-reader feedback, reduced-motion preferences, contrast, and touch target sizes.

Inspect layouts at representative narrow mobile, tablet, laptop, and wide desktop widths. Ensure the list catalogue remains readable, actions do not overflow, and the reader is comfortable on small screens.

## Phase 7 — Automated tests and production build

Use the package manager and lockfile already present. Do not casually replace package managers or delete the lockfile.

Run the applicable commands, including:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
```

If a script is not defined, report that fact and use the appropriate existing equivalent; do not invent a passing result.

Add or improve tests for:

- Provider response validation and malformed JSON.
- Book normalisation and real full-text availability.
- Search progress when one provider is slow or fails.
- Cross-provider deduplication and source-qualified IDs.
- HTTP timeout, abort, in-flight deduplication, and cache behaviour.
- Gutenberg proxy host/path allowlisting and total deadline.
- Reader unavailable-content states and offline/save behaviour where testable.

If browser automation is available, run realistic smoke tests for homepage, search, result details, opening a readable book, saving a book, offline/error states, and hard-refreshing a deep link. If it is unavailable, state that visual/browser testing was not performed; do not claim it was.

Record actual command output, exit status, and unresolved issues. Do not claim tests passed unless they were run against the final working tree.

## Phase 8 — Netlify configuration and preview deployment

Inspect `netlify.toml`, package scripts, publish directory, redirects, headers, and SPA deep-link routing. The previous assessment expected:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Verify that these settings match the actual application. Check that the Gutenberg same-origin route is still safe and that deep links such as `/book/gutendex/1342` load correctly on refresh.

### Preferred release route: Git-connected Netlify

1. Keep the production branch untouched during implementation.
2. Create a clearly named feature branch, for example `blueleaf-final-polish`.
3. Commit only reviewed source changes. Never commit local configuration, secrets, `.netlify/state.json`, build output, or unrelated files.
4. If the repository is already connected to Netlify, push the feature branch and open a pull request so Netlify can create a Deploy Preview. Netlify's Git workflow supports preview deployments before production publication.
5. Give the owner the preview URL and deployment/build logs. Do not merge into the production branch.

### Alternative release route: Netlify CLI

Only when the owner has personally authenticated in the local environment with Netlify's browser OAuth flow and the directory is linked to the correct existing site:

1. Run the local build and tests first.
2. Run a **draft/preview** deployment using `netlify deploy` (not `netlify deploy --prod`).
3. Confirm the target site is the existing BlueLeaf Books project and not a newly created unrelated site.
4. Return the preview URL and wait for the owner to review it.

If authentication is unavailable, do not request a password or token. Finish all code, testing, and release preparation, then provide exact steps for the owner to connect the repository or authenticate locally.

### Production deployment rule

**Do not run `netlify deploy --prod`, merge to the production branch, change DNS, alter site ownership, change billing, or modify account security settings unless the owner explicitly approves that specific production action after reviewing the Deploy Preview.**

A successful local build is not proof that the live deployment works. After owner-approved release, verify the production URL, search, book details, reader, offline behaviour, and deep-link refresh, and report any failures honestly.

## Phase 9 — Final delivery report

At completion, provide:

1. Executive summary of what changed.
2. Files changed and why.
3. Features preserved.
4. Security findings and owner actions (never include secret values).
5. API/reliability improvements.
6. Performance evidence before/after where measurable; do not fabricate metrics.
7. Test commands and actual results.
8. Production build result.
9. Browser/device QA completed and not completed.
10. Git branch and commit identifiers.
11. Netlify preview URL, if successfully created.
12. Exact remaining steps for the owner.
13. Explicit statement whether production was changed. It should remain unchanged unless the owner approved it.

## Execution instruction

Now inspect the actual repository and carry out the highest-value safe improvements in this session. Avoid a long plan-only response. Preserve working code, make focused changes, run verification, and prepare a Deploy Preview. Ask the owner only when a required human action or explicit production approval is genuinely necessary. Never ask for account passwords or secrets.
