import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  addToCart: () => void;
  onBrowseFreeBooks: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ addToCart, onBrowseFreeBooks }) => {
  return (
    <section className="relative min-h-[600px] sm:min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-green-500">
      {/* Animated Background Elements - Hidden on small screens */}
      <div className="absolute inset-0 hidden sm:block">
        <div className="absolute top-20 left-10 w-16 h-20 bg-white/10 rounded transform rotate-12 animate-float"></div>
        <div className="absolute top-40 right-20 w-12 h-16 bg-white/10 rounded transform -rotate-12 animate-float-delayed"></div>
        <div className="absolute bottom-40 left-20 w-20 h-24 bg-white/10 rounded transform rotate-6 animate-float"></div>
        <div className="absolute bottom-60 right-40 w-14 h-18 bg-white/10 rounded transform -rotate-6 animate-float-delayed"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-16 pb-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4 sm:mb-6">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
              <span className="text-xs sm:text-sm font-medium text-blue-100 uppercase tracking-wide">
                Discover Your Next Adventure
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
              Your Next Favorite Book 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">
                Awaits — at a Price You'll Love
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
              From rare finds to chart-toppers, discover stories that inspire — and save up to{' '}
              <span className="font-bold text-green-300">80%</span>. Free delivery, no minimum order.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center lg:justify-start">
              <button 
                onClick={() => document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center group"
              >
                Shop Now
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={onBrowseFreeBooks}
                className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-all duration-200 text-center"
              >
                Browse Free Books
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 text-center max-w-md mx-auto lg:mx-0">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">500K+</div>
                <div className="text-xs sm:text-sm text-blue-200">Happy Readers</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">50K+</div>
                <div className="text-xs sm:text-sm text-blue-200">Books Available</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">4.8★</div>
                <div className="text-xs sm:text-sm text-blue-200">Customer Rating</div>
              </div>
            </div>
          </div>

          {/* Right Content - Book Stack */}
          <div className="relative hidden sm:block">
            <div className="relative z-10">
              {/* Main book stack */}
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/159866/books-book-pages-read-literature-159866.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Stack of books"
                  className="w-full max-w-sm md:max-w-md mx-auto rounded-2xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500"
                />
                <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-green-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-lg shadow-lg animate-pulse">
                  Up to 80% OFF
                </div>
              </div>

              {/* Floating books */}
              <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 w-16 h-22 sm:w-24 sm:h-32 bg-white rounded shadow-lg transform -rotate-12 animate-float opacity-90 hidden md:block">
                <img
                  src="https://images.pexels.com/photos/1130980/pexels-photo-1130980.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Book cover"
                  className="w-full h-full object-cover rounded"
                />
              </div>
              
              <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 w-14 h-20 sm:w-20 sm:h-28 bg-white rounded shadow-lg transform rotate-12 animate-float-delayed opacity-90 hidden md:block">
                <img
                  src="https://images.pexels.com/photos/2177482/pexels-photo-2177482.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Book cover"
                  className="w-full h-full object-cover rounded"
                />
              </div>

              <div className="absolute top-10 -right-6 sm:-right-8 w-16 h-22 sm:w-22 sm:h-30 bg-white rounded shadow-lg transform rotate-6 animate-float opacity-90 hidden md:block">
                <img
                  src="https://images.pexels.com/photos/1855349/pexels-photo-1855349.jpeg?auto=compress&cs=tinysrgb&w=200"
                  alt="Book cover"
                  className="w-full h-full object-cover rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
            fill="#F7F5F2"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;