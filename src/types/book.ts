export type BookSource =
  | 'gutendex'
  | 'openlibrary'
  | 'internetarchive'
  | 'wikisource'
  | 'standardebooks';

export type BookAvailability = 'full-text' | 'metadata-only';

export type ReadingCapability =
  | 'FULL_TEXT'
  | 'PREVIEW'
  | 'BORROW_REQUIRED'
  | 'OFFICIAL_EMBED'
  | 'EXTERNAL_READER'
  | 'METADATA_ONLY'
  | 'UNAVAILABLE';

export type ContentFormat = 'plain-text' | 'html' | 'epub' | 'pdf' | 'scanned-pages' | 'unknown';

export interface RightsInfo {
  licenseName?: string;
  licenseUrl?: string;
  rightsStatement?: string;
  publicDomainStatus?: 'verified' | 'provider-claimed' | 'unknown' | 'not-public-domain';
  attributionText?: string;
}

export interface ReadingSource {
  capability: ReadingCapability;
  format?: ContentFormat;
  contentUrl?: string;
  officialReaderUrl?: string;
  borrowUrl?: string;
  rights?: RightsInfo;
  checkedAt?: string;
}

export interface Chapter {
  id: string;
  title: string;
  startIndex: number;
  endIndex: number;
  wordCount: number;
}

export interface BookAuthor {
  name: string;
}

export interface BookFormats {
  html?: string;
  plainText?: string;
  image?: string;
  epub?: string;
  pdf?: string;
}

export interface Book {
  id: string;
  title: string;
  authors: BookAuthor[];
  formats: BookFormats;
  languages: string[];
  downloadCount: number;
  subjects: string[];
  source: BookSource;
  sourceUrl: string;
  availability: BookAvailability;
  readingCapability: ReadingCapability;
  description?: string;
  iaId?: string;
  ebookAccess?: string;
  borrowUrl?: string;
  previewUrl?: string;
  externalReaderUrl?: string;
  rights?: RightsInfo;
  readingSource?: ReadingSource;
  sourceAttribution?: string;
  chapters?: Chapter[];
}

export interface GutendexPerson {
  name?: string;
}

export interface GutendexBook {
  id: number;
  title?: string;
  authors?: GutendexPerson[];
  translators?: GutendexPerson[];
  subjects?: string[];
  bookshelves?: string[];
  languages?: string[];
  copyright?: boolean | null;
  media_type?: string;
  formats?: Record<string, string | undefined>;
  download_count?: number;
}

export interface GutendexListResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: GutendexBook[];
}

export interface OpenLibrarySearchDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  subject?: string[];
  language?: string[];
  edition_count?: number;
  first_publish_year?: number;
  has_fulltext?: boolean;
  ia?: string[];
  ebook_access?: string;
  lending_identifier_s?: string;
}

export interface OpenLibrarySearchResponse {
  docs?: OpenLibrarySearchDoc[];
}

export interface OpenLibrarySubjectWork {
  key?: string;
  title?: string;
  authors?: { name?: string }[];
  cover_id?: number;
  subject?: string[];
  subjects?: string[];
  edition_count?: number;
  has_fulltext?: boolean;
  ia?: string;
  availability?: {
    status?: string;
    isbn?: string | null;
    open?: boolean;
  };
}

export interface OpenLibrarySubjectResponse {
  works?: OpenLibrarySubjectWork[];
}

export interface OpenLibraryWorkResponse {
  key?: string;
  title?: string;
  description?: string | { value?: string };
  subjects?: string[];
  covers?: number[];
  ia?: string[];
}

export type SourceFilter = 'all' | BookSource;
