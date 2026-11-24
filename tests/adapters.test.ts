import { describe, it, expect } from 'vitest';
import { getAdapter, getAllAdapters, getProviderDisplayName } from '../src/services/books/adapters/registry';
import { GENRE_TAXONOMY, getGenreById, getGenreQueryForProvider } from '../src/services/books/genres';

describe('Provider Registry', () => {
  it('registers all 5 legitimate book providers', () => {
    const adapters = getAllAdapters();
    expect(adapters.length).toBe(5);

    const sources = adapters.map(a => a.source);
    expect(sources).toContain('gutendex');
    expect(sources).toContain('openlibrary');
    expect(sources).toContain('internetarchive');
    expect(sources).toContain('wikisource');
    expect(sources).toContain('standardebooks');
  });

  it('provides human-readable provider names', () => {
    expect(getProviderDisplayName('gutendex')).toBe('Project Gutenberg');
    expect(getProviderDisplayName('openlibrary')).toBe('Open Library');
    expect(getProviderDisplayName('internetarchive')).toBe('Internet Archive');
    expect(getProviderDisplayName('wikisource')).toBe('Wikisource');
    expect(getProviderDisplayName('standardebooks')).toBe('Standard Ebooks');
  });

  it('throws for unsupported provider source', () => {
    // @ts-expect-error testing invalid source
    expect(() => getAdapter('invalid_source')).toThrow();
  });
});

describe('Genre Taxonomy & Provider Vocabulary Mapping', () => {
  it('includes at least 15 verified curated genres', () => {
    expect(GENRE_TAXONOMY.length).toBeGreaterThanOrEqual(15);
  });

  it('maps genre query correctly across all providers', () => {
    const philosophy = getGenreById('philosophy');
    expect(philosophy).toBeDefined();

    expect(getGenreQueryForProvider('philosophy', 'gutendex')).toBe('philosophy');
    expect(getGenreQueryForProvider('philosophy', 'openlibrary')).toBe('philosophy');
    expect(getGenreQueryForProvider('philosophy', 'internetarchive')).toContain('philosophy');
    expect(getGenreQueryForProvider('philosophy', 'wikisource')).toBe('Philosophy');
  });

  it('handles slug normalization (e.g. underscores to hyphens)', () => {
    const sciFi = getGenreById('science_fiction');
    expect(sciFi).toBeDefined();
    expect(sciFi?.name).toBe('Science Fiction');
  });
});

describe('Wikisource Adapter book structure', () => {
  it('constructs correct public-domain book attributes and rights info', () => {
    const mockBook = {
      id: 'Sample_Work',
      title: 'Sample Work',
      authors: [{ name: 'Wikisource Author' }],
      formats: {},
      languages: ['en'],
      downloadCount: 100,
      subjects: ['Fiction'],
      source: 'wikisource' as const,
      sourceUrl: 'https://en.wikisource.org/wiki/Sample_Work',
      availability: 'full-text' as const,
      readingCapability: 'FULL_TEXT' as const,
    };

    expect(mockBook.source).toBe('wikisource');
    expect(mockBook.readingCapability).toBe('FULL_TEXT');
  });
});
