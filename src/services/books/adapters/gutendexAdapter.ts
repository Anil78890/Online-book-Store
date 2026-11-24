import type { Book } from '../../../types/book';
import type { ProviderAdapter } from './types';
import {
  fetchGutendexBook,
  fetchGutendexCategory,
  fetchGutendexSearch,
} from '../gutendex';
import { normalizeGutendexBook } from '../normalize';

export const gutendexAdapter: ProviderAdapter = {
  source: 'gutendex',
  displayName: 'Project Gutenberg',

  async search(query: string, options): Promise<Book[]> {
    const res = await fetchGutendexSearch(query, options?.signal);
    const results = Array.isArray(res.results) ? res.results : [];
    return results.slice(0, options?.limit ?? 16).map(b => {
      const book = normalizeGutendexBook(b);
      book.sourceAttribution = 'Project Gutenberg (public domain collections)';
      book.rights = {
        licenseName: 'Project Gutenberg License / Public Domain',
        licenseUrl: 'https://www.gutenberg.org/policy/license.html',
        publicDomainStatus: 'verified',
        attributionText: 'Distributed freely by Project Gutenberg.',
      };
      return book;
    });
  },

  async browseSubject(subject: string, options): Promise<Book[]> {
    const res = await fetchGutendexCategory(subject, options?.signal);
    const results = Array.isArray(res.results) ? res.results : [];
    return results.slice(0, options?.limit ?? 16).map(b => {
      const book = normalizeGutendexBook(b);
      book.sourceAttribution = 'Project Gutenberg';
      book.rights = {
        licenseName: 'Project Gutenberg License / Public Domain',
        licenseUrl: 'https://www.gutenberg.org/policy/license.html',
        publicDomainStatus: 'verified',
        attributionText: 'Distributed freely by Project Gutenberg.',
      };
      return book;
    });
  },

  async getBook(id: string, signal?: AbortSignal): Promise<Book> {
    const raw = await fetchGutendexBook(id, signal);
    const book = normalizeGutendexBook(raw);
    book.sourceAttribution = 'Project Gutenberg';
    book.rights = {
      licenseName: 'Project Gutenberg License / Public Domain',
      licenseUrl: 'https://www.gutenberg.org/policy/license.html',
      publicDomainStatus: 'verified',
      attributionText: 'Distributed freely by Project Gutenberg.',
    };
    return book;
  },
};
