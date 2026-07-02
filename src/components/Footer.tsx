import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';

interface FooterProps {
  onReadBook: (book: any) => void;
}

const Footer: React.FC<FooterProps> = ({ onReadBook }) => {
  const footerLinks = {
    'Free Books': [
      { name: 'Popular Books', action: 'browse' },
      { name: 'Fiction', action: 'fiction' },
      { name: 'Non-Fiction', action: 'history' },
      { name: "Children's Books", action: 'children' },
      { name: 'Self-Help', action: 'self help' },
      { name: 'Romance', action: 'romance' }
    ],
    'Support': [
      { name: 'How to Read', action: 'help' },
      { name: 'FAQ', action: 'faq' },
      { name: 'Contact Us', action: 'contact' },
      { name: 'About', action: 'about' }
    ],
    'Legal': [
      { name: 'Privacy Policy', action: 'privacy' },
      { name: 'Terms of Service', action: 'terms' },
      { name: 'Cookie Policy', action: 'cookies' }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: '#', name: 'Facebook' },
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Instagram, href: '#', name: 'Instagram' },
    { icon: Youtube, href: '#', name: 'YouTube' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">BL</span>
              </div>
              <span className="text-lg sm:text-xl font-bold">BlueLeaf Books</span>
            </div>
            <p className="text-gray-400 mb-4 text-sm">
              Discover your next favorite book. All books are free to read.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-2" />
                <span className="text-xs sm:text-sm text-gray-400">hello@blueleafbooks.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-2" />
                <span className="text-xs sm:text-sm text-gray-400">1800-123-BOOK</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">{category}</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <span className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors duration-200 cursor-pointer">
                      {link.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-white mb-1 text-sm sm:text-base">Stay Updated</h3>
              <p className="text-xs sm:text-sm text-gray-400">Get new free books in your inbox</p>
            </div>
            <div className="flex w-full sm:w-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 sm:w-64 px-3 py-2 sm:px-4 sm:py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
              />
              <button className="bg-gradient-to-r from-blue-500 to-green-500 px-4 sm:px-6 py-2 rounded-r-lg font-medium hover:from-blue-600 hover:to-green-600 transition-all duration-200 text-sm">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gutenberg Attribution */}
      <div className="border-t border-gray-800 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">📚</span>
              <span className="text-xs text-gray-500">
                Books provided by <a href="https://www.gutenberg.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Project Gutenberg</a>
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center sm:text-right">
              All books are in the public domain. Free to read, share, and distribute.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-gray-400 text-center sm:text-left">
              © 2024 BlueLeaf Books. All rights reserved.
            </div>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;