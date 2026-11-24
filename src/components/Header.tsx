import { FormEvent, useEffect, useState } from 'react';
import { BookOpen, Library, Menu, Search, Trash2, X } from 'lucide-react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import type { Book } from '../types/book';
import { getBookAuthors, getBookCover, getBookPath } from '../services/books';
import WaveLogo from './WaveLogo';

interface HeaderProps {
  readingList: Book[];
  onRemoveBook: (book: Book) => void;
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/about', label: 'About' },
  { to: '/sources', label: 'Data Sources' },
];

const Header = ({ readingList, onRemoveBook }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [showLibrary, setShowLibrary] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
    setShowLibrary(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        setShowLibrary(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate(trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : '/search');
  };

  const renderNavLink = ({ to, label }: { to: string; label: string }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) =>
        `focus-ring rounded-full px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-blue-700'}`
      }
    >
      {label}
    </NavLink>
  );

  return (
    <header className="safe-area-top fixed inset-x-0 top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="focus-ring flex items-center gap-2 rounded-full" aria-label="BlueLeaf Books home">
            <WaveLogo size="md" />
            <span className="text-lg font-bold text-gradient sm:text-xl">BlueLeaf Books</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {navLinks.map(renderNavLink)}
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="hidden items-center rounded-full bg-gray-100 px-3 py-2 sm:flex">
              <Search className="mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
              <label className="sr-only" htmlFor="site-search">Search books</label>
              <input
                id="site-search"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search public-domain books"
                className="w-48 bg-transparent text-sm outline-none"
              />
              <button type="submit" className="focus-ring rounded-full p-1 text-blue-700" aria-label="Submit book search">
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => setShowLibrary(previous => !previous)}
              className="focus-ring relative rounded-full p-2 text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
              aria-label={`Open reading library with ${readingList.length} saved books`}
              aria-expanded={showLibrary}
            >
              <Library className="h-5 w-5" aria-hidden="true" />
              {readingList.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green-600 px-1 text-xs font-bold text-white">
                  {readingList.length}
                </span>
              )}
            </button>

            <button
              type="button"
              className="focus-ring rounded-full p-2 text-gray-700 md:hidden"
              onClick={() => setIsMenuOpen(previous => !previous)}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <nav className="flex flex-col gap-2" aria-label="Mobile navigation">
              {navLinks.map(renderNavLink)}
            </nav>
            <form onSubmit={handleSearch} className="mt-4 flex items-center rounded-full bg-gray-100 px-4 py-2 sm:hidden">
              <Search className="mr-2 h-4 w-4 text-gray-500" aria-hidden="true" />
              <label className="sr-only" htmlFor="mobile-site-search">Search books</label>
              <input
                id="mobile-site-search"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search books"
                className="flex-1 bg-transparent text-sm outline-none"
              />
              <button type="submit" className="focus-ring rounded-full p-1 text-blue-700" aria-label="Submit mobile book search">
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        )}
      </div>

      {showLibrary && (
        <aside className="absolute right-3 top-20 z-50 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl" aria-label="Saved reading library">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-green-600 px-4 py-3 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Library className="h-5 w-5" aria-hidden="true" />
              Reading Library
            </div>
            <button type="button" className="focus-ring rounded-full p-1 hover:bg-white/20" onClick={() => setShowLibrary(false)} aria-label="Close reading library">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto p-3">
            {readingList.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-300" aria-hidden="true" />
                Save books to build your personal reading library.
              </div>
            ) : (
              <ul className="space-y-3">
                {readingList.map(book => (
                  <li key={`${book.source}-${book.id}`} className="flex gap-3 rounded-xl p-2 hover:bg-gray-50">
                    <img src={getBookCover(book)} alt="" className="h-16 w-12 rounded object-cover" />
                    <div className="min-w-0 flex-1">
                      <Link to={getBookPath(book)} className="focus-ring line-clamp-2 rounded text-sm font-semibold text-gray-900 hover:text-blue-700">
                        {book.title}
                      </Link>
                      <p className="line-clamp-1 text-xs text-gray-500">{getBookAuthors(book)}</p>
                    </div>
                    <button type="button" onClick={() => onRemoveBook(book)} className="focus-ring rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${book.title} from reading library`}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      )}
    </header>
  );
};

export default Header;
