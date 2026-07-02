import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, BookOpen } from 'lucide-react';
import WaveLogo from './WaveLogo';

interface HeaderProps {
  cartCount: number;
  cartBooks: any[];
  onSearch: (query: string) => void;
  onRemoveFromCart: (id: number | string) => void;
  onReadBook: (book: any) => void;
}

const Header: React.FC<HeaderProps> = ({ cartCount, cartBooks, onSearch, onRemoveFromCart, onReadBook }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCartPreview, setShowCartPreview] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 shadow-sm safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <WaveLogo size="md" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                BlueLeaf
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#categories" className="text-gray-700 hover:text-blue-600 transition-colors">Categories</a>
              <a href="#trending" className="text-gray-700 hover:text-blue-600 transition-colors">Bestsellers</a>
              <a href="#deals" className="text-gray-700 hover:text-blue-600 transition-colors">Deals</a>
              <a href="#why-us" className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
            </nav>

            {/* Search & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-gray-100 rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                <Search className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1 sm:mr-2" />
                <input
                  type="text"
                  placeholder="Search free books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs sm:text-sm w-32 sm:w-48"
                />
                <button type="submit" className="text-blue-600 hover:text-blue-800 ml-1 sm:ml-2">
                  <Search className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </form>
              
              <button 
                onClick={() => setShowCartPreview(!showCartPreview)}
                className="relative p-1.5 sm:p-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button className="p-1.5 sm:p-2 text-gray-700 hover:text-blue-600 transition-colors hidden sm:block">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-1.5 sm:p-2 text-gray-700"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 animate-slide-up">
              <div className="flex flex-col space-y-3">
                <a href="#categories" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors">Categories</a>
                <a href="#trending" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors">Bestsellers</a>
                <a href="#deals" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors">Deals</a>
                <a href="#why-us" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-blue-600 transition-colors">About</a>
                <form onSubmit={handleSearch} className="sm:hidden flex items-center bg-gray-100 rounded-full px-4 py-2 mt-4">
                  <Search className="w-4 h-4 text-gray-500 mr-2" />
                  <input
                    type="text"
                    placeholder="Search free books..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-sm flex-1"
                  />
                  <button type="submit" className="text-blue-600 hover:text-blue-800 ml-2">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Cart Preview Dropdown */}
      {showCartPreview && (
        <div className="fixed top-16 sm:top-20 right-2 sm:right-8 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 p-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="font-semibold text-sm">Your Cart</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{cartCount}</span>
              </div>
              <button
                onClick={() => setShowCartPreview(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-80 overflow-y-auto">
            {cartBooks.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Your cart is empty</p>
              </div>
            ) : (
              <div className="p-2">
                {cartBooks.map((book, index) => (
                  <div
                    key={`${book.id}-${index}`}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <img
                      src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/50x70?text=No+Cover'}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x70?text=No+Cover';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">{book.title}</h4>
                      <p className="text-xs text-gray-500 truncate">
                        {book.authors?.map(a => a.name).join(', ') || 'Unknown'}
                      </p>
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">FREE</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => {
                          onReadBook(book);
                          setShowCartPreview(false);
                        }}
                        className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        <BookOpen className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onRemoveFromCart(book.id)}
                        className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartBooks.length > 0 && (
            <div className="border-t border-gray-100 p-3 bg-gray-50">
              <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-2 rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-green-600 transition-all">
                Read All ({cartCount} books)
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Header;