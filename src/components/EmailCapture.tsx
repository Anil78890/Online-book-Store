import React, { useState } from 'react';
import { Mail, Gift } from 'lucide-react';

const EmailCapture: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail('');
    }
  };

  return (
    <section className="py-8 sm:py-16 bg-gradient-to-r from-blue-50 via-purple-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 md:p-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-4 sm:mb-6">
            <Gift className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Be the First to Know About Flash Sales
          </h2>
          
          <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Sign up for exclusive deals & new arrivals. Plus, get{' '}
            <span className="font-semibold text-green-600">10% off your first order!</span>
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold hover:from-blue-600 hover:to-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg text-sm"
                >
                  Get My Deals
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 sm:p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                  <span className="text-white text-xs sm:text-sm">✓</span>
                </div>
                <span className="text-green-800 font-medium text-sm">Thank you! Check your email.</span>
              </div>
            </div>
          )}

          <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
            No spam. Just books. Unsubscribe anytime.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-6 sm:mt-8 text-xs sm:text-sm">
            <div className="flex items-center justify-center text-gray-600">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1.5 sm:mr-2"></div>
              Exclusive flash sales
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2"></div>
              New arrival alerts
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full mr-1.5 sm:mr-2"></div>
              Personalized recommendations
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EmailCapture;