import React from 'react';
import { DollarSign, Shield, Leaf, Zap } from 'lucide-react';

const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: DollarSign,
      title: 'Better Prices',
      description: 'Always lower than retail with up to 80% savings on bestsellers and rare finds.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Carefully Curated',
      description: 'Every book is hand-checked for quality and authenticity by our expert team.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Leaf,
      title: 'Eco Impact',
      description: 'Giving books a second life while reducing waste and supporting sustainability.',
      color: 'from-green-600 to-teal-500'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Shipping',
      description: 'India-wide delivery in 3-5 days with real-time tracking and secure packaging.',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section id="why-us" className="py-8 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Why Readers Choose BlueLeaf
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            We're more than just a bookstore — we're your trusted partner in discovering amazing stories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group text-center hover:transform hover:-translate-y-2 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-r ${feature.color} rounded-xl sm:rounded-2xl mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                </div>
                
                <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-3">{feature.title}</h3>
                <p className="text-xs sm:text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-8 sm:mt-16 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center">
            <div>
              <div className="text-xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">500K+</div>
              <div className="text-xs sm:text-sm text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-bold text-green-600 mb-1 sm:mb-2">50K+</div>
              <div className="text-xs sm:text-sm text-gray-600">Books Available</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">99.5%</div>
              <div className="text-xs sm:text-sm text-gray-600">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;