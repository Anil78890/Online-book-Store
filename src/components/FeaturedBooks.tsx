import { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, RefreshCw, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Book } from '../types/book';
import { getPopularBooks } from '../services/books';
import BookListItem from './BookListItem';

interface FeaturedBooksProps {
  onSaveBook: (book: Book) => void;
  isBookSaved: (book: Book) => boolean;
}

const FeaturedBooks = ({ onSaveBook, isBookSaved }: FeaturedBooksProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(300, Math.floor(el.clientWidth * 0.75));
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scroll('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scroll('right');
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    getPopularBooks(controller.signal, partial => setBooks(partial.slice(0, 14)))
      .then(result => setBooks(result.slice(0, 14)))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryToken]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollButtons();
    el.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [books, updateScrollButtons]);

  return (
    <section className="bg-white py-12 sm:py-16" aria-labelledby="featured-books-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
              <TrendingUp className="h-4 w-4" aria-hidden="true" /> Reader favourites
            </p>
            <h2 id="featured-books-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Popular books to start with
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Explore public literature. Scroll horizontally through compact catalogue entries.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Subtle Horizontal Navigation Controls */}
            <div className="flex items-center gap-1.5" role="group" aria-label="Horizontal scroll controls">
              <button
                type="button"
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Scroll to previous featured books"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Scroll to next featured books"
                className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <Link
              to="/search"
              className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900"
            >
              Browse all <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {loading && books.length === 0 && (
          <div
            className="flex gap-4 overflow-hidden py-2"
            aria-label="Loading featured books"
            aria-live="polite"
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex w-[320px] shrink-0 animate-pulse items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:w-[350px]"
              >
                <div className="h-20 w-14 shrink-0 rounded-lg bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-slate-200" />
                  <div className="h-4 w-4/5 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {books.length > 0 && (
          <div className="relative">
            <div
              ref={scrollContainerRef}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              role="region"
              aria-label="Scrollable list of popular books. Use Left and Right arrow keys to scroll."
              className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl"
              style={{ scrollbarWidth: 'thin' }}
            >
              {books.map(book => (
                <BookListItem
                  key={`${book.source}-${book.id}`}
                  book={book}
                  compact={true}
                  isSaved={isBookSaved(book)}
                  onSave={onSaveBook}
                />
              ))}
            </div>

            {loading && (
              <p className="mt-3 text-xs text-slate-500" role="status">
                Loading more catalogue results…
              </p>
            )}
          </div>
        )}

        {error && books.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p>Popular books could not be loaded. You can still search the catalogues.</p>
            <button
              type="button"
              onClick={() => setRetryToken(token => token + 1)}
              className="focus-ring mt-3 inline-flex items-center gap-2 font-semibold text-amber-950"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <p className="py-6 text-sm text-slate-600">
            No featured titles are available right now. Try searching by title or author.
          </p>
        )}
      </div>
    </section>
  );
};

export default FeaturedBooks;
