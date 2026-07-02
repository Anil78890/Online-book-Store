import React, { useState } from 'react';
import { ArrowRight, X, BookOpen, ExternalLink, Loader2 } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

interface CategoryTilesProps {
  onReadBook: (book: Book) => void;
}

const CategoryTiles: React.FC<CategoryTilesProps> = ({ onReadBook }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    {
      title: 'Self-Help & Motivation',
      description: 'Transform your mindset',
      image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=600',
      bookCount: '2,500+ books',
      gradient: 'from-purple-500 to-blue-500',
      searchQuery: 'self help motivation'
    },
    {
      title: 'Fiction Favorites',
      description: 'Escape into new worlds',
      image: 'https://images.pexels.com/photos/1130975/pexels-photo-1130975.jpeg?auto=compress&cs=tinysrgb&w=600',
      bookCount: '5,200+ books',
      gradient: 'from-blue-500 to-teal-500',
      searchQuery: 'fiction novel'
    },
    {
      title: 'Non-Fiction Greats',
      description: 'Learn something new',
      image: 'https://images.pexels.com/photos/1370295/pexels-photo-1370295.jpeg?auto=compress&cs=tinysrgb&w=600',
      bookCount: '3,100+ books',
      gradient: 'from-teal-500 to-green-500',
      searchQuery: 'history science education'
    },
    {
      title: 'Crime & Thrillers',
      description: 'Edge-of-your-seat stories',
      image: 'https://images.pexels.com/photos/2177482/pexels-photo-2177482.jpeg?auto=compress&cs=tinysrgb&w=600',
      bookCount: '1,800+ books',
      gradient: 'from-red-500 to-pink-500',
      searchQuery: 'mystery thriller detective'
    },
    {
      title: 'Romance Reads',
      description: 'Love stories that captivate',
      image: 'https://images.pexels.com/photos/1855349/pexels-photo-1855349.jpeg?auto=compress&cs=tinysrgb&w=600',
      bookCount: '2,900+ books',
      gradient: 'from-pink-500 to-rose-500',
      searchQuery: 'romance love'
    },
    {
      title: "Children's Books",
      description: 'Spark young imaginations',
      image: 'https://images.pexels.com/photos/1370298/pexels-photo-1370298.jpeg?auto=compress&cs=tinysrgb&w=600',
      bookCount: '4,200+ books',
      gradient: 'from-yellow-500 to-orange-500',
      searchQuery: 'children fairy tales'
    }
  ];

  const fetchBooks = async (query: string) => {
    const allBooks: Book[] = [];

    // Gutendex
    try {
      const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.results) {
        data.results.slice(0, 6).forEach((book: any) => {
          allBooks.push({
            id: book.id,
            title: book.title,
            authors: book.authors || [],
            formats: book.formats || {},
            download_count: book.download_count || 0,
            subjects: book.subjects || [],
            source: 'gutendex'
          });
        });
      }
    } catch (error) {
      console.error('Gutendex error:', error);
    }

    // Open Library
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6&fields=key,title,author_name,cover_i,subject`);
      const data = await response.json();
      if (data.docs) {
        data.docs.forEach((book: any) => {
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

    return allBooks;
  };

  const handleCategoryClick = async (category: typeof categories[0]) => {
    setSelectedCategory(category.title);
    setLoading(true);
    const fetchedBooks = await fetchBooks(category.searchQuery);
    setBooks(fetchedBooks);
    setLoading(false);
  };

  return (
    <>
      <section id="categories" className="py-8 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Explore by Category
            </h2>
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Discover your next great read from our carefully curated collection
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                onClick={() => handleCategoryClick(category)}
                className="group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="relative h-32 sm:h-64">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-80 group-hover:opacity-70 transition-opacity duration-300`}></div>
                </div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-6 text-white">
                  <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 opacity-90">{category.bookCount}</p>
                    <h3 className="text-sm sm:text-xl font-bold mb-1 sm:mb-2">{category.title}</h3>
                    <p className="text-xs sm:text-sm opacity-90 mb-2 sm:mb-4 hidden sm:block">{category.description}</p>
                    
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-xs sm:text-sm font-medium mr-1 sm:mr-2">Shop Now</span>
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Books Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-end sm:items-start justify-center sm:pt-20 px-0 sm:px-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-xl sm:text-2xl font-bold">{selectedCategory}</h2>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <p className="text-sm sm:text-base text-blue-100">
                Free books from Gutenberg & Open Library
              </p>
            </div>

            {/* Results */}
            <div className="overflow-y-auto max-h-[70vh] sm:max-h-[65vh] p-4 sm:p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 animate-spin mb-4" />
                  <p className="text-gray-500 text-sm">Loading books...</p>
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-base sm:text-lg">No books found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {books.map((book, index) => (
                    <div
                      key={`${book.source}-${book.id}-${index}`}
                      className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                    >
                      <div className="relative h-32 sm:h-44 overflow-hidden bg-gray-100">
                        <img
                          src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300?text=No+Cover'}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
                          }}
                        />
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-green-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-bold">
                          FREE
                        </div>
                        <div className="absolute bottom-1 left-1 bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs">
                          {book.source === 'gutendex' ? 'Gutenberg' : 'Open Library'}
                        </div>
                      </div>

                      <div className="p-2 sm:p-3">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                          {book.authors?.map((a: any) => a.name).join(', ') || 'Unknown Author'}
                        </p>

                        <button
                          onClick={() => {
                            setSelectedCategory(null);
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
                Powered by Project Gutenberg & Open Library
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoryTiles;