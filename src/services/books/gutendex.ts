import type { GutendexBook, GutendexListResponse } from '../../types/book';
import { fetchJson } from './http';

const GUTENDEX_BASE_URL = 'https://gutendex.com/books';

export const fetchGutendexSearch = (query: string, signal?: AbortSignal): Promise<GutendexListResponse> =>
  fetchJson<GutendexListResponse>(`${GUTENDEX_BASE_URL}/?search=${encodeURIComponent(query)}`, {
    signal,
    cacheMs: 45_000,
  });

export const fetchGutendexPopular = (signal?: AbortSignal): Promise<GutendexListResponse> =>
  fetchJson<GutendexListResponse>(`${GUTENDEX_BASE_URL}/?sort=popular`, {
    signal,
    cacheMs: 180_000,
  });

export const fetchGutendexCategory = (category: string, signal?: AbortSignal): Promise<GutendexListResponse> =>
  fetchJson<GutendexListResponse>(`${GUTENDEX_BASE_URL}/?topic=${encodeURIComponent(category)}`, {
    signal,
    cacheMs: 120_000,
  });

export const fetchGutendexBook = (id: string, signal?: AbortSignal): Promise<GutendexBook> =>
  // Trailing slash matters: Gutendex redirects /books/<id> to /books/<id>/.
  fetchJson<GutendexBook>(`${GUTENDEX_BASE_URL}/${encodeURIComponent(id)}/`, {
    signal,
    cacheMs: 10 * 60_000,
  });
