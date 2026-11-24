import { BookOpen, Database, Library, ShieldCheck } from 'lucide-react';

const values = [
  { icon: BookOpen, title: 'Legal reading first', text: 'Gutenberg titles are public-domain texts with full reading links.' },
  { icon: Database, title: 'Transparent sources', text: 'Every result shows whether it comes from Project Gutenberg or Open Library.' },
  { icon: Library, title: 'Local reading library', text: 'Saved books stay in your browser without an account.' },
  { icon: ShieldCheck, title: 'Privacy conscious', text: 'Newsletter capture is paused until a compliant backend is connected.' },
];

const ValueBar = () => (
  <section className="border-y border-gray-100 bg-white py-8" aria-labelledby="value-heading">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <h2 id="value-heading" className="sr-only">BlueLeaf Books values</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(value => {
          const Icon = value.icon;
          return (
            <article key={value.title} className="rounded-2xl bg-blue-50/60 p-5">
              <Icon className="mb-3 h-7 w-7 text-blue-700" aria-hidden="true" />
              <h3 className="font-bold text-gray-900">{value.title}</h3>
              <p className="mt-1 text-sm text-gray-600">{value.text}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default ValueBar;
