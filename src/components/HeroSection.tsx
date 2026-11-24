import { FormEvent, useState } from 'react';
import { ArrowRight, BookOpen, Check, Library, Search, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    else navigate('/search');
  };

  return (
    <section className="relative overflow-hidden bg-gradient-hero pt-28 text-white sm:pt-32">
      <div className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
        <div className="animate-float absolute left-10 top-24 h-24 w-24 rounded-full bg-white/20" />
        <div className="animate-float-delayed absolute bottom-20 right-16 h-32 w-32 rounded-full bg-green-300/20" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8 lg:py-20">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }}>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
            <BookOpen className="h-4 w-4" aria-hidden="true" /> Public-domain reading, made simple
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Find a book. Settle in. Keep reading.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50">
            Search classic books by title, author or subject. Open available full texts right here, and keep the books you love in your personal library.
          </p>

          <form onSubmit={handleSearch} role="search" className="mt-8 flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row">
            <label className="sr-only" htmlFor="home-book-search">Search by title, author or subject</label>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                id="home-book-search"
                type="search"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                placeholder="Try Jane Austen, poetry or adventure…"
                className="focus-ring min-h-12 w-full rounded-xl border-0 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <button type="submit" className="focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800">
              Search books <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-blue-50">
            <Link to="/search?category=classic_literature" className="focus-ring rounded underline decoration-white/50 underline-offset-4 hover:decoration-white">Browse classic literature</Link>
            <Link to="/search?category=adventure" className="focus-ring rounded underline decoration-white/50 underline-offset-4 hover:decoration-white">Explore adventure</Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="border-l border-white/25 pl-6 sm:pl-8">
          <div className="mb-6 flex items-center gap-3 text-green-200">
            <Library className="h-9 w-9" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-[0.16em]">A library that travels with you</span>
          </div>
          <h2 className="max-w-md text-2xl font-bold leading-snug sm:text-3xl">A quieter way to discover and read.</h2>
          <ul className="mt-7 space-y-5 text-sm leading-6 text-blue-50">
            <li className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-200" aria-hidden="true" /><span>Search books from public catalogues in one place.</span></li>
            <li className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-200" aria-hidden="true" /><span>See which titles have full text available to read.</span></li>
            <li className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-green-200" aria-hidden="true" /><span>Save favourites locally and return to them later.</span></li>
          </ul>
          <p className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-green-100"><Sparkles className="h-4 w-4" aria-hidden="true" /> No account needed to start reading</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
