import type { Book, Chapter } from '../../types/book';
import { getBookOffline, saveBookOffline } from '../offlineStorage';
import { fetchGutendexSearch } from './gutendex';
import { normalizeGutendexBook } from './normalize';
import { wikisourceAdapter } from './adapters/wikisourceAdapter';

const TOTAL_RETRIEVAL_TIMEOUT_MS = 10_000;
const SAME_ORIGIN_TIMEOUT_MS = 7_000;
const MAX_TEXT_LENGTH = 1_500_000;
const MIN_VALID_TEXT_LENGTH = 150;

const GUTENBERG_HOSTS = new Set(['www.gutenberg.org', 'gutenberg.org']);
const SAME_ORIGIN_PROXY_PREFIX = '/api/gutenberg';

const SAFE_GUTENBERG_PATH_REGEX = /^\/(cache\/epub\/\d+\/pg\d+(\.txt|\.txt\.utf-8)?|ebooks\/\d+\.txt\.utf-8|files\/\d+\/.*\.txt)$/i;

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

export const toSameOriginProxyUrl = (rawUrl: string): string | null => {
  try {
    const parsed = new URL(rawUrl);
    if (!GUTENBERG_HOSTS.has(parsed.hostname)) return null;
    if (!SAFE_GUTENBERG_PATH_REGEX.test(parsed.pathname)) {
      if (!parsed.pathname.endsWith('.txt') && !parsed.pathname.endsWith('.txt.utf-8')) {
        return null;
      }
    }
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
 * Extracts structured chapters from plain text with headings and offsets.
 * Preserves reading order and builds a fallback chunked structure for long unformatted texts.
 */
export const extractChapters = (text: string): Chapter[] => {
  if (!text || text.length < 500) {
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    return [{ id: 'ch-1', title: 'Complete Text', startIndex: 0, endIndex: text.length, wordCount: words }];
  }

  // Regex pattern matching chapter headings on their own line
  const chapterPattern = /(?:^|\r?\n)\s*((?:(?:CHAPTER|Chapter|BOOK|Book|PART|Part|ACT|Act|SCENE|Scene|SECTION|Section|PROLOGUE|Prologue|EPILOGUE|Epilogue)\b[^\r\n]*)|(?:[IVXLCDM]{1,8}\.[^\r\n]*))\s*(?=\r?\n|$)/g;

  const matches: Array<{ title: string; index: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = chapterPattern.exec(text)) !== null) {
    const rawHeading = match[1]?.trim();
    if (rawHeading && rawHeading.length <= 90) {
      if (!/project gutenberg|license|trademark|warranty/i.test(rawHeading)) {
        const offsetInMatch = match[0].indexOf(rawHeading);
        matches.push({
          title: rawHeading.replace(/\s+/g, ' '),
          index: match.index + (offsetInMatch >= 0 ? offsetInMatch : 0),
        });
      }
    }
  }

  // Filter out clustered items (e.g., Table of Contents list near the beginning)
  const validChapters: Array<{ title: string; index: number }> = [];
  for (let i = 0; i < matches.length; i++) {
    const curr = matches[i];
    const next = matches[i + 1];
    if (next && (next.index - curr.index < 80)) {
      continue;
    }
    validChapters.push(curr);
  }

  // If we found at least 2 distinct chapter markers
  if (validChapters.length >= 2) {
    const chapters: Chapter[] = [];
    for (let i = 0; i < validChapters.length; i++) {
      const start = validChapters[i].index;
      const end = i + 1 < validChapters.length ? validChapters[i + 1].index : text.length;
      const chapterText = text.slice(start, end);
      const wordCount = chapterText.split(/\s+/).filter(Boolean).length;

      chapters.push({
        id: `ch-${i + 1}`,
        title: validChapters[i].title,
        startIndex: start,
        endIndex: end,
        wordCount,
      });
    }

    if (validChapters[0].index > 600) {
      const introText = text.slice(0, validChapters[0].index);
      const wordCount = introText.split(/\s+/).filter(Boolean).length;
      chapters.unshift({
        id: 'ch-intro',
        title: 'Introduction / Opening',
        startIndex: 0,
        endIndex: validChapters[0].index,
        wordCount,
      });
    }

    return chapters;
  }

  // Fallback chunking: For books without explicit chapter labels, split into readable sections (~2500 words)
  const words = text.split(/(\s+)/);
  const CHUNK_WORDS = 2500;
  const chapters: Chapter[] = [];
  let currentChunkWords = 0;
  let currentStartIndex = 0;
  let currentLength = 0;
  let sectionIndex = 1;

  for (let i = 0; i < words.length; i++) {
    const token = words[i];
    currentLength += token.length;
    if (token.trim()) currentChunkWords++;

    if (currentChunkWords >= CHUNK_WORDS || i === words.length - 1) {
      const endIndex = currentStartIndex + currentLength;
      chapters.push({
        id: `sec-${sectionIndex}`,
        title: `Section ${sectionIndex}`,
        startIndex: currentStartIndex,
        endIndex,
        wordCount: currentChunkWords,
      });
      sectionIndex++;
      currentStartIndex = endIndex;
      currentLength = 0;
      currentChunkWords = 0;
    }
  }

  return chapters.length > 0
    ? chapters
    : [{ id: 'ch-full', title: 'Complete Text', startIndex: 0, endIndex: text.length, wordCount: words.length }];
};

/**
 * Fetch plain text with proper encoding handling (ISO-8859-1 vs UTF-8) and bounded deadline.
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

    const buffer = await response.arrayBuffer();
    let text: string;
    if (contentType.includes('iso-8859-1') || contentType.includes('latin1')) {
      text = new TextDecoder('iso-8859-1').decode(buffer);
    } else {
      try {
        text = new TextDecoder('utf-8', { fatal: true }).decode(buffer);
      } catch {
        text = new TextDecoder('iso-8859-1').decode(buffer);
      }
    }

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

const getCandidateTextUrls = (book: Book): string[] => {
  const candidates: string[] = [];
  const listed = book.formats.plainText ? forceHttps(book.formats.plainText) : null;
  if (listed) candidates.push(listed);

  const defaultPg = `https://www.gutenberg.org/cache/epub/${encodeURIComponent(book.id)}/pg${encodeURIComponent(book.id)}.txt`;
  if (!candidates.includes(defaultPg)) candidates.push(defaultPg);

  return candidates;
};

const downloadGutenbergText = async (book: Book, signal?: AbortSignal): Promise<string> => {
  const candidates = getCandidateTextUrls(book);
  const sameOriginUrls = candidates
    .map(toSameOriginProxyUrl)
    .filter((url): url is string => Boolean(url));

  // 1. Try secure same-origin Netlify proxy first
  for (const proxyUrl of sameOriginUrls) {
    try {
      return await fetchPlainText(proxyUrl, signal, SAME_ORIGIN_TIMEOUT_MS);
    } catch {
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    }
  }

  // 2. Direct Gutenberg fetch if in an environment with direct access
  for (const directUrl of candidates) {
    try {
      return await fetchPlainText(directUrl, signal, SAME_ORIGIN_TIMEOUT_MS);
    } catch {
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    }
  }

  throw new Error('Project Gutenberg text could not be loaded via authorized routes.');
};

const normalizeSearchToken = (s: string): string =>
  s.toLowerCase().replace(/[^a-z0-9]/g, '');

export const findGutenbergTwin = async (book: Book, signal?: AbortSignal): Promise<Book | null> => {
  const author = book.authors[0]?.name ?? '';
  const query = `${book.title} ${author}`.trim();
  if (!query) return null;

  try {
    const response = await fetchGutendexSearch(query, signal);
    const candidates = (Array.isArray(response.results) ? response.results : [])
      .map(normalizeGutendexBook)
      .filter(b => b.readingCapability === 'FULL_TEXT');

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
    return null;
  }
};

/**
 * Download text from Internet Archive direct OCR djvu.txt endpoint.
 */
const downloadInternetArchiveText = async (iaId: string, signal?: AbortSignal): Promise<string> => {
  const directUrl = `https://archive.org/stream/${encodeURIComponent(iaId)}/${encodeURIComponent(iaId)}_djvu.txt`;
  return fetchPlainText(directUrl, signal, SAME_ORIGIN_TIMEOUT_MS);
};

/**
 * Retrieve verified book content with caching and bounded deadlines.
 */
export const getBookContent = async (book: Book, signal?: AbortSignal): Promise<string> => {
  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');

  const overallController = new AbortController();
  const overallTimeout = setTimeout(() => overallController.abort(), TOTAL_RETRIEVAL_TIMEOUT_MS);
  const onSignalAbort = () => overallController.abort();
  signal?.addEventListener('abort', onSignalAbort, { once: true });

  try {
    // 1. Check local IndexedDB offline cache first
    try {
      const cached = await getBookOffline(book.id, book.source);
      if (cached && isUsableText(cached)) return cached;
    } catch {
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    }

    if (overallController.signal.aborted) {
      if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
      throw new Error('Loading book text timed out.');
    }

    let text = '';

    // 2. Provider-specific content extraction
    if (book.source === 'wikisource') {
      text = await wikisourceAdapter.getReadingContent?.(book, overallController.signal) ?? '';
    } else if (book.source === 'internetarchive') {
      const iaId = book.iaId || book.id;
      try {
        const rawIa = await downloadInternetArchiveText(iaId, overallController.signal);
        if (isUsableText(rawIa)) text = rawIa.trim();
      } catch {
        throw new Error('FULL_TEXT_UNAVAILABLE');
      }
    } else if (book.source === 'gutendex') {
      const raw = await downloadGutenbergText(book, overallController.signal);
      text = stripGutenbergBoilerplate(raw);
    } else if (book.source === 'openlibrary') {
      if (book.iaId && (book.readingCapability === 'FULL_TEXT' || book.ebookAccess === 'public')) {
        try {
          const rawIa = await downloadInternetArchiveText(book.iaId, overallController.signal);
          if (isUsableText(rawIa)) text = rawIa.trim();
        } catch {
          // IA direct text unavailable, fall through to Gutenberg twin search
        }
      }

      if (!text) {
        const twin = await findGutenbergTwin(book, overallController.signal);
        if (twin) {
          const raw = await downloadGutenbergText(twin, overallController.signal);
          text = stripGutenbergBoilerplate(raw);
        }
      }

      if (!text) {
        throw new Error('FULL_TEXT_UNAVAILABLE');
      }
    } else if (book.source === 'standardebooks') {
      const twin = await findGutenbergTwin(book, overallController.signal);
      if (twin) {
        const raw = await downloadGutenbergText(twin, overallController.signal);
        text = stripGutenbergBoilerplate(raw);
      } else {
        throw new Error('FULL_TEXT_UNAVAILABLE');
      }
    }

    const trimmedText = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) : text;

    // 3. Cache in IndexedDB for fast offline reading
    try {
      await saveBookOffline(book.id, book.source, trimmedText);
    } catch {
      // offline cache failure non-fatal
    }

    return trimmedText;
  } catch (err) {
    if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
    if (err instanceof Error && err.message === 'FULL_TEXT_UNAVAILABLE') throw err;
    if (overallController.signal.aborted && !signal?.aborted) {
      throw new Error('Retrieving book content timed out. Please check your connection.');
    }
    throw err;
  } finally {
    clearTimeout(overallTimeout);
    signal?.removeEventListener('abort', onSignalAbort);
  }
};
