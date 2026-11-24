import { FormEvent, useEffect, useMemo, useState } from 'react';
import { BookOpen, RefreshCw, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import type { Book, SourceFilter } from '../types/book';
import { getBooksByCategory, searchBooks, GENRE_TAXONOMY, getGenreById } from '../services/books';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import BookListItem from './BookListItem';

interface SearchResultsProps {
  onSaveBook: (book: Book) => void;
  isBookSaved: (book: Book) => boolean;
}

const sourceFilters: Array<{ value: SourceFilter; label: string }> = [
  { value: 'all', label: 'All providers' },
  { value: 'gutendex', label: 'Project Gutenberg' },
  { value: 'openlibrary', label: 'Open Library' },
  { value: 'internetarchive', label: 'Internet Archive' },
  { value: 'wikisource', label: 'Wikisource' },
  { value: 'standardebooks', label: 'Standard Ebooks' },
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

  const activeGenre = category ? getGenreById(category) : undefined;
  const title = activeGenre
    ? activeGenre.name
    : category
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
            {activeGenre ? activeGenre.description : 'Search public collections across Project Gutenberg, Open Library, Internet Archive, Wikisource, and Standard Ebooks. Full-text availability is verified and shown clearly for each result.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search by title, author or subject…"
                className="focus-ring w-full rounded-full border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600"
                aria-label="Search catalogue"
              />
            </div>
            <button
              type="submit"
              className="focus-ring inline-flex items-center justify-center rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              Search
            </button>
          </form>

          {/* Genre Category Badges Filter */}
          <div className="mt-5 flex flex-wrap items-center gap-1.5 pt-2">
            <span className="mr-1 text-xs font-semibold text-slate-500">Genres:</span>
            {category && (
              <button
                type="button"
                onClick={() => setSearchParams(activeSearchQuery ? { q: activeSearchQuery } : {})}
                className="focus-ring inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-200"
              >
                Clear genre <X className="h-3 w-3" />
              </button>
            )}
            {GENRE_TAXONOMY.slice(0, 8).map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => setSearchParams({ category: g.id })}
                className={`focus-ring rounded-full px-3 py-1 text-xs font-medium transition ${
                  category === g.id
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {g.name.split('&')[0].trim()}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4 pt-3">
            <p className="text-sm font-semibold text-slate-700" aria-live="polite">
              {loading && books.length === 0
                ? 'Searching book catalogues…'
                : `${filteredBooks.length} ${filteredBooks.length === 1 ? 'book' : 'books'} found`}
            </p>

            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <label htmlFor="source-filter" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Provider:
              </label>
              <select
                id="source-filter"
                value={sourceFilter}
                onChange={event => setSourceFilter(event.target.value as SourceFilter)}
                className="focus-ring rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
              >
                {sourceFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-slate-800">
            <p className="font-semibold text-amber-950">Catalogue notice</p>
            <p className="mt-1 text-sm text-amber-900">{error}</p>
            <button
              type="button"
              onClick={() => setRetryToken(token => token + 1)}
              className="focus-ring mt-4 inline-flex items-center gap-2 rounded-full bg-amber-950 px-4 py-2 text-xs font-semibold text-white hover:bg-black"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" /> Retry search
            </button>
          </div>
        )}

        <div className="mt-6 divide-y divide-slate-200">
          {filteredBooks.map(book => (
            <BookListItem
              key={`${book.source}-${book.id}`}
              book={book}
              isSaved={isBookSaved(book)}
              onSave={onSaveBook}
            />
          ))}
        </div>

        {loading && (
          <div className="py-8 text-center text-sm font-semibold text-slate-600" role="status">
            Checking live provider collections…
          </div>
        )}

        {!loading && filteredBooks.length === 0 && !error && (activeSearchQuery || category) && (
          <div className="py-16 text-center">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-800">No matching books found</h2>
            <p className="mt-1 text-sm text-slate-500">
              Try searching with broader keywords, author name, or select "All providers".
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default SearchResults;
