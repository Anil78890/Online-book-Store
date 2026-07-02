import React, { useState, useEffect } from 'react';
import { Clock, Flame, BookOpen } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

interface DealOfTheDayProps {
  addToCart: (book?: Book) => void;
  onReadBook: (book: Book) => void;
}

const DealOfTheDay: React.FC<DealOfTheDayProps> = ({ addToCart, onReadBook }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 6,
    minutes: 42,
    seconds: 18
  });
  const [featuredBooks, setFeaturedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDealBooks();
  }, []);

  const fetchDealBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://gutendex.com/books/?search=classic');
      const data = await response.json();
      if (data.results) {
        setFeaturedBooks(data.results.slice(0, 3).map((book: any) => ({
          id: book.id,
          title: book.title,
          authors: book.authors || [],
          formats: book.formats || {},
          download_count: book.download_count || 0,
          subjects: book.subjects || [],
          source: 'gutendex'
        })));
      }
    } catch (error) {
      console.error('Error fetching deal books:', error);
    }
    setLoading(false);
  };

  const originalPrices = [699, 799, 599];
  const salePrices = [199, 249, 179];

  return (
    <section id="deals" className="py-8 sm:py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm font-semibold">LIMITED TIME OFFER</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Today Only: Buy 2 Get 1 Free
          </h2>
          
          <p className="text-sm sm:text-lg text-blue-100 mb-4 sm:mb-6 max-w-xl mx-auto">
            Don't miss out on this incredible deal — grab your favorites before time runs out!
          </p>

          {/* Countdown Timer */}
          <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-6 sm:mb-8">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm sm:text-lg font-medium">Ends in:</span>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[45px] sm:min-w-[60px]">
                <div className="text-lg sm:text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-xs">Hours</div>
              </div>
              <span className="text-lg sm:text-2xl">:</span>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[45px] sm:min-w-[60px]">
                <div className="text-lg sm:text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-xs">Minutes</div>
              </div>
              <span className="text-lg sm:text-2xl">:</span>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 min-w-[45px] sm:min-w-[60px]">
                <div className="text-lg sm:text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-xs">Seconds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Books */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {featuredBooks.map((book, index) => (
              <div key={book.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="mb-3 sm:mb-4">
                  <img
                    src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300?text=No+Cover'}
                    alt={book.title}
                    className="w-20 h-28 sm:w-24 sm:h-32 object-cover rounded-lg mx-auto shadow-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
                    }}
                  />
                </div>
                
                <h3 className="font-semibold text-white mb-1 sm:mb-2 line-clamp-2 text-sm sm:text-base">{book.title}</h3>
                <p className="text-xs sm:text-sm text-blue-100 mb-2 sm:mb-3">
                  {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
                </p>
                
                <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
                  <span className="text-lg sm:text-xl font-bold text-white">Free</span>
                  <span className="text-xs sm:text-sm text-blue-200 line-through">₹{originalPrices[index]}</span>
                </div>
                
                <button 
                  onClick={() => onReadBook(book)}
                  className="w-full bg-white text-blue-600 py-2 px-3 sm:px-4 rounded-lg font-semibold text-sm sm:text-base hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4" />
                  Read Now
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 sm:mt-8">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-block bg-white text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-base sm:text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Browse All Books
          </button>
        </div>
      </div>
    </section>
  );
};

export default DealOfTheDay;