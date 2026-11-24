import { useEffect, useState } from 'react';
import { ArrowRight, RefreshCw, TrendingUp } from 'lucide-react';
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

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(false);

    getPopularBooks(controller.signal, partial => setBooks(partial.slice(0, 8)))
      .then(result => setBooks(result.slice(0, 8)))
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [retryToken]);

  return (
    <section className="bg-white py-12 sm:py-16" aria-labelledby="featured-books-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
              <TrendingUp className="h-4 w-4" aria-hidden="true" /> Reader favourites
            </p>
            <h2 id="featured-books-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Popular books to start with</h2>
            <p className="mt-2 text-sm text-slate-600">A quick selection from public book catalogues.</p>
          </div>
          <Link to="/search" className="focus-ring inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
            Browse all books <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading && books.length === 0 && (
          <div className="divide-y divide-slate-100" aria-label="Loading books" aria-live="polite">
            {Array.from({ length: 4 }).map((_, index) => (
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
          <>
            <div className="divide-y divide-slate-100">
              {books.map(book => (
                <BookListItem
                  key={`${book.source}-${book.id}`}
                  book={book}
                  isSaved={isBookSaved(book)}
                  onSave={onSaveBook}
                />
              ))}
            </div>
            {loading && <p className="mt-3 text-xs text-slate-500" role="status">Loading more catalogue results…</p>}
          </>
        )}

        {error && books.length === 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
            <p>Popular books could not be loaded. You can still search the catalogues.</p>
            <button type="button" onClick={() => setRetryToken(token => token + 1)} className="focus-ring mt-3 inline-flex items-center gap-2 font-semibold text-amber-950">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <p className="py-6 text-sm text-slate-600">No featured titles are available right now. Try searching by title or author.</p>
        )}
      </div>
    </section>
  );
};

export default FeaturedBooks;
