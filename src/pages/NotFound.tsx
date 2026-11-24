import { Link } from 'react-router-dom';

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 pt-20">
    <div className="max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">404</p>
      <h1 className="mt-3 text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-3 text-gray-600">This page does not exist, but the library is still open for discovery.</p>
      <Link to="/" className="focus-ring mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
        Return home
      </Link>
    </div>
  </main>
);

export default NotFound;
