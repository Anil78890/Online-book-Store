import React from 'react';
import { X, ShoppingCart, BookOpen, Trash2 } from 'lucide-react';

interface Book {
  id: number | string;
  title: string;
  authors: { name: string }[];
  formats: { 'text/html': string; 'text/plain': string; 'image/jpeg': string };
}

interface CartPreviewProps {
  books: Book[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveBook: (id: number | string) => void;
  onReadBook: (book: Book) => void;
}

const CartPreview: React.FC<CartPreviewProps> = ({ books, isOpen, onClose, onRemoveBook, onReadBook }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      {/* Cart Panel */}
      <div className="relative bg-white w-full sm:w-96 max-h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              <h2 className="font-semibold text-lg">Your Cart</h2>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">{books.length}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="overflow-y-auto max-h-[50vh] p-4">
          {books.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add some books to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {books.map((book, index) => (
                <div
                  key={`${book.id}-${index}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {/* Book Cover */}
                  <img
                    src={book.formats?.['image/jpeg'] || 'https://via.placeholder.com/60x80?text=No+Cover'}
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded-lg shadow-sm"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x80?text=No+Cover';
                    }}
                  />
                  
                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{book.title}</h3>
                    <p className="text-xs text-gray-500 truncate">
                      {book.authors?.map(a => a.name).join(', ') || 'Unknown'}
                    </p>
                    <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      FREE
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => onReadBook(book)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveBook(book.id)}
                      className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {books.length > 0 && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">Total Books:</span>
              <span className="font-bold text-lg text-gray-900">{books.length}</span>
            </div>
            <button className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-green-600 transition-all">
              Read All Books
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPreview;