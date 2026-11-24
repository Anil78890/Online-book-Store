import { Accessibility, BookOpen, Database, ShieldCheck } from 'lucide-react';

const reasons = [
  {
    icon: BookOpen,
    title: 'Focused on free reading',
    description: 'Discover public-domain books and use simple reading tools without checkout flows or distractions.',
  },
  {
    icon: Database,
    title: 'Clear availability',
    description: 'Each result makes the difference between a full-text book and a metadata-only record clear.',
  },
  {
    icon: ShieldCheck,
    title: 'Source-aware discovery',
    description: 'Book records come from public catalogues, with source information available on the data sources page.',
  },
  {
    icon: Accessibility,
    title: 'Comfortable reading',
    description: 'Keyboard-friendly controls, adjustable typography and light or dark reader themes support different readers.',
  },
];

const WhyChooseUs = () => (
  <section id="why-us" className="bg-white py-12" aria-labelledby="why-heading">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Why BlueLeaf</p>
        <h2 id="why-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">A calmer way to find something to read</h2>
      </div>
      <div className="grid gap-x-10 sm:grid-cols-2">
        {reasons.map(reason => {
          const Icon = reason.icon;
          return (
            <article key={reason.title} className="flex gap-4 border-t border-slate-200 py-5">
              <Icon className="mt-1 h-6 w-6 shrink-0 text-blue-700" aria-hidden="true" />
              <div>
                <h3 className="font-semibold text-slate-900">{reason.title}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">{reason.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
