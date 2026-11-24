import type {
  Book,
  BookAvailability,
  GutendexBook,
  OpenLibrarySearchDoc,
  OpenLibrarySubjectWork,
  OpenLibraryWorkResponse,
  ReadingCapability,
} from '../../types/book';

const asStrings = (values: unknown): string[] => {
  if (!Array.isArray(values)) return [];
  return values
    .filter((value): value is string => typeof value === 'string')
    .map(value => value.trim())
    .filter(Boolean);
};

const stripOpenLibraryPrefix = (key: string): string => key.replace(/^\/(works|books)\//, '');

const getOpenLibrarySourceUrl = (key: string): string =>
  key.startsWith('/') ? `https://openlibrary.org${key}` : `https://openlibrary.org/works/${key}`;

const asObject = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

export const normalizeGutendexBook = (book: GutendexBook): Book => {
  const raw = asObject(book);
  const formats = asObject(raw.formats) as Record<string, string | undefined>;
  const authors = Array.isArray(raw.authors) ? raw.authors : [];
  const id = String(raw.id ?? 'unknown');

  const plainTextUrl =
    typeof formats['text/plain; charset=utf-8'] === 'string'
      ? formats['text/plain; charset=utf-8']
      : typeof formats['text/plain'] === 'string'
        ? formats['text/plain']
        : typeof formats['text/plain; charset=us-ascii'] === 'string'
          ? formats['text/plain; charset=us-ascii']
          : typeof formats['text/plain; charset=iso-8859-1'] === 'string'
            ? formats['text/plain; charset=iso-8859-1']
            : undefined;

  const htmlUrl =
    typeof formats['text/html'] === 'string'
      ? formats['text/html']
      : typeof formats['text/html; charset=utf-8'] === 'string'
        ? formats['text/html; charset=utf-8']
        : undefined;

  // Truthful availability: Gutenberg books with text/html have in-app full text available
  const hasReadableContent = Boolean(
    plainTextUrl ||
      htmlUrl ||
      (Boolean(raw.id) && typeof raw.id === 'number' && !formats['audio/mp3']),
  );

  return {
    id,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Untitled Gutenberg Book',
    authors: authors
      .map(author => {
        const name = asObject(author).name;
        return typeof name === 'string' && name.trim() ? { name: name.trim() } : null;
      })
      .filter((author): author is { name: string } => Boolean(author)),
    formats: {
      html: htmlUrl,
      plainText: plainTextUrl,
      image: typeof formats['image/jpeg'] === 'string' ? formats['image/jpeg'] : undefined,
    },
    languages: asStrings(raw.languages),
    downloadCount:
      typeof raw.download_count === 'number' && Number.isFinite(raw.download_count) ? raw.download_count : 0,
    subjects: [...asStrings(raw.subjects), ...asStrings(raw.bookshelves)],
    source: 'gutendex',
    sourceUrl: `https://www.gutenberg.org/ebooks/${id}`,
    availability: hasReadableContent ? 'full-text' : 'metadata-only',
    readingCapability: hasReadableContent ? 'FULL_TEXT' : 'METADATA_ONLY',
  };
};

export const normalizeOpenLibrarySearchDoc = (doc: OpenLibrarySearchDoc): Book | null => {
  const raw = asObject(doc);
  if (typeof raw.key !== 'string' || typeof raw.title !== 'string' || !raw.key.trim() || !raw.title.trim())
    return null;
  const key = raw.key;
  const coverId = typeof raw.cover_i === 'number' ? raw.cover_i : undefined;
  const iaList = asStrings(raw.ia);
  const iaId = iaList[0];
  const ebookAccess = typeof raw.ebook_access === 'string' ? raw.ebook_access.toLowerCase() : undefined;
  const hasFulltext = Boolean(raw.has_fulltext);

  let readingCapability: ReadingCapability = 'METADATA_ONLY';
  let externalReaderUrl: string | undefined;
  let borrowUrl: string | undefined;

  if (ebookAccess === 'public' && iaId) {
    readingCapability = 'FULL_TEXT';
    externalReaderUrl = `https://archive.org/embed/${encodeURIComponent(iaId)}`;
  } else if (ebookAccess === 'borrowable') {
    readingCapability = 'BORROW_REQUIRED';
    borrowUrl = `https://openlibrary.org${key}/borrow`;
    if (iaId) {
      externalReaderUrl = `https://archive.org/embed/${encodeURIComponent(iaId)}`;
    }
  } else if (ebookAccess === 'printdisabled' && iaId) {
    readingCapability = 'BORROW_REQUIRED';
    borrowUrl = `https://archive.org/details/${encodeURIComponent(iaId)}`;
  } else if (hasFulltext && iaId) {
    readingCapability = 'EXTERNAL_READER';
    externalReaderUrl = `https://archive.org/embed/${encodeURIComponent(iaId)}`;
  }

  const availability: BookAvailability = readingCapability === 'FULL_TEXT' ? 'full-text' : 'metadata-only';

  return {
    id: stripOpenLibraryPrefix(key),
    title: raw.title.trim(),
    authors: asStrings(raw.author_name).map(name => ({ name })),
    formats: {
      html: getOpenLibrarySourceUrl(key),
      image: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
    },
    languages: asStrings(raw.language),
    downloadCount:
      typeof raw.edition_count === 'number' && Number.isFinite(raw.edition_count) ? raw.edition_count : 0,
    subjects: asStrings(raw.subject),
    source: 'openlibrary',
    sourceUrl: getOpenLibrarySourceUrl(key),
    availability,
    readingCapability,
    iaId,
    ebookAccess,
    borrowUrl,
    externalReaderUrl,
  };
};

export const normalizeOpenLibrarySubjectWork = (work: OpenLibrarySubjectWork): Book | null => {
  const raw = asObject(work);
  if (typeof raw.key !== 'string' || typeof raw.title !== 'string' || !raw.key.trim() || !raw.title.trim())
    return null;
  const key = raw.key;
  const coverId = typeof raw.cover_id === 'number' ? raw.cover_id : undefined;
  const authors = Array.isArray(raw.authors) ? raw.authors : [];
  const iaId = typeof raw.ia === 'string' && raw.ia.trim() ? raw.ia.trim() : undefined;
  const hasFulltext = Boolean(raw.has_fulltext);

  let readingCapability: ReadingCapability = 'METADATA_ONLY';
  let externalReaderUrl: string | undefined;

  if (iaId && hasFulltext) {
    readingCapability = 'FULL_TEXT';
    externalReaderUrl = `https://archive.org/embed/${encodeURIComponent(iaId)}`;
  } else if (iaId) {
    readingCapability = 'EXTERNAL_READER';
    externalReaderUrl = `https://archive.org/embed/${encodeURIComponent(iaId)}`;
  }

  return {
    id: stripOpenLibraryPrefix(key),
    title: raw.title.trim(),
    authors: authors
      .map(author => asObject(author).name)
      .filter((name): name is string => typeof name === 'string' && Boolean(name.trim()))
      .map(name => ({ name: name.trim() })),
    formats: {
      html: getOpenLibrarySourceUrl(key),
      image: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : undefined,
    },
    languages: [],
    downloadCount:
      typeof raw.edition_count === 'number' && Number.isFinite(raw.edition_count) ? raw.edition_count : 0,
    subjects: asStrings(raw.subjects ?? raw.subject),
    source: 'openlibrary',
    sourceUrl: getOpenLibrarySourceUrl(key),
    availability: readingCapability === 'FULL_TEXT' ? 'full-text' : 'metadata-only',
    readingCapability,
    iaId,
    externalReaderUrl,
  };
};

export const normalizeOpenLibraryWork = (work: OpenLibraryWorkResponse, id: string): Book => {
  const raw = asObject(work);
  const descriptionValue = raw.description;
  const description =
    typeof descriptionValue === 'string'
      ? descriptionValue
      : typeof asObject(descriptionValue).value === 'string'
        ? (asObject(descriptionValue).value as string)
        : undefined;
  const covers = Array.isArray(raw.covers) ? raw.covers : [];
  const cover = covers.find((value): value is number => typeof value === 'number');
  const key = typeof raw.key === 'string' ? raw.key : `/works/${id}`;
  const iaList = asStrings(raw.ia);
  const iaId = iaList[0];

  return {
    id,
    title: typeof raw.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Untitled Open Library Work',
    authors: [],
    formats: {
      html: getOpenLibrarySourceUrl(key),
      image: cover ? `https://covers.openlibrary.org/b/id/${cover}-M.jpg` : undefined,
    },
    languages: [],
    downloadCount: 0,
    subjects: asStrings(raw.subjects),
    source: 'openlibrary',
    sourceUrl: getOpenLibrarySourceUrl(key),
    availability: 'metadata-only',
    readingCapability: iaId ? 'EXTERNAL_READER' : 'METADATA_ONLY',
    iaId,
    externalReaderUrl: iaId ? `https://archive.org/embed/${encodeURIComponent(iaId)}` : undefined,
    description,
  };
};
