import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Database,
  Download,
  Globe,
  Library,
  Lock,
  Mail,
  Scale,
  Search,
  Server,
  ShieldCheck,
} from 'lucide-react';

interface SourceCard {
  name: string;
  role: string;
  badge: string;
  badgeClass: string;
  icon: typeof BookOpen;
  summary: string;
  provides: string[];
  url: string;
}

const sources: SourceCard[] = [
  {
    name: 'Project Gutenberg',
    role: 'via the Gutendex catalogue',
    badge: 'Full text',
    badgeClass: 'bg-green-100 text-green-800',
    icon: BookOpen,
    summary:
      'The oldest digital library in the world — more than fifty years of volunteers transcribing and proofreading books whose copyright has expired. Almost everything you read on BlueLeaf comes from here.',
    provides: [
      'Complete, unabridged text of each work',
      'Author, language, subject, and popularity data',
      'Cover art where the edition has it',
    ],
    url: 'https://www.gutenberg.org',
  },
  {
    name: 'Open Library',
    role: 'an Internet Archive initiative',
    badge: 'Catalogue data',
    badgeClass: 'bg-blue-100 text-blue-800',
    icon: Library,
    summary:
      'An open, editable catalogue aiming for one page per book ever published. It gives BlueLeaf breadth of discovery: editions, authors, and cover art that Gutenberg alone does not carry.',
    provides: [
      'Bibliographic records and subject headings',
      'Cover images for a far wider set of titles',
      'Edition counts and publication years',
    ],
    url: 'https://openlibrary.org',
  },
];

const pipeline = [
  {
    icon: Search,
    title: 'We search both catalogues',
    body: 'One query goes to Gutenberg and Open Library at the same time. If one is slow or down, results from the other still reach you.',
  },
  {
    icon: Database,
    title: 'Records become one shape',
    body: 'Every result is normalised into a single internal book record, so a Gutenberg title and an Open Library entry behave identically everywhere in the app.',
  },
  {
    icon: Server,
    title: 'Text is fetched through our own server',
    body: 'Book text is retrieved server-side and passed to your browser. That is what lets a full book open in-app instead of sending you elsewhere to read it.',
  },
  {
    icon: Download,
    title: 'And then it is yours',
    body: 'The text is stored in your browser. Reopening a book costs no network request at all, and it stays readable offline.',
  },
];

const rights = [
  {
    icon: Scale,
    title: 'Public domain only',
    body: 'We surface full text only where copyright has expired and the source distributes it freely. Works still in copyright are never made readable here.',
  },
  {
    icon: BookOpen,
    title: 'We never claim authorship',
    body: 'These works belong to their authors and, now, to everyone. BlueLeaf builds the reading experience around them and claims nothing more than that.',
  },
  {
    icon: Globe,
    title: 'Rights vary by country',
    body: 'Public-domain status is determined largely under United States law. If you read from elsewhere, your local copyright term may differ.',
  },
  {
    icon: Lock,
    title: 'Your reading stays yours',
    body: 'What you open, highlight, and save is written to your own browser storage. None of it is sent to us or to the catalogues we draw from.',
  },
];

const Sources = () => (
  <main className="min-h-screen bg-gray-50 pt-20">
    {/* Hero */}
    <section className="bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-700">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Attribution and transparency
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            Every book here is credited
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            BlueLeaf Books does not digitise anything itself. Everything you read was preserved by
            two long-running public projects, and we think you should know exactly which one, what
            it contributed, and how the text reaches your screen.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Source cards */}
    <section aria-labelledby="sources-heading" className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 id="sources-heading" className="sr-only">
        Our sources
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        {sources.map((source, index) => (
          <motion.article
            key={source.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.35, delay: index * 0.08 }}
            className="flex flex-col rounded-3xl border border-gray-100 bg-white p-7 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white">
                <source.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${source.badgeClass}`}>{source.badge}</span>
            </div>

            <h3 className="mt-5 text-xl font-bold text-gray-900">{source.name}</h3>
            <p className="text-sm font-medium text-gray-500">{source.role}</p>
            <p className="mt-4 leading-7 text-gray-600">{source.summary}</p>

            <h4 className="mt-6 text-sm font-bold uppercase tracking-wide text-gray-500">What it contributes</h4>
            <ul className="mt-3 space-y-2">
              {source.provides.map(item => (
                <li key={item} className="flex gap-3 text-sm leading-6 text-gray-700">
                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring mt-6 inline-flex items-center gap-2 self-start rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Visit {source.name}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </motion.article>
        ))}
      </div>
    </section>

    {/* Pipeline */}
    <section aria-labelledby="pipeline-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 id="pipeline-heading" className="text-3xl font-extrabold text-gray-900">
        How a book reaches you
      </h2>
      <p className="mt-3 max-w-2xl text-gray-600">
        Four steps between a catalogue entry and the page in front of you.
      </p>

      <ol className="mt-8 grid gap-5 sm:grid-cols-2">
        {pipeline.map((stage, index) => (
          <li key={stage.title} className="flex gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <stage.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400">STEP {index + 1}</p>
              <h3 className="mt-1 font-bold text-gray-900">{stage.title}</h3>
              <p className="mt-2 leading-7 text-gray-600">{stage.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>

    {/* Rights and licensing */}
    <section aria-labelledby="rights-heading" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="rights-heading" className="text-3xl font-extrabold text-gray-900">
          Rights, licensing, and limits
        </h2>
        <p className="mt-3 max-w-2xl text-gray-600">
          The short version: we only carry what is free to carry, and we say so plainly.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {rights.map(item => (
            <article key={item.title} className="rounded-3xl bg-gray-50 p-6">
              <item.icon className="h-5 w-5 text-gray-900" aria-hidden="true" />
              <h3 className="mt-3 font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 leading-7 text-gray-600">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    {/* Corrections */}
    <section aria-labelledby="corrections-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl bg-gray-950 p-8 text-white sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 id="corrections-heading" className="text-2xl font-extrabold sm:text-3xl">
              Found something wrong?
            </h2>
            <p className="mt-4 leading-8 text-gray-300">
              Wrong author, mismatched cover, a text that will not open — or a rights concern about
              a work we are showing. Tell us and we will look into it. Catalogue errors that
              originate upstream are best corrected at the source too, since those records feed
              every service that uses them, not just ours.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-col gap-3">
            <Link
              to="/contact"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
            >
              <Mail className="h-4 w-4" aria-hidden="true" /> Report an issue
            </Link>
            <Link
              to="/privacy"
              className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-gray-700 px-6 py-3 font-semibold text-gray-200 transition hover:bg-gray-900"
            >
              Read the privacy policy
            </Link>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default Sources;
