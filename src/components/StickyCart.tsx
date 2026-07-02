import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface StickyCartProps {
  cartCount: number;
}

const StickyCart: React.FC<StickyCartProps> = ({ cartCount }) => {
  return (
    <>
      {/* Sticky Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 safe-area-bottom">
          <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 group">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="bg-white text-blue-600 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs sm:text-sm font-bold ml-1.5 sm:ml-2 group-hover:scale-110 transition-transform">
                {cartCount}
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default StickyCart;