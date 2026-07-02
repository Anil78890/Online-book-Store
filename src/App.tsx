import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ValueBar from './components/ValueBar';
import FeaturedBooks from './components/FeaturedBooks';
import CategoryTiles from './components/CategoryTiles';
import TrendingCarousel from './components/TrendingCarousel';
import DealOfTheDay from './components/DealOfTheDay';
import WhyChooseUs from './components/WhyChooseUs';
import EmailCapture from './components/EmailCapture';
import StickyCart from './components/StickyCart';
import Footer from './components/Footer';
import SearchResults from './components/SearchResults';
import BookPage from './components/BookPage';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

function App() {
  const [cartCount, setCartCount] = useState(0);
  const [cartBooks, setCartBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [browseMode, setBrowseMode] = useState(false);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'book'>('home');

  useEffect(() => {
    const handlePopState = () => {
      if (!window.location.pathname.startsWith('/book/')) {
        setReadingBook(null);
        setCurrentPage('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const addToCart = useCallback((book?: Book) => {
    setCartCount(prev => prev + 1);
    if (book) setCartBooks(prev => [...prev, book]);
  }, []);

  const removeFromCart = useCallback((id: number | string) => {
    setCartBooks(prev => prev.filter(b => b.id !== id));
    setCartCount(prev => Math.max(0, prev - 1));
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setBrowseMode(false);
    setShowSearch(true);
  }, []);

  const handleBrowseFreeBooks = useCallback(() => {
    setSearchQuery('');
    setBrowseMode(true);
    setShowSearch(true);
  }, []);

  const handleReadBook = useCallback((book: Book) => {
    setReadingBook(book);
    setCurrentPage('book');
    window.history.pushState({}, '', `/book/${book.id}`);
  }, []);

  const handleBackToHome = useCallback(() => {
    setReadingBook(null);
    setCurrentPage('home');
    window.history.pushState({}, '', '/');
  }, []);

  if (currentPage === 'book' && readingBook) {
    return <BookPage book={readingBook} onBack={handleBackToHome} addToCart={(book) => addToCart(book || readingBook)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header cartCount={cartCount} cartBooks={cartBooks} onSearch={handleSearch} onRemoveFromCart={removeFromCart} onReadBook={handleReadBook} />
      <main>
        <HeroSection addToCart={() => {}} onBrowseFreeBooks={handleBrowseFreeBooks} />
        <ValueBar />
        <FeaturedBooks addToCart={addToCart} onReadBook={handleReadBook} />
        <CategoryTiles onReadBook={handleReadBook} />
        <TrendingCarousel addToCart={addToCart} onReadBook={handleReadBook} />
        <DealOfTheDay addToCart={addToCart} onReadBook={handleReadBook} />
        <WhyChooseUs />
        <EmailCapture />
      </main>
      <Footer />
      <StickyCart cartCount={cartCount} />
      {showSearch && <SearchResults searchQuery={searchQuery} browseMode={browseMode} onClose={() => { setShowSearch(false); setBrowseMode(false); }} onReadBook={handleReadBook} />}
    </div>
  );
}

export default App;