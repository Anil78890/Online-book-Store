import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, Settings, Moon, Sun, Minus, Plus, ShoppingCart, Share2 } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

interface BookPageProps {
  book: Book;
  onBack: () => void;
  addToCart: (book?: Book) => void;
}

const BookPage: React.FC<BookPageProps> = ({ book, onBack, addToCart }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchContent();
    window.history.pushState({}, '', `/book/${book.id}`);
    
    return () => {
      window.history.pushState({}, '', '/');
    };
  }, [book]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      // Try fetching plain text from Gutenberg
      const textUrl = book.formats?.['text/plain'];
      if (textUrl && book.source === 'gutendex') {
        const response = await fetch(textUrl);
        if (response.ok) {
          const text = await response.text();
          const truncated = text.substring(0, 80000);
          setContent(truncated);
          setLoading(false);
          return;
        }
      }
      // Fallback
      setContent(getFallbackContent());
    } catch (error) {
      // CORS might block - show fallback with link
      setContent(getFallbackContent());
    }
    setLoading(false);
  };

  const getFallbackContent = () => {
    const readUrl = book.formats?.['text/html'] || `https://www.gutenberg.org/ebooks/${book.id}`;
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                              ${book.title}

                         by ${book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


  Welcome to "${book.title}" on BlueLeaf Books!

  This classic book is available to read for free through 
  Project Gutenberg — the oldest digital library.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📚  BOOK DETAILS
  ─────────────────────────────────────
  Title:       ${book.title}
  Author:      ${book.authors?.map(a => a.name).join(', ') || 'Unknown'}
  Downloads:   ${book.download_count?.toLocaleString() || 'N/A'}
  Status:      Public Domain (Free to Read)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  📖  GENRES & TAGS
  ─────────────────────────────────────
  ${book.subjects?.slice(0, 8).map(s => `  • ${s}`).join('\n') || '  • Classic Literature'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  💡  ABOUT THIS BOOK
  ─────────────────────────────────────
  This book has been read by over ${book.download_count?.toLocaleString() || 'thousands of'} people 
  worldwide. It is part of the Project Gutenberg collection, 
  which provides free access to public domain literature.

  You can read the full text by clicking the button below 
  or visiting Project Gutenberg directly.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  🌐  READ FULL BOOK
  ─────────────────────────────────────
  
  Click the button below to read the complete text:

  ${readUrl}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Thank you for choosing BlueLeaf Books!
  All books are provided free by Project Gutenberg.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
  };

  const handleAddToCart = () => {
    setAddedToCart(true);
    addToCart(book);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: book.title,
        text: `Read "${book.title}" by ${book.authors?.map(a => a.name).join(', ') || 'Unknown'} on BlueLeaf Books`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  };

  const readUrl = book.formats?.['text/html'] || `https://www.gutenberg.org/ebooks/${book.id}`;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-amber-50'}`}>
      {/* Sticky Header */}
      <div className={`sticky top-0 z-40 ${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'} shadow-sm`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className={`font-semibold text-sm sm:text-base truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {book.title}
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className={`${darkMode ? 'bg-gray-750 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'} px-4 py-3`}>
            <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Font:</span>
                <button
                  onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                  className={`p-1.5 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className={`text-sm font-medium w-12 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>{fontSize}px</span>
                <button
                  onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
                  className={`p-1.5 rounded ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'}`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  darkMode ? 'bg-yellow-500 text-gray-900' : 'bg-gray-800 text-white'
                }`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {darkMode ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading book...</p>
          </div>
        ) : (
          <>
            {/* Book Cover */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <img
                  src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/300x450?text=No+Cover'}
                  alt={book.title}
                  className="w-40 h-60 sm:w-48 sm:h-72 object-cover rounded-lg shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Cover';
                  }}
                />
                <div className="absolute -bottom-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  FREE
                </div>
              </div>
            </div>

            {/* Book Info */}
            <div className="text-center mb-8">
              <h1 className={`text-2xl sm:text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-amber-900'}`}>
                {book.title}
              </h1>
              <p className={`text-lg sm:text-xl mb-4 ${darkMode ? 'text-gray-400' : 'text-amber-700'}`}>
                by {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                {book.download_count > 0 && (
                  <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-amber-600'}`}>
                    {book.download_count.toLocaleString()} reads
                  </span>
                )}
                <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-amber-600'}`}>
                  Public Domain
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                    addedToCart
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {addedToCart ? 'Added to Cart!' : 'Add to Cart'}
                </button>
                <a
                  href={readUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                >
                  <BookOpen className="w-5 h-5" />
                  Read Full Book
                </a>
              </div>
            </div>

            <div className={`border-t mb-8 ${darkMode ? 'border-gray-700' : 'border-amber-200'}`}></div>

            {/* Book Content */}
            <div id="book-content" className="mb-12">
              <pre
                className={`whitespace-pre-wrap font-serif leading-relaxed ${darkMode ? 'text-gray-200' : 'text-amber-900'}`}
                style={{ fontSize: `${fontSize}px` }}
              >
                {content}
              </pre>
            </div>

            {/* Bottom Read Button */}
            <div className="text-center mb-12">
              <a
                href={readUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 transition-all shadow-lg text-lg"
              >
                <BookOpen className="w-6 h-6" />
                Read Complete Book on Project Gutenberg
              </a>
            </div>

            {/* Attribution */}
            <div className={`py-8 border-t text-center ${darkMode ? 'border-gray-700' : 'border-amber-200'}`}>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-amber-700'}`}>
                Books provided by Project Gutenberg
              </p>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-amber-600'}`}>
                All books are in the public domain. Free to read, share, and distribute.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar */}
      <div className={`sticky bottom-0 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'} py-3 px-4`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-700'} transition-colors`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <a
            href={readUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-blue-500 to-green-500 text-white"
          >
            <BookOpen className="w-4 h-4" />
            Read Full Book
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookPage;