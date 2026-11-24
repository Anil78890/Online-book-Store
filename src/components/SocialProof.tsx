import { BookOpen, ShieldCheck, WifiOff } from 'lucide-react';

const commitments = [
  {
    icon: BookOpen,
    badge: 'Open Access',
    title: 'Verified Public Domain',
    description:
      'Digitised works preserved by Project Gutenberg and bibliographic records from Open Library, with truthful source attribution and clear availability labels.',
  },
  {
    icon: ShieldCheck,
    badge: 'Local-First',
    title: 'Zero Tracking & Complete Privacy',
    description:
      'No user accounts, no tracking cookies, and no data mining. Your library, notes, highlights, and reading stats remain strictly in your browser.',
  },
  {
    icon: WifiOff,
    badge: 'Offline-Ready',
    title: 'Direct Reading & Offline Storage',
    description:
      'Read in your browser with adjustable typography, dark/OLED themes, and text-to-speech. Opened books are saved to IndexedDB so they stay readable offline.',
  },
];

const SocialProof = () => (
  <section className="border-t border-slate-100 bg-slate-50/60 py-12 sm:py-16" aria-labelledby="platform-commitments-heading">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Platform commitments</p>
        <h2 id="platform-commitments-heading" className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Built for calm, trustworthy reading
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
          BlueLeaf Books is designed around reader dignity: no paywalls, no forced registrations, and no sponsored distractions.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {commitments.map(item => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {item.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
            </article>
          );
        })}
      </div>
    </div>
  </section>
);

export default SocialProof;
