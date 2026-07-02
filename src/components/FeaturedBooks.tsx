import React, { useState, useEffect, useCallback, memo } from 'react';
import { ShoppingCart, BookOpen, TrendingUp, Star } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

interface FeaturedBooksProps {
  addToCart: (book?: Book) => void;
  onReadBook: (book: Book) => void;
}

const BookCard = memo(({ book, index, onAddToCart, onReadBook, prices, addedToCart }: any) => (
  <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
    <div className="relative h-28 sm:h-40 overflow-hidden bg-gray-100">
      <img
        src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300?text=No+Cover'}
        alt={book.title}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
        }}
      />
      <div className="absolute top-1 left-1 bg-green-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">FREE</div>
      <div className="absolute top-1 right-1 bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[10px] font-bold">
        {Math.round((1 - prices[index % prices.length].sale / prices[index % prices.length].original) * 100)}% OFF
      </div>
    </div>
    <div className="p-2">
      <h3 className="font-semibold text-gray-900 text-xs mb-0.5 line-clamp-2 group-hover:text-blue-600 transition-colors">{book.title}</h3>
      <p className="text-[10px] text-gray-500 mb-1 line-clamp-1">{book.authors?.map((a: any) => a.name).join(', ') || 'Unknown'}</p>
      <div className="flex items-center gap-1 mb-1">
        <Star className="w-2.5 h-2.5 text-yellow-400 fill-current" />
        <span className="text-[10px] text-gray-600">4.{7 + (index % 3)}</span>
      </div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-sm font-bold text-green-600">₹{prices[index % prices.length].sale}</span>
        <span className="text-[10px] text-gray-400 line-through">₹{prices[index % prices.length].original}</span>
      </div>
      <div className="flex gap-1">
        <button onClick={() => onReadBook(book)} className="flex-1 flex items-center justify-center gap-0.5 bg-blue-100 text-blue-700 py-1 px-1.5 rounded text-[10px] font-medium hover:bg-blue-200 transition-colors">
          <BookOpen className="w-2.5 h-2.5" /> Read
        </button>
        <button onClick={() => onAddToCart(book)} disabled={addedToCart} className={`flex-1 flex items-center justify-center gap-0.5 py-1 px-1.5 rounded text-[10px] font-medium transition-all ${addedToCart ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-blue-500 to-green-500 text-white'}`}>
          <ShoppingCart className="w-2.5 h-2.5" /> {addedToCart ? 'Added' : 'Cart'}
        </button>
      </div>
    </div>
  </div>
));

const FeaturedBooks: React.FC<FeaturedBooksProps> = ({ addToCart, onReadBook }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState<(number | string)[]>([]);

  const prices = [
    { original: 599, sale: 199 }, { original: 499, sale: 149 }, { original: 799, sale: 249 },
    { original: 399, sale: 99 }, { original: 699, sale: 179 }, { original: 549, sale: 159 },
    { original: 899, sale: 299 }, { original: 349, sale: 89 }, { original: 449, sale: 129 },
    { original: 649, sale: 189 }, { original: 579, sale: 169 }, { original: 749, sale: 229 }
  ];

  useEffect(() => {
    const controller = new AbortController();
    fetch('https://gutendex.com/books/?sort=popular', { signal: controller.signal })
      .then(r => r.json())
      .then(data => {
        if (data.results) {
          setBooks(data.results.slice(0, 12).map((b: any) => ({
            id: b.id, title: b.title, authors: b.authors || [], formats: b.formats || {},
            download_count: b.download_count || 0, subjects: b.subjects || [], source: 'gutendex'
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const handleAddToCart = useCallback((book: Book) => {
    setAddedToCart(prev => [...prev, book.id]);
    addToCart(book);
    setTimeout(() => setAddedToCart(prev => prev.filter(id => id !== book.id)), 2000);
  }, [addToCart]);

  if (loading) return (
    <section className="py-6 sm:py-12 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </section>
  );

  return (
    <section className="py-6 sm:py-12 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Featured</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Top Free Books</h2>
          </div>
          <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">100% Free</div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {books.map((book, index) => (
            <BookCard key={`${book.id}`} book={book} index={index} onAddToCart={handleAddToCart} onReadBook={onReadBook} prices={prices} addedToCart={addedToCart.includes(book.id)} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBooks;