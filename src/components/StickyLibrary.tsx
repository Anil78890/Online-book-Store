import { Library } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StickyLibraryProps {
  readingListCount: number;
}

const StickyLibrary = ({ readingListCount }: StickyLibraryProps) => {
  if (readingListCount === 0) return null;

  return (
    <Link
      to="/search"
      className="focus-ring fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-2xl transition hover:bg-blue-700"
      aria-label={`${readingListCount} books saved in your reading library`}
    >
      <Library className="h-5 w-5" aria-hidden="true" />
      {readingListCount} saved
    </Link>
  );
};

export default StickyLibrary;
