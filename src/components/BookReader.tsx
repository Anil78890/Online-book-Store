import { X } from 'lucide-react';
import type { Book } from '../types/book';
import { getBookAuthors, getBookContent } from '../services/books';
import { useEffect, useState } from 'react';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

const BookReader = ({ book, onClose }: BookReaderProps) => {
  const [content, setContent] = useState('Loading book…');

  useEffect(() => {
    const controller = new AbortController();
    getBookContent(book, controller.signal)
      .then(setContent)
      .catch(() => setContent('This book could not be loaded. Please try again later.'));
    return () => controller.abort();
  }, [book]);

  return (
    <div className="fixed inset-0 z-50 bg-white" role="dialog" aria-modal="true" aria-labelledby="legacy-reader-title">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div>
          <h2 id="legacy-reader-title" className="font-bold text-gray-900">{book.title}</h2>
          <p className="text-sm text-gray-600">{getBookAuthors(book)}</p>
        </div>
        <button type="button" onClick={onClose} className="focus-ring rounded-full p-2 hover:bg-gray-100" aria-label="Close reader">
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <div className="h-[calc(100vh-4rem)] overflow-y-auto p-6">
        <pre className="whitespace-pre-wrap break-words font-serif leading-8">{content}</pre>
      </div>
    </div>
  );
};

export default BookReader;
