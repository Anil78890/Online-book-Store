import React from 'react';
import { Star, Quote } from 'lucide-react';

const SocialProof: React.FC = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Teacher, Mumbai',
      content: 'BlueLeaf Books has completely transformed my reading habits. The quality is amazing and the prices are unbeatable!',
      rating: 5,
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Raj Patel',
      role: 'Software Engineer, Bangalore',
      content: 'Fast delivery, excellent packaging, and books in perfect condition. This is my go-to bookstore now!',
      rating: 5,
      image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150'
    },
    {
      name: 'Anjali Kumar',
      role: 'Student, Delhi',
      content: 'The collection is incredible and the eco-friendly approach makes me feel good about every purchase.',
      rating: 5,
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150'
    }
  ];

  const mediaLogos = [
    { name: 'The Times of India', logo: 'TOI' },
    { name: 'NDTV', logo: 'NDTV' },
    { name: 'Book Riot', logo: 'BR' },
    { name: 'Goodreads', logo: 'GR' }
  ];

  return (
    <section className="py-8 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rating Overview */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center bg-white rounded-full px-4 py-2 sm:px-6 sm:py-3 shadow-sm mb-3 sm:mb-4">
            <div className="flex items-center space-x-1 mr-2 sm:mr-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="text-lg sm:text-2xl font-bold text-gray-900">4.8</span>
            <span className="text-sm sm:text-gray-600 ml-1 sm:ml-2">out of 5</span>
          </div>
          <p className="text-sm sm:text-gray-600">Based on 25,000+ verified reviews</p>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover mr-3 sm:mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
                  <p className="text-xs sm:text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-2 sm:mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200 absolute -top-1 -left-1 sm:-top-2 sm:-left-2" />
                <p className="text-gray-700 leading-relaxed pl-5 sm:pl-6 text-sm">{testimonial.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Media Mentions */}
        <div className="text-center mb-8 sm:mb-12">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">As Featured In</h3>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8 opacity-60">
            {mediaLogos.map((media, index) => (
              <div key={index} className="bg-white rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-sm">
                <span className="font-bold text-gray-800 text-sm sm:text-base">{media.logo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1.5 sm:mr-2"></div>
            Secure Payment
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full mr-1.5 sm:mr-2"></div>
            Fast Delivery
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full mr-1.5 sm:mr-2"></div>
            Quality Guaranteed
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;