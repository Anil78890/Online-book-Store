import type { Book } from '../types/book';

interface CoverFallbackProps {
  book: Book;
  className?: string;
}

const generateGradient = (id: string) => {
  const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const h = Math.abs(hash) % 360;
  return `linear-gradient(135deg, hsl(${h}, 70%, 40%), hsl(${(h + 60) % 360}, 80%, 20%))`;
};

const CoverFallback = ({ book, className = '' }: CoverFallbackProps) => {
  return (
    <div 
      className={`flex flex-col items-center justify-center p-4 text-center ${className}`}
      style={{ background: generateGradient(book.id) }}
    >
      <h3 className="line-clamp-4 font-serif text-sm font-bold text-white leading-snug drop-shadow-md">
        {book.title}
      </h3>
      {book.authors.length > 0 && (
        <p className="mt-2 line-clamp-2 text-xs font-medium text-white/80">
          {book.authors[0].name}
        </p>
      )}
    </div>
  );
};

export default CoverFallback;
