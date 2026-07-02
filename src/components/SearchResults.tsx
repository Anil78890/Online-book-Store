import React, { useState, useEffect } from 'react';
import { X, BookOpen, ExternalLink, Loader2, Search as SearchIcon } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  languages: string[];
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

interface SearchResultsProps {
  searchQuery: string;
  browseMode: boolean;
  onClose: () => void;
  onReadBook: (book: Book) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ searchQuery, browseMode, onClose, onReadBook }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [currentQuery, setCurrentQuery] = useState(searchQuery);

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'fiction', label: 'Fiction' },
    { id: 'non-fiction', label: 'Non-Fiction' },
    { id: 'romance', label: 'Romance' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'science', label: 'Science' },
    { id: 'history', label: 'History' },
    { id: 'philosophy', label: 'Philosophy' }
  ];

  // Popular search suggestions
  const popularSearches = [
    'adventure', 'romance', 'mystery', 'science fiction',
    'classic literature', 'poetry', 'philosophy', 'history',
    'self help', 'biography', 'fantasy', 'horror'
  ];

  useEffect(() => {
    if (browseMode) {
      fetchTopBooks();
    } else if (searchQuery) {
      fetchBooks(searchQuery);
    }
  }, [browseMode, searchQuery]);

  const fetchBooks = async (query: string) => {
    setLoading(true);
    const allBooks: Book[] = [];

    // Fetch from Gutendex (Project Gutenberg)
    try {
      const gutendexResponse = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`);
      const gutendexData = await gutendexResponse.json();
      if (gutendexData.results) {
        gutendexData.results.forEach((book: any) => {
          allBooks.push({
            id: book.id,
            title: book.title,
            authors: book.authors || [],
            formats: book.formats || {},
            languages: book.languages || [],
            download_count: book.download_count || 0,
            subjects: book.subjects || [],
            source: 'gutendex'
          });
        });
      }
    } catch (error) {
      console.error('Gutendex error:', error);
    }

    // Fetch from Open Library
    try {
      const openLibResponse = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,first_publish_year,isbn,cover_i,subject`);
      const openLibData = await openLibResponse.json();
      if (openLibData.docs) {
        openLibData.docs.forEach((book: any) => {
          if (book.title) {
            allBooks.push({
              id: book.key || Math.random(),
              title: book.title,
              authors: book.author_name ? book.author_name.map((name: string) => ({ name })) : [],
              formats: {
                'text/html': `https://openlibrary.org${book.key}`,
                'text/plain': `https://openlibrary.org${book.key}`,
                'image/jpeg': book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : ''
              },
              languages: [],
              download_count: 0,
              subjects: book.subject || [],
              source: 'openlibrary'
            });
          }
        });
      }
    } catch (error) {
      console.error('Open Library error:', error);
    }

    setBooks(allBooks);
    setLoading(false);
  };

  const fetchTopBooks = async () => {
    setLoading(true);
    const allBooks: Book[] = [];

    // Fetch top books from Gutendex
    try {
      const response = await fetch('https://gutendex.com/books/?sort=popular');
      const data = await response.json();
      if (data.results) {
        data.results.slice(0, 20).forEach((book: any) => {
          allBooks.push({
            id: book.id,
            title: book.title,
            authors: book.authors || [],
            formats: book.formats || {},
            languages: book.languages || [],
            download_count: book.download_count || 0,
            subjects: book.subjects || [],
            source: 'gutendex'
          });
        });
      }
    } catch (error) {
      console.error('Gutendex error:', error);
    }

    // Fetch trending from Open Library
    try {
      const response = await fetch('https://openlibrary.org/subjects/fiction.json?limit=10');
      const data = await response.json();
      if (data.works) {
        data.works.forEach((book: any) => {
          allBooks.push({
            id: book.key || Math.random(),
            title: book.title,
            authors: book.authors ? book.authors.map((a: any) => ({ name: a.name || 'Unknown' })) : [],
            formats: {
              'text/html': `https://openlibrary.org${book.key}`,
              'text/plain': `https://openlibrary.org${book.key}`,
              'image/jpeg': book.cover_id ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg` : ''
            },
            languages: [],
            download_count: book.edition_count || 0,
            subjects: book.subjects || [],
            source: 'openlibrary'
          });
        });
      }
    } catch (error) {
      console.error('Open Library error:', error);
    }

    setBooks(allBooks);
    setLoading(false);
  };

  const filterBooks = () => {
    if (activeFilter === 'all') return books;
    return books.filter(book =>
      book.subjects?.some(subject =>
        subject.toLowerCase().includes(activeFilter)
      ) ||
      book.title.toLowerCase().includes(activeFilter)
    );
  };

  const getBookCover = (book: Book) => {
    return book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300?text=No+Cover';
  };

  const getReadLink = (book: Book) => {
    return book.formats?.['text/html'] || book.formats?.['text/plain'] || '#';
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      fetchBooks(currentQuery.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentQuery(suggestion);
    fetchBooks(suggestion);
  };

  const filteredBooks = filterBooks();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end sm:items-start justify-center sm:pt-20 px-0 sm:px-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-5xl w-full max-h-[92vh] sm:max-h-[85vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">
              {browseMode ? 'Browse Free Books' : 'Search Results'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
          
          {/* Search bar in header */}
          <form onSubmit={handleNewSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Search any book, author, or topic..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-gray-900 text-sm focus:ring-2 focus:ring-white outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-blue-600 px-4 sm:px-6 py-2 rounded-full font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Search
            </button>
          </form>

          {browseMode && (
            <p className="text-sm text-blue-100 mt-3">
              Showing top free books from multiple sources
            </p>
          )}
          {!browseMode && (
            <p className="text-sm text-blue-100 mt-3">
              Found <span className="font-bold text-white">{books.length}</span> free books for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200 px-4 sm:px-6 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {filters.map(filter => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Popular searches when no query */}
        {browseMode && !loading && books.length === 0 && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors capitalize"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="overflow-y-auto max-h-[55vh] sm:max-h-[50vh] p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-500 text-sm">Searching multiple book sources...</p>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">No books found</p>
              <p className="text-gray-400 text-sm mt-2">Try different keywords or browse popular searches</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredBooks.map((book, index) => (
                <div
                  key={`${book.source}-${book.id}-${index}`}
                  className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                >
                  <div className="relative h-36 sm:h-48 overflow-hidden bg-gray-100">
                    <img
                      src={getBookCover(book)}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
                      }}
                    />
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-green-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold">
                      FREE
                    </div>
                    <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs">
                      {book.source === 'gutendex' ? 'Gutenberg' : 'Open Library'}
                    </div>
                  </div>

                  <div className="p-2 sm:p-3">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                      {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
                    </p>
                    {book.download_count > 0 && (
                      <p className="text-xs text-gray-400 mb-2 hidden sm:block">
                        {book.download_count.toLocaleString()} downloads
                      </p>
                    )}

                    <button
                      onClick={() => {
                        onClose();
                        onReadBook(book);
                      }}
                      className="w-full flex items-center justify-center gap-1 bg-gradient-to-r from-blue-500 to-green-500 text-white py-1.5 px-2 rounded-lg font-medium text-xs hover:from-blue-600 hover:to-green-600 transition-all duration-200 transform hover:scale-105"
                    >
                      <BookOpen className="w-3 h-3" />
                      Read Free
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 sm:px-6 py-3 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Powered by Project Gutenberg & Open Library • All books are free
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;