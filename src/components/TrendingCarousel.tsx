import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, BookOpen, TrendingUp, Star } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

interface TrendingCarouselProps {
  addToCart: (book?: Book) => void;
  onReadBook: (book: Book) => void;
}

const TrendingCarousel: React.FC<TrendingCarouselProps> = ({ addToCart, onReadBook }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<(number | string)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // INR prices based on download count
  const prices = [
    { original: 599, sale: 199 },
    { original: 499, sale: 149 },
    { original: 799, sale: 249 },
    { original: 399, sale: 99 },
    { original: 699, sale: 179 },
    { original: 549, sale: 159 },
    { original: 899, sale: 299 },
    { original: 349, sale: 89 },
    { original: 449, sale: 129 },
    { original: 649, sale: 189 },
    { original: 579, sale: 169 },
    { original: 749, sale: 229 }
  ];

  useEffect(() => {
    fetchTrendingBooks();
  }, []);

  const fetchTrendingBooks = async () => {
    setLoading(true);
    try {
      // Fetch trending/popular books
      const response = await fetch('https://gutendex.com/books/?sort=popular');
      const data = await response.json();
      if (data.results) {
        setBooks(data.results.map((book: any, index: number) => ({
          id: book.id,
          title: book.title,
          authors: book.authors || [],
          formats: book.formats || {},
          download_count: book.download_count || 0,
          subjects: book.subjects || [],
          source: 'gutendex',
          priceIndex: index % prices.length
        })));
      }
    } catch (error) {
      console.error('Error fetching trending books:', error);
    }
    setLoading(false);
  };

  const handleAddToCart = (book: Book) => {
    setAddedToCart(prev => [...prev, book.id]);
    addToCart(book);
    setTimeout(() => {
      setAddedToCart(prev => prev.filter(id => id !== book.id));
    }, 2000);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-16 bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              <span className="text-sm font-semibold text-green-400 uppercase tracking-wide">Trending Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Hot Books This Week
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mt-1">
              Most popular reads — grab them before they're gone!
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 sm:p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 sm:p-3 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Circular Carousel */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book, index) => (
            <div
              key={`${book.source}-${book.id}`}
              className="flex-none w-[180px] sm:w-[220px] md:w-[250px] snap-center"
            >
              <div className="bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-750 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 group">
                {/* Circular Book Cover */}
                <div className="relative p-4 sm:p-6 flex justify-center">
                  <div className="relative">
                    {/* Circular frame */}
                    <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-green-500/50 shadow-lg shadow-green-500/30 group-hover:border-green-400 transition-all duration-300">
                      <img
                        src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300?text=No+Cover'}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
                        }}
                      />
                    </div>
                    
                    {/* Trending badge */}
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-400 to-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                      🔥 #{index + 1}
                    </div>
                  </div>
                </div>

                {/* Book Info */}
                <div className="px-3 sm:px-4 pb-4 sm:pb-6">
                  <h3 className="font-semibold text-white text-sm sm:text-base mb-1 line-clamp-2 text-center min-h-[40px]">
                    {book.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2 text-center line-clamp-1">
                    {book.authors?.map(a => a.name).join(', ') || 'Unknown'}
                  </p>

                  {/* Rating & Downloads */}
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-300">4.{7 + (index % 3)}</span>
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-400">{(book.download_count / 1000).toFixed(0)}K reads</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-lg sm:text-xl font-bold text-green-400">
                      ₹{prices[index % prices.length].sale}
                    </span>
                    <span className="text-xs text-gray-500 line-through">
                      ₹{prices[index % prices.length].original}
                    </span>
                    <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                      {Math.round((1 - prices[index % prices.length].sale / prices[index % prices.length].original) * 100)}% OFF
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onReadBook(book)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                    >
                      <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                      Read
                    </button>
                    <button
                      onClick={() => handleAddToCart(book)}
                      disabled={addedToCart.includes(book.id)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                        addedToCart.includes(book.id)
                          ? 'bg-green-500 text-white'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-400 hover:to-emerald-400'
                      }`}
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                      {addedToCart.includes(book.id) ? 'Added' : 'Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center mt-4 sm:mt-6 gap-2">
          {Array.from({ length: Math.min(8, books.length) }).map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === 0 ? 'bg-green-500 w-6' : 'bg-gray-600'
              }`}
            ></div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingCarousel;