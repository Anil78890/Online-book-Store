import type { Book, BookSource, ReadingCapability } from '../../types/book';
import { getAdapter, getAllAdapters } from './adapters/registry';
import { GENRE_TAXONOMY, getGenreById, getGenreQueryForProvider } from './genres';
export { getBookContent, stripGutenbergBoilerplate, extractChapters } from './content';
export { clearBookApiCache } from './http';
export { GENRE_TAXONOMY, getGenreById };

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === 'AbortError';

const normalizeTitle = (title: string): string =>
  title.toLowerCase().replace(/[^a-z0-9]/g, '');

const getBookDedupeKey = (book: Book): string => {
  const normTitle = normalizeTitle(book.title);
  const primaryAuthor = book.authors[0]?.name ? normalizeTitle(book.authors[0].name) : '';
  return `${normTitle}::${primaryAuthor}`;
};

const CAPABILITY_WEIGHT: Record<ReadingCapability, number> = {
  FULL_TEXT: 6,
  OFFICIAL_EMBED: 5,
  EXTERNAL_READER: 4,
  PREVIEW: 3,
  BORROW_REQUIRED: 2,
  METADATA_ONLY: 1,
  UNAVAILABLE: 0,
};

const getCapabilityWeight = (book: Book): number => {
  if (book.readingCapability) {
    return CAPABILITY_WEIGHT[book.readingCapability] ?? 0;
  }
  return book.availability === 'full-text' ? CAPABILITY_WEIGHT.FULL_TEXT : CAPABILITY_WEIGHT.METADATA_ONLY;
};

/**
 * Deduplicate books:
 * 1. By source:id
 * 2. Cross-provider by title + author: prefer highest reading capability (FULL_TEXT > OFFICIAL_EMBED > EXTERNAL_READER > BORROW_REQUIRED > METADATA_ONLY).
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
      const existingWeight = getCapabilityWeight(existing);
      const currentWeight = getCapabilityWeight(book);

      if (currentWeight > existingWeight) {
        byWork.set(workKey, book);
      }
    }
  }

  return Array.from(byWork.values());
};

type PartialBooksHandler = (books: Book[]) => void;

/**
 * Return each provider's results as soon as they arrive instead of waiting for the
 * slowest provider. A provider failure does not discard results from healthy sources.
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

/**
 * Search books across all supported legitimate providers.
 */
export const searchBooks = async (
  query: string,
  signal?: AbortSignal,
  onPartial?: PartialBooksHandler,
): Promise<Book[]> => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const adapters = getAllAdapters();
  const tasks = adapters.map(adapter =>
    adapter.search(trimmedQuery, { signal, limit: 12 }),
  );

  return settleBooks(tasks, signal, onPartial);
};

/**
 * Popular reader favourites from public domain collections.
 */
export const getPopularBooks = async (
  signal?: AbortSignal,
  onPartial?: PartialBooksHandler,
): Promise<Book[]> => {
  const adapters = getAllAdapters();
  const tasks = adapters.map(adapter => {
    if (adapter.browseSubject) {
      return adapter.browseSubject('classic_literature', { signal, limit: 10 });
    }
    return adapter.search('classics', { signal, limit: 8 });
  });

  return settleBooks(tasks, signal, onPartial);
};

/**
 * Browse books by genre across providers with provider-specific mapped vocabulary.
 */
export const getBooksByCategory = async (
  categoryId: string,
  signal?: AbortSignal,
  onPartial?: PartialBooksHandler,
): Promise<Book[]> => {
  const adapters = getAllAdapters();
  const tasks = adapters.map(adapter => {
    const providerQuery = getGenreQueryForProvider(categoryId, adapter.source);
    if (adapter.browseSubject) {
      return adapter.browseSubject(providerQuery, { signal, limit: 10 });
    }
    return adapter.search(providerQuery, { signal, limit: 8 });
  });

  return settleBooks(tasks, signal, onPartial);
};

/**
 * Fetch a single book from its native provider adapter.
 */
export const getBookById = async (source: BookSource, id: string, signal?: AbortSignal): Promise<Book> => {
  const adapter = getAdapter(source);
  return adapter.getBook(id, signal);
};

export const getBookPath = (book: Book): string => `/book/${book.source}/${encodeURIComponent(book.id)}`;

export const getBookCover = (book: Book): string =>
  book.formats.image || `https://placehold.co/320x480/e0f2fe/1e3a8a?text=${encodeURIComponent('No Cover')}`;

export const getBookAuthors = (book: Book): string =>
  book.authors.length > 0 ? book.authors.map(author => author.name).join(', ') : 'Unknown Author';

export const getAvailabilityLabel = (book: Book): string => {
  switch (book.readingCapability) {
    case 'FULL_TEXT':
      return 'Free to read';
    case 'OFFICIAL_EMBED':
      return 'Official reader';
    case 'PREVIEW':
      return 'Preview available';
    case 'BORROW_REQUIRED':
      return 'Borrow on Open Library';
    case 'EXTERNAL_READER':
      return 'Official reader';
    case 'METADATA_ONLY':
      return 'Bibliographic record';
    case 'UNAVAILABLE':
      return 'Text unavailable';
    default:
      return book.availability === 'full-text' ? 'Free to read' : 'Bibliographic record';
  }
};

export const getActionButtonLabel = (book: Book): string => {
  switch (book.readingCapability) {
    case 'FULL_TEXT':
    case 'OFFICIAL_EMBED':
    case 'EXTERNAL_READER':
      return 'Read';
    case 'PREVIEW':
      return 'Preview';
    case 'BORROW_REQUIRED':
      return 'Borrow';
    case 'METADATA_ONLY':
    case 'UNAVAILABLE':
    default:
      return 'Details';
  }
};
