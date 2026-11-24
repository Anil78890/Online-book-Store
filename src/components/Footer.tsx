import { Link } from 'react-router-dom';
import { BookOpen, Database, ShieldCheck } from 'lucide-react';
import WaveLogo from './WaveLogo';

const footerSections = [
  {
    title: 'Explore',
    links: [
      { label: 'Search Books', to: '/search' },
      { label: 'Popular Books', to: '/search?category=classic_literature' },
      { label: 'Fiction', to: '/search?category=fiction' },
      { label: 'History', to: '/search?category=history' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Data Sources', to: '/sources' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Use', to: '/terms' },
    ],
  },
];

const Footer = () => (
  <footer className="bg-gray-950 text-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      <section className="md:col-span-2 lg:col-span-1" aria-labelledby="footer-brand">
        <div className="mb-4 flex items-center gap-2">
          <WaveLogo size="sm" />
          <h2 id="footer-brand" className="text-xl font-bold">BlueLeaf Books</h2>
        </div>
        <p className="text-sm leading-6 text-gray-400">
          A free discovery and reading platform for public-domain and open-access books from trusted public sources.
        </p>
        <div className="mt-5 space-y-2 text-sm text-gray-400">
          <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-400" aria-hidden="true" /> No account required; your library stays in this browser</p>
        </div>
      </section>

      {footerSections.map(section => (
        <nav key={section.title} aria-label={`${section.title} footer links`}>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-200">{section.title}</h3>
          <ul className="space-y-3">
            {section.links.map(link => (
              <li key={link.to}>
                <Link to={link.to} className="focus-ring rounded text-sm text-gray-400 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ))}
    </div>

    <div className="border-t border-gray-800 bg-gray-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-gray-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <p className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-blue-400" aria-hidden="true" />
          Books are preserved by Project Gutenberg and Open Library. <Link to="/sources" className="focus-ring rounded underline hover:text-white">See our sources</Link>
        </p>
        <p className="flex items-center gap-2">
          <Database className="h-4 w-4 text-green-400" aria-hidden="true" />
          © 2026 BlueLeaf Books. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
