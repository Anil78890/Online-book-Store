import type { Book, BookSource } from '../../../types/book';

export interface ProviderAdapter {
  readonly source: BookSource;
  readonly displayName: string;
  search(query: string, options?: { signal?: AbortSignal; limit?: number }): Promise<Book[]>;
  browseSubject?(subject: string, options?: { signal?: AbortSignal; limit?: number }): Promise<Book[]>;
  getBook(id: string, signal?: AbortSignal): Promise<Book>;
  getReadingContent?(book: Book, signal?: AbortSignal): Promise<string>;
}
