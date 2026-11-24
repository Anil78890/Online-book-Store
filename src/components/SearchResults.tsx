import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BookOpen, RefreshCw, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { Book, SourceFilter } from '../types/book';
import { getBooksByCategory, searchBooks } from '../services/books';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import BookListItem from './BookListItem';

interface SearchResultsProps {
  onSaveBook: (book: Book) => void;
  isBookSaved: (book: Book) => boolean;
}

const sourceFilters: Array<{ value: SourceFilter; label: string }> = [
  { value: 'all', label: 'All sources' },
  { value: 'gutendex', label: 'Project Gutenberg' },
  { value: 'openlibrary', label: 'Open Library' },
];

const SearchResults = ({ onSaveBook, isBookSaved }: SearchResultsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const debouncedQuery = useDebouncedValue(query, 275);
  const activeSearchQuery = debouncedQuery.trim();

  useEffect(() => setQuery(initialQuery), [initialQuery]);

  useEffect(() => {
    const controller = new AbortController();
    const activeQuery = debouncedQuery.trim();
    const activeCategory = category.trim();

    if (!activeQuery && !activeCategory) {
      setBooks([]);
      setLoading(false);
      setError(null);
      return () => controller.abort();
    }

    setBooks([]);
    setLoading(true);
    setError(null);

    const updatePartial = (partial: Book[]) => {
      if (!controller.signal.aborted) setBooks(partial);
    };

    const load = activeCategory
      ? getBooksByCategory(activeCategory, controller.signal, updatePartial)
      : searchBooks(activeQuery, controller.signal, updatePartial);

    void load
      .then(results => setBooks(results))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError('The book catalogues are taking longer than expected. Check your connection and try again.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [category, debouncedQuery, retryToken]);

  const filteredBooks = useMemo(
    () => books.filter(book => sourceFilter === 'all' || book.source === sourceFilter),
    [books, sourceFilter],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    setSearchParams(trimmedQuery ? { q: trimmedQuery } : {});
  };

  const title = category
    ? `Browsing ${category.replace(/_/g, ' ')}`
    : activeSearchQuery
      ? `Search results for “${activeSearchQuery}”`
      : 'Search public book catalogues';

  return (
    <main className="min-h-screen bg-slate-50 pt-28">
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8" aria-labelledby="search-heading">
        <div className="border-b border-slate-200 pb-7">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">BlueLeaf catalogue</p>
          <h1 id="search-heading" className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Search public-domain books from Project Gutenberg and discover additional editions through Open Library. Full-text availability is shown clearly for each result.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <label className="sr-only" htmlFor="search-page-input">Search books</label>
              <input
                id="search-page-input"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search by title, author or subject"
                className="focus-ring min-h-12 w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-4 text-slate-900 shadow-sm placeholder:text-slate-400"
              />
            </div>
            <button type="submit" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800">
              <SearchIcon className="h-4 w-4" aria-hidden="true" /> Search
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by source">
          <span className="mr-1 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Source
          </span>
          {sourceFilters.map(filter => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setSourceFilter(filter.value)}
              className={`focus-ring rounded-full px-3 py-2 text-sm font-semibold transition ${sourceFilter === filter.value ? 'bg-blue-700 text-white' : 'bg-white text-slate-700 ring-1 ring-inset ring-slate-200 hover:bg-blue-50'}`}
              aria-pressed={sourceFilter === filter.value}
            >
              {filter.label}
            </button>
          ))}
          {filteredBooks.length > 0 && (
            <span className="ml-auto text-sm text-slate-500" aria-live="polite">
              {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
            </span>
          )}
        </div>

        <div className="mt-5" aria-live="polite">
          {loading && books.length === 0 && (
            <div className="divide-y divide-slate-200 rounded-xl bg-white px-4" aria-label="Searching books">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex animate-pulse items-center gap-4 py-4">
                  <div className="h-20 w-14 shrink-0 rounded bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 rounded bg-slate-100" />
                    <div className="h-4 w-2/3 rounded bg-slate-100" />
                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {loading && books.length > 0 && (
            <p className="mb-2 text-xs text-slate-500" role="status">Results are appearing. Checking the other catalogue…</p>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
              <p>{error}</p>
              <button type="button" onClick={() => setRetryToken(token => token + 1)} className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-950">
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Retry search
              </button>
            </div>
          )}

          {!loading && !error && !activeSearchQuery && !category && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-blue-700" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-900">What would you like to read?</h2>
              <p className="mt-2 text-sm text-slate-600">Search for a title, author or subject, or choose a category from the homepage.</p>
            </div>
          )}

          {!loading && !error && (activeSearchQuery || category) && filteredBooks.length === 0 && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" aria-hidden="true" />
              <h2 className="text-xl font-semibold text-slate-900">No books found</h2>
              <p className="mt-2 text-sm text-slate-600">Try another keyword or switch the source filter to All sources.</p>
            </div>
          )}

          {filteredBooks.length > 0 && (
            <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-3 sm:px-4">
              {filteredBooks.map(book => (
                <BookListItem
                  key={`${book.source}-${book.id}`}
                  book={book}
                  isSaved={isBookSaved(book)}
                  onSave={onSaveBook}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default SearchResults;
