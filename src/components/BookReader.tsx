import React, { useState, useEffect } from 'react';
import { X, BookOpen, Loader2, Settings, Moon, Sun, Minus, Plus } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
  download_count: number;
  subjects: string[];
  source: 'gutendex' | 'openlibrary';
}

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

const BookReader: React.FC<BookReaderProps> = ({ book, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchContent();
  }, [book]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const textUrl = book.formats?.['text/plain'];
      if (textUrl && book.source === 'gutendex') {
        const response = await fetch(textUrl);
        const text = await response.text();
        // Take first 100000 characters for display
        const truncated = text.substring(0, 100000);
        setContent(truncated);
      } else {
        setContent(getFallbackContent());
      }
    } catch (error) {
      setContent(getFallbackContent());
    }
    setLoading(false);
  };

  const getFallbackContent = () => {
    return `
${book.title}

by ${book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This book is available from Project Gutenberg.

To read the full text, please visit:
${book.formats?.['text/html'] || 'https://www.gutenberg.org'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

About this book:

${book.subjects?.slice(0, 5).join(' • ') || 'Classic Literature'}

Total Downloads: ${book.download_count?.toLocaleString() || 'N/A'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for using BlueLeaf Books!
All books are provided by Project Gutenberg.
    `;
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-200'} px-3 sm:px-6 py-3 flex items-center justify-between shadow-sm`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className={`p-2 rounded-full flex-shrink-0 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h3 className={`font-semibold text-sm sm:text-base truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {book.title}
            </h3>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
              {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-700'} transition-colors`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`${darkMode ? 'bg-gray-800 border-b border-gray-700' : 'bg-gray-50 border-b border-gray-200'} px-4 py-3`}>
          <div className="max-w-3xl mx-auto flex items-center justify-between flex-wrap gap-3">
            {/* Font Size */}
            <div className="flex items-center gap-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Font Size:</span>
              <button
                onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                className={`p-1.5 rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className={`text-sm font-medium w-12 text-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {fontSize}px
              </span>
              <button
                onClick={() => setFontSize(prev => Math.min(28, prev + 2))}
                className={`p-1.5 rounded ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-100'} transition-colors`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Dark Mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-yellow-500 text-gray-900' 
                  : 'bg-gray-800 text-white'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${darkMode ? 'bg-gray-900' : 'bg-amber-50'}`}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading book...</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-4 sm:p-8 lg:p-12">
            {/* Book Cover */}
            <div className="flex justify-center mb-6">
              <img
                src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/200x300?text=No+Cover'}
                alt={book.title}
                className="w-32 h-48 sm:w-40 sm:h-60 object-cover rounded-lg shadow-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=No+Cover';
                }}
              />
            </div>

            {/* Book Title */}
            <div className="text-center mb-8">
              <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-amber-900'}`}>
                {book.title}
              </h1>
              <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-amber-700'}`}>
                by {book.authors?.map(a => a.name).join(', ') || 'Unknown Author'}
              </p>
              {book.download_count > 0 && (
                <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-amber-600'}`}>
                  {book.download_count.toLocaleString()} downloads from Project Gutenberg
                </p>
              )}
            </div>

            {/* Divider */}
            <div className={`border-t mb-8 ${darkMode ? 'border-gray-700' : 'border-amber-200'}`}></div>

            {/* Book Text */}
            <pre
              className={`whitespace-pre-wrap font-serif leading-relaxed ${darkMode ? 'text-gray-200' : 'text-amber-900'}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {content}
            </pre>

            {/* Attribution */}
            <div className={`mt-12 pt-6 border-t text-center ${darkMode ? 'border-gray-700' : 'border-amber-200'}`}>
              <p className={`text-sm mb-4 ${darkMode ? 'text-gray-400' : 'text-amber-700'}`}>
                This book is provided by Project Gutenberg
              </p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <img 
                  src="https://www.gutenberg.org/gutenberg.png" 
                  alt="Project Gutenberg" 
                  className="h-6"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <a
                href={book.formats?.['text/html'] || `https://www.gutenberg.org/ebooks/${book.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                  darkMode 
                    ? 'bg-blue-600 text-white hover:bg-blue-500' 
                    : 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600'
                }`}
              >
                <BookOpen className="w-5 h-5" />
                View on Project Gutenberg
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookReader;