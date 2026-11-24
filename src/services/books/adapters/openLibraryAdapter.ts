import type { Book } from '../../../types/book';
import type { ProviderAdapter } from './types';
import {
  fetchOpenLibrarySearch,
  fetchOpenLibrarySubject,
  fetchOpenLibraryWork,
} from '../openLibrary';
import {
  normalizeOpenLibrarySearchDoc,
  normalizeOpenLibrarySubjectWork,
  normalizeOpenLibraryWork,
} from '../normalize';

export const openLibraryAdapter: ProviderAdapter = {
  source: 'openlibrary',
  displayName: 'Open Library',

  async search(query: string, options): Promise<Book[]> {
    const res = await fetchOpenLibrarySearch(query, options?.signal);
    const docs = Array.isArray(res.docs) ? res.docs : [];
    return docs
      .slice(0, options?.limit ?? 12)
      .map(normalizeOpenLibrarySearchDoc)
      .filter((b): b is Book => Boolean(b))
      .map(book => {
        book.sourceAttribution = 'Open Library (Internet Archive)';
        book.rights = {
          licenseName: book.readingCapability === 'FULL_TEXT' ? 'Public Domain / Free Access' : 'Controlled Digital Lending',
          attributionText: 'Open Library open bibliographic catalogue.',
        };
        return book;
      });
  },

  async browseSubject(subject: string, options): Promise<Book[]> {
    const res = await fetchOpenLibrarySubject(subject, options?.signal);
    const works = Array.isArray(res.works) ? res.works : [];
    return works
      .slice(0, options?.limit ?? 12)
      .map(normalizeOpenLibrarySubjectWork)
      .filter((b): b is Book => Boolean(b))
      .map(book => {
        book.sourceAttribution = 'Open Library';
        book.rights = {
          licenseName: 'Open Library Catalogue',
          attributionText: 'Open Library, an initiative of the Internet Archive.',
        };
        return book;
      });
  },

  async getBook(id: string, signal?: AbortSignal): Promise<Book> {
    const raw = await fetchOpenLibraryWork(id, signal);
    const book = normalizeOpenLibraryWork(raw, id);
    book.sourceAttribution = 'Open Library';
    book.rights = {
      licenseName: 'Open Library Catalogue',
      attributionText: 'Open Library, an initiative of the Internet Archive.',
    };
    return book;
  },
};
