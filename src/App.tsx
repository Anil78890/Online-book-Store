import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Header from './components/Header';
import Footer from './components/Footer';
import StickyLibrary from './components/StickyLibrary';
import { useReadingList } from './hooks/useReadingList';
import { Loader2 } from 'lucide-react';

const BookPage = lazy(() => import('./components/BookPage'));
const SearchResults = lazy(() => import('./components/SearchResults'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Sources = lazy(() => import('./pages/Sources'));
const Terms = lazy(() => import('./pages/Terms'));

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center pt-20 text-gray-500">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
  </div>
);

const AppContent = () => {
  const { readingList, saveBook, removeBook, isBookSaved } = useReadingList();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent webpage saving (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header readingList={readingList} onRemoveBook={removeBook} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home onSaveBook={saveBook} isBookSaved={isBookSaved} />} />
          <Route path="/search" element={<SearchResults onSaveBook={saveBook} isBookSaved={isBookSaved} />} />
          <Route path="/book/:source/:id" element={<BookPage onSaveBook={saveBook} isBookSaved={isBookSaved} />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      <StickyLibrary readingListCount={readingList.length} />
      <Toaster position="bottom-right" richColors />
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;
