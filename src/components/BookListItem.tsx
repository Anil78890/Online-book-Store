import { useState } from 'react';
import { BookmarkPlus, Check, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Book } from '../types/book';
import {
  getActionButtonLabel,
  getAvailabilityLabel,
  getBookAuthors,
  getBookCover,
  getBookPath,
} from '../services/books';
import CoverFallback from './CoverFallback';

interface BookListItemProps {
  book: Book;
  isSaved: boolean;
  onSave: (book: Book) => void;
  compact?: boolean;
}

const getBadgeStyle = (capability: Book['readingCapability']) => {
  switch (capability) {
    case 'FULL_TEXT':
    case 'EXTERNAL_READER':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'PREVIEW':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'BORROW_REQUIRED':
      return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    case 'METADATA_ONLY':
      return 'text-sky-700 bg-sky-50 border-sky-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
};

/** Compact, catalogue-style result row: readable and usable without a card grid. */
const BookListItem = ({ book, isSaved, onSave, compact = false }: BookListItemProps) => {
  const [imageError, setImageError] = useState(false);
  const actionLabel = getActionButtonLabel(book);
  const badgeStyle = getBadgeStyle(book.readingCapability);
  const bookPath = getBookPath(book);

  if (compact) {
    return (
      <article className="group flex w-[320px] shrink-0 snap-start items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-sm transition hover:border-blue-300 hover:shadow-md sm:w-[350px]">
        <Link
          to={bookPath}
          className="focus-ring h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-blue-50 shadow-sm"
          aria-label={`Open ${book.title}`}
        >
          {!book.formats.image || imageError ? (
            <CoverFallback book={book} className="h-full w-full" />
          ) : (
            <img
              src={getBookCover(book)}
              alt={`Cover for ${book.title}`}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
            />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${badgeStyle}`}>
              {getAvailabilityLabel(book)}
            </span>
          </div>
          <Link
            to={bookPath}
            className="focus-ring line-clamp-1 text-sm font-semibold text-slate-900 decoration-blue-600 underline-offset-2 group-hover:text-blue-700 group-hover:underline"
          >
            {book.title}
          </Link>
          <p className="mt-0.5 truncate text-xs text-slate-600">{getBookAuthors(book)}</p>

          <div className="mt-2.5 flex items-center gap-2">
            <Link
              to={bookPath}
              className="focus-ring inline-flex min-h-8 items-center gap-1.5 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white transition hover:bg-blue-800"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{actionLabel}</span>
            </Link>
            <button
              type="button"
              onClick={() => onSave(book)}
              disabled={isSaved}
              className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
              aria-label={isSaved ? `${book.title} is saved` : `Save ${book.title}`}
              title={isSaved ? 'Saved to library' : 'Save to library'}
            >
              {isSaved ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <BookmarkPlus className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex items-center gap-4 py-4 transition-colors hover:bg-blue-50/60 sm:gap-5 sm:px-3">
      <Link
        to={bookPath}
        className="focus-ring h-20 w-14 shrink-0 overflow-hidden rounded-md bg-blue-50 shadow-sm sm:h-24 sm:w-16"
        aria-label={`Open ${book.title}`}
      >
        {!book.formats.image || imageError ? (
          <CoverFallback book={book} className="h-full w-full" />
        ) : (
          <img
            src={getBookCover(book)}
            alt={`Cover for ${book.title}`}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${badgeStyle}`}>
            {getAvailabilityLabel(book)}
          </span>
          {book.subjects[0] && <span className="text-xs text-slate-400">{book.subjects[0]}</span>}
        </div>
        <Link
          to={bookPath}
          className="focus-ring line-clamp-2 text-base font-semibold leading-snug text-slate-900 decoration-blue-600 underline-offset-4 group-hover:text-blue-700 group-hover:underline sm:text-lg"
        >
          {book.title}
        </Link>
        <p className="mt-1 truncate text-sm text-slate-600">{getBookAuthors(book)}</p>
        {book.subjects.length > 1 && (
          <p className="mt-1 hidden truncate text-xs text-slate-400 sm:block">{book.subjects.slice(1, 4).join(' · ')}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          to={bookPath}
          className="focus-ring inline-flex min-h-10 items-center gap-2 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{actionLabel}</span>
          <span className="sm:hidden">{actionLabel === 'Read' ? 'Read' : 'Open'}</span>
        </Link>
        <button
          type="button"
          onClick={() => onSave(book)}
          disabled={isSaved}
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
          aria-label={isSaved ? `${book.title} is saved` : `Save ${book.title} to library`}
          title={isSaved ? 'Saved to your library' : 'Save to your library'}
        >
          {isSaved ? <Check className="h-4 w-4" aria-hidden="true" /> : <BookmarkPlus className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </article>
  );
};

export default BookListItem;
