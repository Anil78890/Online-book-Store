import { MailCheck } from 'lucide-react';

const EmailCapture = () => (
  <section className="bg-blue-50 py-10" aria-labelledby="newsletter-status-heading">
    <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-blue-100 bg-white p-8 shadow-sm">
        <MailCheck className="mx-auto mb-4 h-10 w-10 text-blue-600" aria-hidden="true" />
        <h2 id="newsletter-status-heading" className="text-2xl font-bold text-gray-900">Newsletter coming later</h2>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Email capture is intentionally disabled until BlueLeaf Books is connected to a real provider with consent tracking, double opt-in, and unsubscribe support.
        </p>
      </div>
    </div>
  </section>
);

export default EmailCapture;
