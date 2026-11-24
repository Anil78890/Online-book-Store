import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  BookMarked,
  Check,
  EyeOff,
  Gauge,
  Headphones,
  Heart,
  Highlighter,
  Moon,
  Search,
  Sparkles,
  Type,
  WifiOff,
} from 'lucide-react';
import WaveLogo from '../components/WaveLogo';

const principles = [
  {
    icon: Heart,
    title: 'The book comes first',
    body: 'No ads, no pop-ups, no "upgrade to keep reading." You open a book and the page gets out of the way.',
    accent: 'text-rose-600 bg-rose-50',
  },
  {
    icon: EyeOff,
    title: 'Private by default',
    body: 'No account, no sign-up, no tracking pixels. Your library, highlights, and reading stats live in your browser — not on our servers.',
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: WifiOff,
    title: 'Yours once you open it',
    body: 'Every book you read is cached on your device, so it stays readable on a plane, a train, or a dead signal.',
    accent: 'text-green-600 bg-green-50',
  },
  {
    icon: Sparkles,
    title: 'Free, genuinely',
    body: 'These are public-domain works that belong to everyone. We charge nothing, and there is nothing to unlock.',
    accent: 'text-amber-600 bg-amber-50',
  },
];

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Find it',
    body: 'Search across tens of thousands of public-domain titles, or browse curated shelves by genre.',
  },
  {
    icon: BookMarked,
    step: '02',
    title: 'Read it here',
    body: 'The full text opens inside BlueLeaf. No hand-off to another site, no downloads to manage.',
  },
  {
    icon: WifiOff,
    step: '03',
    title: 'Keep it',
    body: 'Save to your library and the text stays cached on your device, ready to read offline.',
  },
];

const readerFeatures = [
  { icon: Type, label: 'Typography controls', detail: 'Serif, sans, or OpenDyslexic — with line height and spacing you set once.' },
  { icon: Moon, label: 'Light, dark, and OLED', detail: 'A true-black mode that is easy on the eyes and on the battery.' },
  { icon: Headphones, label: 'Read aloud', detail: 'A built-in narrator with voice choice and adjustable speed.' },
  { icon: Highlighter, label: 'Highlights and notes', detail: 'Mark passages in four colours and add notes that persist between visits.' },
  { icon: Gauge, label: 'Time remaining', detail: 'Honest reading estimates, so you know what you are starting.' },
  { icon: BookMarked, label: 'Your library', detail: 'Save anything worth returning to. It is there when you come back.' },
];

const honesty = [
  'Only works in the public domain. If a book is still in copyright, you will not find it here — and that is deliberate.',
  'Some records are catalogue entries only. Where no free full text exists, we show what we know and say so plainly.',
  'Text quality varies. These are volunteer-digitised books, so the occasional typo comes with the territory.',
];

const About = () => (
  <main className="min-h-screen bg-gray-50 pt-20">
    {/* Hero */}
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-6 flex justify-center">
            <WaveLogo size="lg" />
          </div>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">About BlueLeaf Books</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            A quiet place to read the classics
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            Great books stopped being scarce a long time ago. Finding a calm, uncluttered place to
            actually read them is the hard part. BlueLeaf Books exists to be that place — free,
            private, and free of everything that gets between you and the page.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/search"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Start reading <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/sources"
              className="focus-ring inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Where our books come from
            </Link>
          </div>
        </motion.div>
      </div>
    </section>

    {/* At a glance */}
    <section aria-label="BlueLeaf Books at a glance" className="mx-auto max-w-6xl px-4 sm:px-6">
      <dl className="grid grid-cols-2 gap-4 rounded-3xl bg-gray-950 p-6 text-center text-white sm:p-8 lg:grid-cols-4">
        {[
          { value: '70,000+', label: 'Public-domain books' },
          { value: '$0', label: 'Now and later' },
          { value: 'Zero', label: 'Trackers or ad scripts' },
          { value: 'Offline', label: 'Once you open a book' },
        ].map(stat => (
          <div key={stat.label}>
            <dt className="sr-only">{stat.label}</dt>
            <dd>
              <span className="block text-2xl font-extrabold text-white sm:text-3xl">{stat.value}</span>
              <span className="mt-1 block text-xs text-gray-400 sm:text-sm">{stat.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>

    {/* Principles */}
    <section aria-labelledby="principles-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 id="principles-heading" className="text-3xl font-extrabold text-gray-900">
        What we hold to
      </h2>
      <p className="mt-3 max-w-2xl text-gray-600">
        Four commitments that decide what we build — and, more often, what we leave out.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {principles.map((principle, index) => (
          <motion.article
            key={principle.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${principle.accent}`}>
              <principle.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-gray-900">{principle.title}</h3>
            <p className="mt-2 leading-7 text-gray-600">{principle.body}</p>
          </motion.article>
        ))}
      </div>
    </section>

    {/* How it works */}
    <section aria-labelledby="how-heading" className="bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 id="how-heading" className="text-3xl font-extrabold text-gray-900">
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-gray-600">Three steps. There is no fourth.</p>

        <ol className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map(item => (
            <li key={item.step} className="relative rounded-3xl bg-gray-50 p-6">
              <span className="text-sm font-bold tracking-widest text-blue-600">{item.step}</span>
              <item.icon className="mt-4 h-6 w-6 text-gray-900" aria-hidden="true" />
              <h3 className="mt-3 text-lg font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 leading-7 text-gray-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    {/* Inside the reader */}
    <section aria-labelledby="reader-heading" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 id="reader-heading" className="text-3xl font-extrabold text-gray-900">
        Inside the reader
      </h2>
      <p className="mt-3 max-w-2xl text-gray-600">
        Everything here earns its place. Set it once, and it follows you from book to book.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {readerFeatures.map(feature => (
          <li key={feature.label} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <feature.icon className="h-5 w-5 flex-shrink-0 text-blue-600" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-gray-900">{feature.label}</h3>
              <p className="mt-1 text-sm leading-6 text-gray-600">{feature.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>

    {/* Straight answers */}
    <section aria-labelledby="honesty-heading" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700" aria-hidden="true" />
          <h2 id="honesty-heading" className="text-xl font-bold text-gray-900">
            What BlueLeaf is not
          </h2>
        </div>
        <p className="mt-3 text-gray-700">
          We would rather set expectations honestly than have you find out the hard way.
        </p>
        <ul className="mt-5 space-y-3">
          {honesty.map(item => (
            <li key={item} className="flex gap-3 text-gray-700">
              <Check className="mt-1 h-4 w-4 flex-shrink-0 text-amber-700" aria-hidden="true" />
              <span className="leading-7">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* Closing CTA */}
    <section className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Pick something and start</h2>
        <p className="mt-4 leading-8 text-gray-600">
          The whole library is open. No card, no trial, no email required — just choose a book.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/search"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Browse the library <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            to="/contact"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Tell us what is missing
          </Link>
        </div>
      </div>
    </section>
  </main>
);

export default About;
