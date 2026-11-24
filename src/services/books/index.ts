import type { Book, BookSource, GutendexBook, OpenLibrarySearchDoc, OpenLibrarySubjectWork } from '../../types/book';
import {
  fetchGutendexBook,
  fetchGutendexCategory,
  fetchGutendexPopular,
  fetchGutendexSearch,
} from './gutendex';
import {
  fetchOpenLibrarySearch,
  fetchOpenLibrarySubject,
  fetchOpenLibraryWork,
} from './openLibrary';
import {
  normalizeGutendexBook,
  normalizeOpenLibrarySearchDoc,
  normalizeOpenLibrarySubjectWork,
  normalizeOpenLibraryWork,
} from './normalize';
export { getBookContent, stripGutenbergBoilerplate } from './content';
export { clearBookApiCache } from './http';

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const normalizeTitle = (title: string): string =>
  title.toLowerCase().replace(/[^a-z0-9]/g, '');

const getBookDedupeKey = (book: Book): string => {
  const normTitle = normalizeTitle(book.title);
  const primaryAuthor = book.authors[0]?.name ? normalizeTitle(book.authors[0].name) : '';
  return `${normTitle}::${primaryAuthor}`;
};

/**
 * Deduplicate books:
 * 1. By source:id
 * 2. Cross-provider by title + author: prefer full-text Gutendex over metadata-only Open Library.
 */
export const uniqueBooks = (books: Book[]): Book[] => {
  const seenIds = new Set<string>();
  const byWork = new Map<string, Book>();

  for (const book of books) {
    const idKey = `${book.source}:${book.id}`;
    if (seenIds.has(idKey)) continue;
    seenIds.add(idKey);

    const workKey = getBookDedupeKey(book);
    const existing = byWork.get(workKey);

    if (!existing) {
      byWork.set(workKey, book);
    } else {
      // If existing is metadata-only but new one is full-text, upgrade to full-text
      if (existing.availability !== 'full-text' && book.availability === 'full-text') {
        byWork.set(workKey, book);
      }
    }
  }

  return Array.from(byWork.values());
};

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getGutendexBooks = (value: unknown): GutendexBook[] =>
  asArray<unknown>(value).filter(
    (item): item is GutendexBook =>
      isRecord(item) && typeof item.id === 'number' && Number.isFinite(item.id),
  );

const getOpenLibraryDocs = (value: unknown): OpenLibrarySearchDoc[] =>
  asArray<unknown>(value).filter(
    (item): item is OpenLibrarySearchDoc =>
      isRecord(item) && typeof item.key === 'string' && typeof item.title === 'string',
  );

const getOpenLibraryWorks = (value: unknown): OpenLibrarySubjectWork[] =>
  asArray<unknown>(value).filter(
    (item): item is OpenLibrarySubjectWork =>
      isRecord(item) && typeof item.key === 'string' && typeof item.title === 'string',
  );

type PartialBooksHandler = (books: Book[]) => void;

/**
 * Return each provider's results as soon as they arrive instead of waiting for the
 * slowest provider. A provider failure does not discard results from the other one.
 */
export const settleBooks = async (
  tasks: Array<Promise<Book[]>>,
  signal?: AbortSignal,
  onPartial?: PartialBooksHandler,
): Promise<Book[]> => {
  const collected: Book[][] = [];
  const errors: unknown[] = [];
  let successfulSources = 0;

  await Promise.all(
    tasks.map(async task => {
      try {
        const books = await task;
        successfulSources += 1;
        collected.push(books);
        onPartial?.(uniqueBooks(collected.flat()));
      } catch (error) {
        if (isAbortError(error)) {
          errors.push(error);
          return;
        }
        errors.push(error);
        console.warn('Book source unavailable:', error);
      }
    }),
  );

  if (signal?.aborted) throw new DOMException('Request aborted', 'AbortError');
  if (successfulSources === 0 && errors.length > 0) {
    throw errors[0] instanceof Error ? errors[0] : new Error('All book sources are unavailable.');
  }

  return uniqueBooks(collected.flat());
};

export const searchBooks = async (
  query: string,
  signal?: AbortSignal,
  onPartial?: PartialBooksHandler,
): Promise<Book[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  return settleBooks(
    [
      fetchGutendexSearch(trimmedQuery, signal).then(data =>
        getGutendexBooks(data.results).map(normalizeGutendexBook),
      ),
      fetchOpenLibrarySearch(trimmedQuery, signal).then(data =>
        getOpenLibraryDocs(data.docs)
          .map(normalizeOpenLibrarySearchDoc)
          .filter((book): book is Book => Boolean(book)),
      ),
    ],
    signal,
    onPartial,
  );
};

export const getPopularBooks = async (
  signal?: AbortSignal,
  onPartial?: PartialBooksHandler,
): Promise<Book[]> =>
  settleBooks(
    [
      fetchGutendexPopular(signal).then(data =>
        getGutendexBooks(data.results)
          .slice(0, 16)
          .map(normalizeGutendexBook),
      ),
      fetchOpenLibrarySubject('classic_literature', signal).then(data =>
        getOpenLibraryWorks(data.works)
          .slice(0, 8)
          .map(normalizeOpenLibrarySubjectWork)
          .filter((book): book is Book => Boolean(book)),
      ),
    ],
    signal,
    onPartial,
  );

export const getBooksByCategory = async (
  category: string,
  signal?: AbortSignal,
  onPartial?: PartialBooksHandler,
): Promise<Book[]> => {
  const normalizedCategory = category.trim() || 'fiction';

  return settleBooks(
    [
      fetchGutendexCategory(normalizedCategory, signal).then(data =>
        getGutendexBooks(data.results).map(normalizeGutendexBook),
      ),
      fetchOpenLibrarySubject(normalizedCategory.replace(/\s+/g, '_'), signal).then(data =>
        getOpenLibraryWorks(data.works)
          .map(normalizeOpenLibrarySubjectWork)
          .filter((book): book is Book => Boolean(book)),
      ),
    ],
    signal,
    onPartial,
  );
};

export const getBookById = async (source: BookSource, id: string, signal?: AbortSignal): Promise<Book> => {
  if (source === 'gutendex') {
    return normalizeGutendexBook(await fetchGutendexBook(id, signal));
  }

  return normalizeOpenLibraryWork(await fetchOpenLibraryWork(id, signal), id);
};

export const getBookPath = (book: Book): string => `/book/${book.source}/${encodeURIComponent(book.id)}`;

export const getBookCover = (book: Book): string =>
  book.formats.image || `https://placehold.co/320x480/e0f2fe/1e3a8a?text=${encodeURIComponent('No Cover')}`;

export const getBookAuthors = (book: Book): string =>
  book.authors.length > 0 ? book.authors.map(author => author.name).join(', ') : 'Unknown Author';

export const getAvailabilityLabel = (book: Book): string =>
  book.availability === 'full-text' ? 'Free to read' : 'Open metadata';
