import { describe, it, expect } from 'vitest';
import { uniqueBooks, settleBooks } from '../src/services/books/index';
import type { Book } from '../src/types/book';

describe('uniqueBooks deduplication', () => {
  it('deduplicates identical books by source:id', () => {
    const book: Book = {
      id: '1342',
      title: 'Pride and Prejudice',
      authors: [{ name: 'Jane Austen' }],
      formats: {},
      languages: ['en'],
      downloadCount: 100,
      subjects: ['Fiction'],
      source: 'gutendex',
      sourceUrl: 'https://gutenberg.org/ebooks/1342',
      availability: 'full-text',
    };

    const result = uniqueBooks([book, { ...book }]);
    expect(result.length).toBe(1);
  });

  it('prefers full-text Gutendex record when both Gutendex and OpenLibrary return the same work', () => {
    const openLibBook: Book = {
      id: 'OL123W',
      title: 'Frankenstein',
      authors: [{ name: 'Mary Shelley' }],
      formats: {},
      languages: ['en'],
      downloadCount: 10,
      subjects: ['Gothic'],
      source: 'openlibrary',
      sourceUrl: 'https://openlibrary.org/works/OL123W',
      availability: 'metadata-only',
    };

    const gutendexBook: Book = {
      id: '84',
      title: 'Frankenstein',
      authors: [{ name: 'Mary Shelley' }],
      formats: { plainText: 'https://www.gutenberg.org/cache/epub/84/pg84.txt' },
      languages: ['en'],
      downloadCount: 500,
      subjects: ['Monsters', 'Science Fiction'],
      source: 'gutendex',
      sourceUrl: 'https://gutenberg.org/ebooks/84',
      availability: 'full-text',
    };

    // When Open Library comes first, then Gutenberg
    const result1 = uniqueBooks([openLibBook, gutendexBook]);
    expect(result1.length).toBe(1);
    expect(result1[0]?.source).toBe('gutendex');
    expect(result1[0]?.availability).toBe('full-text');

    // When Gutenberg comes first, then Open Library
    const result2 = uniqueBooks([gutendexBook, openLibBook]);
    expect(result2.length).toBe(1);
    expect(result2[0]?.source).toBe('gutendex');
    expect(result2[0]?.availability).toBe('full-text');
  });
});

describe('settleBooks partial failure and progressive results', () => {
  it('returns partial results progressively as first provider resolves', async () => {
    const partials: Book[][] = [];

    const fastBook: Book = {
      id: '1',
      title: 'Fast Book',
      authors: [{ name: 'Author One' }],
      formats: {},
      languages: ['en'],
      downloadCount: 10,
      subjects: [],
      source: 'gutendex',
      sourceUrl: '',
      availability: 'full-text',
    };

    const slowBook: Book = {
      id: '2',
      title: 'Slow Book',
      authors: [{ name: 'Author Two' }],
      formats: {},
      languages: ['en'],
      downloadCount: 20,
      subjects: [],
      source: 'openlibrary',
      sourceUrl: '',
      availability: 'metadata-only',
    };

    const task1 = new Promise<Book[]>(resolve => setTimeout(() => resolve([fastBook]), 10));
    const task2 = new Promise<Book[]>(resolve => setTimeout(() => resolve([slowBook]), 50));

    const finalResult = await settleBooks([task1, task2], undefined, partial => {
      partials.push([...partial]);
    });

    expect(finalResult.length).toBe(2);
    expect(partials.length).toBeGreaterThanOrEqual(1);
    expect(partials[0]?.length).toBe(1);
    expect(partials[0]?.[0]?.id).toBe('1');
  });

  it('survives failure of one provider and returns healthy provider results', async () => {
    const healthyBook: Book = {
      id: '10',
      title: 'Healthy Result',
      authors: [{ name: 'Healthy Author' }],
      formats: {},
      languages: ['en'],
      downloadCount: 100,
      subjects: [],
      source: 'gutendex',
      sourceUrl: '',
      availability: 'full-text',
    };

    const successfulTask = Promise.resolve([healthyBook]);
    const failingTask = Promise.reject(new Error('Open Library 503 Service Unavailable'));

    const result = await settleBooks([successfulTask, failingTask]);

    expect(result.length).toBe(1);
    expect(result[0]?.id).toBe('10');
  });

  it('throws error only when ALL providers fail', async () => {
    const failing1 = Promise.reject(new Error('Provider 1 down'));
    const failing2 = Promise.reject(new Error('Provider 2 down'));

    await expect(settleBooks([failing1, failing2])).rejects.toThrow('Provider 1 down');
  });
});
