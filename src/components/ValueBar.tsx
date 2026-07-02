import React from 'react';
import { Truck, DollarSign, Leaf, Award } from 'lucide-react';

const ValueBar: React.FC = () => {
  const values = [
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'No minimum purchase'
    },
    {
      icon: DollarSign,
      title: 'Save Up to 80%',
      description: 'Best prices guaranteed'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly',
      description: 'Preloved & new options'
    },
    {
      icon: Award,
      title: '500K+ Readers',
      description: 'Join our community'
    }
  ];

  return (
    <section className="bg-gray-50 py-6 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div 
                key={index}
                className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="inline-flex items-center justify-center w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                  <IconComponent className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 text-xs sm:text-base">{value.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ValueBar;