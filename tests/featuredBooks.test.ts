import { describe, it, expect } from 'vitest';
import { getActionButtonLabel, getAvailabilityLabel } from '../src/services/books';
import type { Book } from '../src/types/book';

describe('FeaturedBooks & Catalogue capability mapping', () => {
  it('maps FULL_TEXT to Read and Free to read', () => {
    const book: Book = {
      id: '1',
      title: 'Alice in Wonderland',
      authors: [{ name: 'Lewis Carroll' }],
      formats: {},
      languages: ['en'],
      downloadCount: 100,
      subjects: ['Fantasy'],
      source: 'gutendex',
      sourceUrl: 'https://gutenberg.org/ebooks/1',
      availability: 'full-text',
      readingCapability: 'FULL_TEXT',
    };

    expect(getActionButtonLabel(book)).toBe('Read');
    expect(getAvailabilityLabel(book)).toBe('Free to read');
  });

  it('maps BORROW_REQUIRED to Borrow and Borrow on Open Library', () => {
    const book: Book = {
      id: 'OL2',
      title: 'Modern Work',
      authors: [{ name: 'Contemporary Author' }],
      formats: {},
      languages: ['en'],
      downloadCount: 50,
      subjects: ['Fiction'],
      source: 'openlibrary',
      sourceUrl: 'https://openlibrary.org/works/OL2',
      availability: 'metadata-only',
      readingCapability: 'BORROW_REQUIRED',
    };

    expect(getActionButtonLabel(book)).toBe('Borrow');
    expect(getAvailabilityLabel(book)).toBe('Borrow on Open Library');
  });

  it('maps METADATA_ONLY to Details and Bibliographic record', () => {
    const book: Book = {
      id: 'OL3',
      title: 'Archival Work',
      authors: [{ name: 'Historian' }],
      formats: {},
      languages: ['en'],
      downloadCount: 12,
      subjects: ['History'],
      source: 'openlibrary',
      sourceUrl: 'https://openlibrary.org/works/OL3',
      availability: 'metadata-only',
      readingCapability: 'METADATA_ONLY',
    };

    expect(getActionButtonLabel(book)).toBe('Details');
    expect(getAvailabilityLabel(book)).toBe('Bibliographic record');
  });

  it('calculates scroll bounds accurately', () => {
    const clientWidth = 800;
    const scrollWidth = 2400;

    // Start of container
    const atStart = { scrollLeft: 0, clientWidth, scrollWidth };
    const canScrollLeftStart = atStart.scrollLeft > 10;
    const canScrollRightStart = atStart.scrollLeft + atStart.clientWidth < atStart.scrollWidth - 10;
    expect(canScrollLeftStart).toBe(false);
    expect(canScrollRightStart).toBe(true);

    // Middle of container
    const inMiddle = { scrollLeft: 500, clientWidth, scrollWidth };
    const canScrollLeftMid = inMiddle.scrollLeft > 10;
    const canScrollRightMid = inMiddle.scrollLeft + inMiddle.clientWidth < inMiddle.scrollWidth - 10;
    expect(canScrollLeftMid).toBe(true);
    expect(canScrollRightMid).toBe(true);

    // End of container
    const atEnd = { scrollLeft: 1600, clientWidth, scrollWidth };
    const canScrollLeftEnd = atEnd.scrollLeft > 10;
    const canScrollRightEnd = atEnd.scrollLeft + atEnd.clientWidth < atEnd.scrollWidth - 10;
    expect(canScrollLeftEnd).toBe(true);
    expect(canScrollRightEnd).toBe(false);
  });
});
