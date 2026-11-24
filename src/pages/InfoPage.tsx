import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface InfoPageProps {
  title: string;
  eyebrow: string;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
}

const InfoPage = ({ title, eyebrow, intro, sections }: InfoPageProps) => (
  <main className="min-h-screen bg-gray-50 pt-28">
    <motion.article 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4 }} 
      className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8"
    >
      <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-extrabold text-gray-900">{title}</h1>
        <p className="mt-5 text-lg leading-8 text-gray-600">{intro}</p>
        <div className="mt-10 space-y-8">
          {sections.map(section => (
            <section key={section.heading} aria-labelledby={section.heading.toLowerCase().replace(/\s+/g, '-')}>
              <h2 id={section.heading.toLowerCase().replace(/\s+/g, '-')} className="text-2xl font-bold text-gray-900">{section.heading}</h2>
              <div className="mt-3 space-y-3 text-gray-600">
                {section.body.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
        <Link to="/search" className="focus-ring mt-10 inline-flex rounded-full bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
          Explore books
        </Link>
      </div>
    </motion.article>
  </main>
);

export default InfoPage;
