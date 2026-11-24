import type { Book } from '../../types/book';
import { getBookOffline, saveBookOffline } from '../offlineStorage';
import { fetchGutendexSearch } from './gutendex';
import { normalizeGutendexBook } from './normalize';

const TOTAL_RETRIEVAL_TIMEOUT_MS = 9_000;
const SAME_ORIGIN_TIMEOUT_MS = 6_000;
const FALLBACK_TIMEOUT_MS = 3_500;
const MAX_TEXT_LENGTH = 1_200_000;
const MIN_VALID_TEXT_LENGTH = 400;

const GUTENBERG_HOSTS = new Set(['www.gutenberg.org', 'gutenberg.org']);
const SAME_ORIGIN_PROXY_PREFIX = '/api/gutenberg';

// Safe Gutenberg path pattern: only allow cache/epub, ebooks, or files text routes
const SAFE_GUTENBERG_PATH_REGEX = /^\/(cache\/epub\/\d+\/pg\d+(\.txt|\.txt\.utf-8)?|ebooks\/\d+\.txt\.utf-8|files\/\d+\/.*\.txt)$/i;

// Last-resort public CORS proxies
const PUBLIC_PROXIES: Array<(url: string) => string> = [
  url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
];

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export const toSameOriginProxyUrl = (rawUrl: string): string | null => {
  try {
    const parsed = new URL(rawUrl);
    if (!GUTENBERG_HOSTS.has(parsed.hostname)) return null;
    // Check safe paths to avoid acting as an open proxy
    if (!SAFE_GUTENBERG_PATH_REGEX.test(parsed.pathname)) {
      // If not strictly matching regex, verify at least that it's a txt endpoint
      if (!parsed.pathname.endsWith('.txt') && !parsed.pathname.endsWith('.txt.utf-8')) {
        return null;
      }
    }
    // Prevent path traversal
    if (parsed.pathname.includes('..')) return null;

    return `${SAME_ORIGIN_PROXY_PREFIX}${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
};

const forceHttps = (rawUrl: string): string => rawUrl.replace(/^http:\/\//i, 'https://');

const looksLikeHtml = (text: string): boolean => {
  const head = text.slice(0, 400).trim().toLowerCase();
  return head.startsWith('<!doctype html') || head.startsWith('<html') || head.startsWith('<?xml');
};

const isUsableText = (text: string): boolean => {
  const trimmed = text.trim();
  if (trimmed.length < MIN_VALID_TEXT_LENGTH || looksLikeHtml(trimmed)) return false;
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) return false;
  if (/^(rate limit|access denied|not found|bad gateway|error 404)/i.test(trimmed)) return false;
  return true;
};

export const stripGutenbergBoilerplate = (text: string): string => {
  let result = text;
  const start = /\*\*\*\s*START OF TH(?:E|IS) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i.exec(result);
  if (start) result = result.slice(start.index + start[0].length);
  const end = /\*\*\*\s*END OF TH(?:E|IS) PROJECT GUTENBERG EBOOK/i.exec(result);
  if (end) result = result.slice(0, end.index);
  return result.trim();
};

/**
 * Fetch plain text with a deadline that covers headers AND body parsing.
 */
const fetchPlainText = async (
  url: string,
  signal?: AbortSignal,
  timeoutMs = SAME_ORIGIN_TIMEOUT_MS,
): Promise<string> => {
  const controller = new AbortController();
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'text/plain, text/*;q=0.9' },
      credentials: 'omit',
    });

    if (!response.ok) throw new Error(`Text source returned HTTP ${response.status}.`);
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    const text = await response.text();

    if (contentType.includes('text/html') || !isUsableText(text)) {
      throw new Error('The source did not return readable book text.');
    }

    return text;
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    if (timedOut) throw new Error('Book text request timed out.');
    throw error;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', forwardAbort);
  }
};

/** Resolves on the first valid provider response and cancels the remaining attempts. */
const fetchFirstValid = async (
  urls: string[],
  signal: AbortSignal | undefined,
  timeoutMs: number,
): Promise<string> => {
  if (urls.length === 0) throw new Error('No supported book text source was found.');
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  const controller = new AbortController();
  const forwardAbort = () => controller.abort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    return await new Promise<string>((resolve, reject) => {
      let remaining = urls.length;
      const failures: unknown[] = [];

      urls.forEach(url => {
        void fetchPlainText(url, controller.signal, timeoutMs)
          .then(resolve)
          .catch(error => {
            failures.push(error);
            remaining -= 1;
            if (remaining === 0) reject(failures[0] ?? new Error('No text source succeeded.'));
          });
      });
    });
  } catch {
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    throw new Error('The book text source is temporarily unavailable.');
  } finally {
    controller.abort();
    signal?.removeEventListener('abort', forwardAbort);
  }
};

const getCandidateTextUrls = (book: Book): string[] => {
  const candidates = [`https://www.gutenberg.org/cache/epub/${encodeURIComponent(book.id)}/pg${encodeURIComponent(book.id)}.txt`];
  const listed = book.formats.plainText ? forceHttps(book.formats.plainText) : null;
  if (listed && !candidates.includes(listed)) candidates.push(listed);
  return candidates;
};

const downloadGutenbergText = async (book: Book, signal?: AbortSignal): Promise<string> => {
  const candidates = getCandidateTextUrls(book);
  const sameOriginUrls = candidates
    .map(toSameOriginProxyUrl)
    .filter((url): url is string => Boolean(url));

  try {
    return await fetchFirstValid(sameOriginUrls, signal, SAME_ORIGIN_TIMEOUT_MS);
  } catch (sameOriginError) {
    if (signal?.aborted || isAbortError(sameOriginError)) throw sameOriginError;
  }

  // Fallback to CORS proxies in parallel if Netlify proxy is unavailable
  const fallbackUrls = candidates.flatMap(sourceUrl => PUBLIC_PROXIES.map(build => build(sourceUrl)));
  return fetchFirstValid(fallbackUrls, signal, FALLBACK_TIMEOUT_MS);
};

const normalizeSearchToken = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Safely search for a Project Gutenberg full-text twin by checking BOTH title and author.
 */
export const findGutenbergTwin = async (book: Book, signal?: AbortSignal): Promise<Book | null> => {
  const author = book.authors[0]?.name ?? '';
  const query = `${book.title} ${author}`.trim();
  if (!query) return null;

  try {
    const response = await fetchGutendexSearch(query, signal);
    const candidates = (Array.isArray(response.results) ? response.results : [])
      .map(normalizeGutendexBook)
      .filter(b => b.availability === 'full-text');

    const cleanTitle = normalizeSearchToken(book.title);
    if (!cleanTitle) return null;

    const authorTokens = author
      .toLowerCase()
      .split(/[\s,]+/)
      .filter(token => token.length > 2);

    for (const candidate of candidates) {
      const candidateTitle = normalizeSearchToken(candidate.title);
      const titleMatches =
        candidateTitle === cleanTitle ||
        candidateTitle.startsWith(cleanTitle) ||
        cleanTitle.startsWith(candidateTitle);

      if (titleMatches) {
        if (authorTokens.length === 0) return candidate;
        const candidateAuthors = candidate.authors.map(a => a.name.toLowerCase()).join(' ');
        const authorMatches = authorTokens.some(token => candidateAuthors.includes(token));
        if (authorMatches) return candidate;
      }
    }
    return null;
  } catch (error) {
    if (signal?.aborted || isAbortError(error)) throw new DOMException('Request aborted', 'AbortError');
    console.warn('No Gutenberg match for this record:', error);
    return null;
  }
};

/**
 * IndexedDB cache → same-origin Netlify proxy → parallel short-timeout fallback gateways.
 * Bounded by a total deadline to prevent hanging.
 */
export const getBookContent = async (book: Book, signal?: AbortSignal): Promise<string> => {
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  // Overall bounded deadline
  const overallController = new AbortController();
  const overallTimeout = setTimeout(() => overallController.abort(), TOTAL_RETRIEVAL_TIMEOUT_MS);
  const onSignalAbort = () => overallController.abort();
  signal?.addEventListener('abort', onSignalAbort, { once: true });

  try {
    // 1. Check local IndexedDB offline cache first
    try {
      const cached = await getBookOffline(book.id, book.source);
      if (cached && isUsableText(cached)) return cached;
    } catch (error) {
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
      console.warn('Failed to read from offline cache:', error);
    }

    if (overallController.signal.aborted) {
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
      throw new Error('Loading book text timed out.');
    }

    // 2. Resolve text source
    let textSource: Book | null = book;
    if (book.source !== 'gutendex') {
      textSource = await findGutenbergTwin(book, overallController.signal);
      if (!textSource) {
        throw new Error('FULL_TEXT_UNAVAILABLE');
      }
    }

    // 3. Download text from verified Gutenberg endpoints
    const raw = await downloadGutenbergText(textSource, overallController.signal);
    const cleaned = stripGutenbergBoilerplate(raw);
    const text = cleaned.length > MAX_TEXT_LENGTH ? cleaned.slice(0, MAX_TEXT_LENGTH) : cleaned;

    // 4. Cache valid full text in IndexedDB
    try {
      await saveBookOffline(book.id, book.source, text);
    } catch (error) {
      console.warn('Failed to save book text offline:', error);
    }

    return text;
  } catch (err) {
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    if (err instanceof Error && err.message === 'FULL_TEXT_UNAVAILABLE') {
      throw err;
    }
    if (overallController.signal.aborted && !signal?.aborted) {
      throw new Error('Retrieving book content timed out. Please check your connection.');
    }
    throw err;
  } finally {
    clearTimeout(overallTimeout);
    signal?.removeEventListener('abort', onSignalAbort);
  }
};
