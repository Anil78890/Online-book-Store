import { describe, it, expect } from 'vitest';
import {
  normalizeGutendexBook,
  normalizeOpenLibrarySearchDoc,
  normalizeOpenLibrarySubjectWork,
  normalizeOpenLibraryWork,
} from '../src/services/books/normalize';
import type { GutendexBook, OpenLibrarySearchDoc, OpenLibrarySubjectWork } from '../src/types/book';

describe('normalizeGutendexBook', () => {
  it('marks Gutenberg record with plain text format as full-text', () => {
    const raw: GutendexBook = {
      id: 1342,
      title: 'Pride and Prejudice',
      authors: [{ name: 'Austen, Jane' }],
      formats: {
        'text/plain; charset=utf-8': 'https://www.gutenberg.org/cache/epub/1342/pg1342.txt',
        'image/jpeg': 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg',
      },
      languages: ['en'],
      download_count: 50000,
      subjects: ['Courtship -- Fiction', 'Sisters -- Fiction'],
    };

    const book = normalizeGutendexBook(raw);

    expect(book.id).toBe('1342');
    expect(book.title).toBe('Pride and Prejudice');
    expect(book.source).toBe('gutendex');
    expect(book.availability).toBe('full-text');
    expect(book.readingCapability).toBe('FULL_TEXT');
    expect(book.authors[0]?.name).toBe('Austen, Jane');
    expect(book.formats.plainText).toBe('https://www.gutenberg.org/cache/epub/1342/pg1342.txt');
  });

  it('marks Gutenberg record with only audio as metadata-only (truthful availability)', () => {
    const raw: GutendexBook = {
      id: 0,
      title: 'Audio Recording',
      authors: [{ name: 'Poet, Famous' }],
      formats: {
        'audio/mp3': 'https://www.gutenberg.org/files/99999/99999.mp3',
      },
      languages: ['en'],
    };

    const book = normalizeGutendexBook(raw);

    expect(book.source).toBe('gutendex');
    expect(book.availability).toBe('metadata-only');
    expect(book.readingCapability).toBe('METADATA_ONLY');
  });

  it('handles malformed, null, or missing fields without crashing', () => {
    const raw = {} as GutendexBook;
    const book = normalizeGutendexBook(raw);

    expect(book.id).toBe('unknown');
    expect(book.title).toBe('Untitled Gutenberg Book');
    expect(book.authors).toEqual([]);
    expect(book.languages).toEqual([]);
    expect(book.downloadCount).toBe(0);
  });
});

describe('normalizeOpenLibrarySearchDoc', () => {
  it('normalizes search doc and always marks as metadata-only', () => {
    const doc: OpenLibrarySearchDoc = {
      key: '/works/OL12345W',
      title: 'The Great Gatsby',
      author_name: ['F. Scott Fitzgerald'],
      cover_i: 123456,
      subject: ['Fiction', '1920s'],
      language: ['eng'],
      edition_count: 42,
    };

    const book = normalizeOpenLibrarySearchDoc(doc);
    expect(book).not.toBeNull();
    expect(book?.id).toBe('OL12345W');
    expect(book?.title).toBe('The Great Gatsby');
    expect(book?.source).toBe('openlibrary');
    expect(book?.availability).toBe('metadata-only');
    expect(book?.authors[0]?.name).toBe('F. Scott Fitzgerald');
    expect(book?.formats.image).toBe('https://covers.openlibrary.org/b/id/123456-M.jpg');
    expect(book?.downloadCount).toBe(42);
  });

  it('returns null if key or title are missing', () => {
    expect(normalizeOpenLibrarySearchDoc({ title: 'No Key' })).toBeNull();
    expect(normalizeOpenLibrarySearchDoc({ key: '/works/OL1W' })).toBeNull();
    expect(normalizeOpenLibrarySearchDoc({ key: '', title: '' })).toBeNull();
  });

  it('marks public domain records with ia identifier as FULL_TEXT', () => {
    const doc: OpenLibrarySearchDoc = {
      key: '/works/OL999W',
      title: 'Sense and Sensibility',
      author_name: ['Jane Austen'],
      ia: ['sensesensibility00aust'],
      ebook_access: 'public',
      has_fulltext: true,
    };

    const book = normalizeOpenLibrarySearchDoc(doc);
    expect(book?.readingCapability).toBe('FULL_TEXT');
    expect(book?.availability).toBe('full-text');
    expect(book?.iaId).toBe('sensesensibility00aust');
    expect(book?.externalReaderUrl).toContain('archive.org/embed/sensesensibility00aust');
  });

  it('marks borrowable records as BORROW_REQUIRED with legitimate borrow URL', () => {
    const doc: OpenLibrarySearchDoc = {
      key: '/works/OL888W',
      title: 'Modern Novel',
      author_name: ['Modern Author'],
      ia: ['modernnovel00auth'],
      ebook_access: 'borrowable',
    };

    const book = normalizeOpenLibrarySearchDoc(doc);
    expect(book?.readingCapability).toBe('BORROW_REQUIRED');
    expect(book?.availability).toBe('metadata-only');
    expect(book?.borrowUrl).toBe('https://openlibrary.org/works/OL888W/borrow');
  });

  it('marks records without ebook access as METADATA_ONLY', () => {
    const doc: OpenLibrarySearchDoc = {
      key: '/works/OL777W',
      title: 'Rare Manuscript',
      author_name: ['Scholar'],
      ebook_access: 'no_ebook',
    };

    const book = normalizeOpenLibrarySearchDoc(doc);
    expect(book?.readingCapability).toBe('METADATA_ONLY');
    expect(book?.availability).toBe('metadata-only');
  });
});

describe('normalizeOpenLibrarySubjectWork', () => {
  it('normalizes subject work with correct key stripping and metadata-only status', () => {
    const work: OpenLibrarySubjectWork = {
      key: '/works/OL6789W',
      title: 'Moby Dick',
      authors: [{ name: 'Herman Melville' }],
      cover_id: 998877,
      subject: ['Whales', 'Sea stories'],
      edition_count: 100,
    };

    const book = normalizeOpenLibrarySubjectWork(work);
    expect(book).not.toBeNull();
    expect(book?.id).toBe('OL6789W');
    expect(book?.availability).toBe('metadata-only');
    expect(book?.authors[0]?.name).toBe('Herman Melville');
  });
});

describe('normalizeOpenLibraryWork', () => {
  it('extracts description correctly whether string or object', () => {
    const work1 = {
      key: '/works/OL100W',
      title: 'Test Work',
      description: 'Simple string description',
    };
    const book1 = normalizeOpenLibraryWork(work1, 'OL100W');
    expect(book1.description).toBe('Simple string description');

    const work2 = {
      key: '/works/OL200W',
      title: 'Test Work 2',
      description: { value: 'Nested value description' },
    };
    const book2 = normalizeOpenLibraryWork(work2, 'OL200W');
    expect(book2.description).toBe('Nested value description');
  });
});
