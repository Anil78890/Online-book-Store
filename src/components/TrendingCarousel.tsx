import { useEffect, useRef, useState } from 'react';
import { Compass, RefreshCw } from 'lucide-react';
import type { Book } from '../types/book';
import { getBooksByCategory } from '../services/books';
import BookListItem from './BookListItem';

interface TrendingCarouselProps {
  onSaveBook: (book: Book) => void;
  isBookSaved: (book: Book) => boolean;
}

/**
 * Curated discovery section: replaced horizontal card carousel with clean, accessible list rows.
 * Lazy-loads on viewport approach.
 */
const TrendingCarousel = ({ onSaveBook, isBookSaved }: TrendingCarouselProps) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hasTriggered) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '250px' },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasTriggered]);

  useEffect(() => {
    if (!hasTriggered) return;

    const controller = new AbortController();
    setLoading(true);
    setError(false);

    getBooksByCategory('adventure', controller.signal, partial => setBooks(partial.slice(0, 4)))
      .then(result => setBooks(result.slice(0, 4)))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [hasTriggered, retryToken]);

  return (
    <section ref={sectionRef} className="border-t border-slate-100 bg-slate-50/50 py-12 sm:py-16" aria-labelledby="curated-adventure-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-slate-200 pb-5">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
            <Compass className="h-4 w-4" aria-hidden="true" /> Curated discovery
          </p>
          <h2 id="curated-adventure-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Classic voyages & adventure stories
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Historical voyages, expeditions, and tales of resilience from public collections.
          </p>
        </div>

        {loading && books.length === 0 && (
          <div className="divide-y divide-slate-100 rounded-xl bg-white px-3 sm:px-4" aria-label="Loading adventure reads" aria-live="polite">
            {Array.from({ length: 3 }).map((_, index) => (
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

        {books.length > 0 && (
          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-3 sm:px-4">
            {books.map(book => (
              <BookListItem
                key={`${book.source}-${book.id}`}
                book={book}
                isSaved={isBookSaved(book)}
                onSave={onSaveBook}
              />
            ))}
          </div>
        )}

        {error && books.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p>Adventure titles could not be loaded at this time.</p>
            <button
              type="button"
              onClick={() => setRetryToken(token => token + 1)}
              className="focus-ring mt-3 inline-flex items-center gap-2 font-semibold text-amber-950"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingCarousel;
