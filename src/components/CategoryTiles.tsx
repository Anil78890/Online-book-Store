import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Compass,
  Feather,
  Flame,
  Heart,
  Landmark,
  Microscope,
  Rocket,
  Scale,
  Search,
  Skull,
  Sparkles,
  Theater,
  UserCheck,
} from 'lucide-react';
import { GENRE_TAXONOMY } from '../services/books/genres';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Compass,
  Brain,
  Rocket,
  Search,
  Landmark,
  Heart,
  Skull,
  Feather,
  Theater,
  Sparkles,
  UserCheck,
  Microscope,
  Scale,
  Flame,
};

const CategoryTiles = () => (
  <section id="categories" className="border-y border-slate-100 bg-slate-50 py-12" aria-labelledby="categories-heading">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-700">
          <Sparkles className="h-4 w-4" aria-hidden="true" /> Curated collections
        </p>
        <h2 id="categories-heading" className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Browse by subject and genre
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Explore public-domain and open-access collections across 15 curated literary and academic areas.
        </p>
      </div>
      <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
        {GENRE_TAXONOMY.map(category => {
          const Icon = iconMap[category.icon] || BookOpen;
          return (
            <Link
              key={category.id}
              to={`/search?category=${encodeURIComponent(category.id)}`}
              className="focus-ring group flex items-start gap-3.5 border-b border-slate-200/80 py-3.5 transition-colors hover:bg-white rounded-lg sm:px-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition-colors group-hover:bg-blue-700 group-hover:text-white">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                  {category.name}
                </span>
                <span className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                  {category.description}
                </span>
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
