import { Link } from 'react-router-dom';
import { ArrowUpRight, BookMarked, Compass, FlaskConical, Heart, History, Landmark, Sparkles } from 'lucide-react';

const categories = [
  { label: 'Fiction', slug: 'fiction', icon: BookMarked, description: 'Novels, short stories and literary classics.' },
  { label: 'Adventure', slug: 'adventure', icon: Compass, description: 'Journeys, voyages and heroic quests.' },
  { label: 'Science', slug: 'science', icon: FlaskConical, description: 'Science writing and early speculative works.' },
  { label: 'History', slug: 'history', icon: History, description: 'Historical texts, memoirs and documents.' },
  { label: 'Philosophy', slug: 'philosophy', icon: Landmark, description: 'Ideas that shaped public thought.' },
  { label: 'Romance', slug: 'romance', icon: Heart, description: 'Classic love stories and social novels.' },
];

const CategoryTiles = () => (
  <section id="categories" className="border-y border-slate-100 bg-slate-50 py-12" aria-labelledby="categories-heading">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Browse by interest
        </p>
        <h2 id="categories-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Find your next public-domain read</h2>
      </div>
      <div className="grid gap-x-10 sm:grid-cols-2">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Link
              key={category.slug}
              to={`/search?category=${encodeURIComponent(category.slug)}`}
              className="focus-ring group flex items-center gap-4 border-b border-slate-200 py-4 transition-colors hover:bg-white sm:px-2"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900 group-hover:text-blue-700">{category.label}</span>
                <span className="mt-0.5 block text-sm text-slate-600">{category.description}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue-700" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default CategoryTiles;
