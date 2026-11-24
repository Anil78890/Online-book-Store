import type {
  OpenLibrarySearchResponse,
  OpenLibrarySubjectResponse,
  OpenLibraryWorkResponse,
} from '../../types/book';
import { fetchJson } from './http';

const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';

export const fetchOpenLibrarySearch = (query: string, signal?: AbortSignal): Promise<OpenLibrarySearchResponse> =>
  fetchJson<OpenLibrarySearchResponse>(
    `${OPEN_LIBRARY_BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,cover_i,subject,language,edition_count,first_publish_year,has_fulltext,ia,ebook_access,lending_identifier_s`,
    { signal, cacheMs: 45_000 },
  );

export const fetchOpenLibrarySubject = (category: string, signal?: AbortSignal): Promise<OpenLibrarySubjectResponse> =>
  fetchJson<OpenLibrarySubjectResponse>(
    `${OPEN_LIBRARY_BASE_URL}/subjects/${encodeURIComponent(category.toLowerCase())}.json?limit=12`,
    { signal, cacheMs: 180_000 },
  );

export const fetchOpenLibraryWork = (id: string, signal?: AbortSignal): Promise<OpenLibraryWorkResponse> =>
  fetchJson<OpenLibraryWorkResponse>(`${OPEN_LIBRARY_BASE_URL}/works/${encodeURIComponent(id)}.json`, {
    signal,
    cacheMs: 10 * 60_000,
  });
