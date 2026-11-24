export type BookSource = 'gutendex' | 'openlibrary';

export type BookAvailability = 'full-text' | 'metadata-only';

export interface BookAuthor {
  name: string;
}

export interface BookFormats {
  html?: string;
  plainText?: string;
  image?: string;
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
  description?: string;
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
}

export type SourceFilter = 'all' | BookSource;
