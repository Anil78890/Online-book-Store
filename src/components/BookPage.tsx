import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ArrowLeft,
  BookmarkPlus,
  Check,
  Loader2,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Sun,
  BookOpen,
  Clock,
  PanelRightOpen,
  Type,
  X,
  ExternalLink,
  Search,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import type { Book, BookSource } from '../types/book';
import {
  getAvailabilityLabel,
  getBookAuthors,
  getBookById,
  getBookContent,
  getBookCover,
} from '../services/books';
import { useReadingAnalytics } from '../hooks/useReadingAnalytics';
import { useHighlights, HighlightColor } from '../hooks/useHighlights';
import { TTSControls } from './TTSControls';
import { HighlightsPanel } from './HighlightsPanel';

interface BookPageProps {
  onSaveBook: (book: Book) => void;
  isBookSaved: (book: Book) => boolean;
}

const isBookSource = (value: string | undefined): value is BookSource =>
  value === 'gutendex' || value === 'openlibrary';

const readStringSetting = (key: string, fallback: string): string => {
  return localStorage.getItem(key) || fallback;
};

const readNumberSetting = (key: string, fallback: number): number => {
  const raw = localStorage.getItem(key);
  const parsed = raw ? Number(raw) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

type ThemeMode = 'light' | 'dark' | 'oled';

const BookPage = ({ onSaveBook, isBookSaved }: BookPageProps) => {
  const { source, id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [content, setContent] = useState('');
  const [isTextUnavailable, setIsTextUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const [fontSize, setFontSize] = useState(() => readNumberSetting('blueleaf-reader-font-size', 18));
  const [theme, setTheme] = useState<ThemeMode>(() => (readStringSetting('blueleaf-reader-theme', 'light') as ThemeMode));
  const [fontFamily, setFontFamily] = useState(() => readStringSetting('blueleaf-reader-font-family', 'Georgia, serif'));
  const [lineHeight, setLineHeight] = useState(() => readStringSetting('blueleaf-reader-line-height', '1.8'));
  const [letterSpacing, setLetterSpacing] = useState(() => readStringSetting('blueleaf-reader-letter-spacing', 'normal'));

  const [progress, setProgress] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showHighlightsPanel, setShowHighlightsPanel] = useState(false);

  const [selection, setSelection] = useState<{ text: string; range: Range } | null>(null);
  const [, setTtsHighlightChunk] = useState<string>('');

  const readerRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const [hiddenToolbar, setHiddenToolbar] = useState(false);

  useMotionValueEvent(scrollY, 'change', latest => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHiddenToolbar(true);
    } else {
      setHiddenToolbar(false);
    }
  });

  const wordCount = useMemo(
    () => (content ? content.split(/\s+/).filter(word => word.length > 0).length : 0),
    [content],
  );
  const estimatedTotalMin = Math.ceil(wordCount / 200);
  const remainingMin = Math.ceil(estimatedTotalMin * (1 - progress / 100));

  const analytics = useReadingAnalytics(source, id, progress, wordCount);
  const { highlights, addHighlight, removeHighlight, updateNote } = useHighlights(source, id);

  useEffect(() => {
    localStorage.setItem('blueleaf-reader-font-size', String(fontSize));
  }, [fontSize]);
  useEffect(() => {
    localStorage.setItem('blueleaf-reader-theme', theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem('blueleaf-reader-font-family', fontFamily);
  }, [fontFamily]);
  useEffect(() => {
    localStorage.setItem('blueleaf-reader-line-height', lineHeight);
  }, [lineHeight]);
  useEffect(() => {
    localStorage.setItem('blueleaf-reader-letter-spacing', letterSpacing);
  }, [letterSpacing]);

  useEffect(() => {
    const controller = new AbortController();
    const loadBook = async () => {
      if (!isBookSource(source) || !id) {
        setError('This book URL is not valid.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setIsTextUnavailable(false);
      setProgress(0);
      setContent('');

      try {
        const loadedBook = await getBookById(source, decodeURIComponent(id), controller.signal);
        setBook(loadedBook);

        if (loadedBook.availability === 'metadata-only') {
          setIsTextUnavailable(true);
        } else {
          try {
            const loadedContent = await getBookContent(loadedBook, controller.signal);
            setContent(loadedContent);
          } catch (contentError) {
            if (contentError instanceof Error && contentError.message === 'FULL_TEXT_UNAVAILABLE') {
              setIsTextUnavailable(true);
            } else {
              throw contentError;
            }
          }
        }
      } catch (requestError) {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') return;
        setError('We could not load this book right now. Check your connection and try again.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadBook();
    return () => controller.abort();
  }, [id, source, retryKey]);

  const updateProgress = () => {
    const reader = readerRef.current;
    if (!reader) return;
    const maxScroll = reader.scrollHeight - reader.clientHeight;
    setProgress(maxScroll <= 0 ? 100 : Math.round((reader.scrollTop / maxScroll) * 100));
  };

  const handleSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim().length > 0 && readerRef.current?.contains(sel.anchorNode)) {
      setSelection({
        text: sel.toString().trim(),
        range: sel.getRangeAt(0),
      });
    } else {
      setSelection(null);
    }
  };

  const createHighlight = (color: HighlightColor) => {
    if (selection) {
      addHighlight({
        text: selection.text,
        color,
        note: '',
        startIndex: 0,
        endIndex: 0,
      });
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      setShowHighlightsPanel(true);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : prev === 'dark' ? 'oled' : 'light'));
  };

  const getThemeClasses = () => {
    if (theme === 'oled')
      return { bg: 'bg-black text-gray-200', panel: 'bg-gray-900 border-gray-800', nav: 'bg-black border-gray-800' };
    if (theme === 'dark')
      return { bg: 'bg-gray-950 text-gray-100', panel: 'bg-gray-900 border-gray-800', nav: 'bg-gray-900 border-gray-800' };
    return { bg: 'bg-amber-50 text-gray-900', panel: 'bg-white border-gray-200', nav: 'bg-white border-gray-200' };
  };

  const tClasses = getThemeClasses();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50/50 pt-20">
        <div className="text-center text-slate-700">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
          <p className="font-semibold">Loading book…</p>
        </div>
      </main>
    );
  }

  if (error || !book) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 pt-28">
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">Book unavailable</h1>
          <p className="mt-3 text-slate-600">{error ?? 'This book could not be found.'}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRetryKey(key => key + 1)}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
            <Link
              to="/search"
              className="focus-ring inline-flex rounded-full border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Search catalogue
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const saved = isBookSaved(book);
  const isReadable = book.availability === 'full-text' && !isTextUnavailable && content.length > 0;

  return (
    <main className={`min-h-screen pt-20 ${tClasses.bg}`}>
      {/* Reader Toolbar (only rendered when readable full text exists) */}
      {isReadable && (
        <>
          <motion.div
            variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
            animate={hiddenToolbar ? 'hidden' : 'visible'}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={`fixed left-0 right-0 top-16 z-30 border-b ${tClasses.nav} shadow-sm`}
          >
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <Link
                to="/search"
                className={`focus-ring inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
                  theme !== 'light' ? 'text-gray-100 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to catalogue
              </Link>

              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <TTSControls text={content} onChunkHighlight={setTtsHighlightChunk} />

                <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-700" />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFontSize(size => Math.max(14, size - 2))}
                    className="focus-ring rounded-full p-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800"
                    aria-label="Decrease reader font size"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-12 text-center text-sm font-semibold">{fontSize}px</span>
                  <button
                    type="button"
                    onClick={() => setFontSize(size => Math.min(32, size + 2))}
                    className="focus-ring rounded-full p-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800"
                    aria-label="Increase reader font size"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="focus-ring rounded-full p-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800"
                  aria-label="Toggle reader theme"
                >
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : theme === 'dark' ? (
                    <Moon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`focus-ring rounded-full p-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800 ${
                    showSettings ? 'bg-blue-50 text-blue-700 dark:bg-gray-800' : ''
                  }`}
                  aria-label="Typography Settings"
                >
                  <Type className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowHighlightsPanel(!showHighlightsPanel)}
                  className={`focus-ring rounded-full p-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800 ${
                    showHighlightsPanel ? 'bg-blue-50 text-blue-700 dark:bg-gray-800' : ''
                  }`}
                  aria-label="Toggle Highlights Panel"
                >
                  <PanelRightOpen className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showSettings && (
              <div
                className={`border-t ${
                  theme !== 'light' ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'
                } p-4`}
              >
                <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 text-sm">
                  <div>
                    <label className="mb-1 block font-semibold opacity-70">Font</label>
                    <select
                      value={fontFamily}
                      onChange={e => setFontFamily(e.target.value)}
                      className={`rounded border p-1 ${
                        theme !== 'light' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      <option value="Georgia, serif">Serif (Georgia)</option>
                      <option value="system-ui, sans-serif">Sans-serif</option>
                      <option value="'OpenDyslexic', sans-serif">OpenDyslexic</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold opacity-70">Line Height</label>
                    <select
                      value={lineHeight}
                      onChange={e => setLineHeight(e.target.value)}
                      className={`rounded border p-1 ${
                        theme !== 'light' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      <option value="1.5">1.5 (Compact)</option>
                      <option value="1.8">1.8 (Normal)</option>
                      <option value="2.0">2.0 (Spacious)</option>
                      <option value="2.5">2.5 (Wide)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-semibold opacity-70">Letter Spacing</label>
                    <select
                      value={letterSpacing}
                      onChange={e => setLetterSpacing(e.target.value)}
                      className={`rounded border p-1 ${
                        theme !== 'light' ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white'
                      }`}
                    >
                      <option value="normal">Normal</option>
                      <option value="0.05em">0.05em (Wide)</option>
                      <option value="0.1em">0.1em (Extra Wide)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selection && (
              <div className="absolute bottom-[-50px] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <span className="border-r border-gray-200 px-2 text-xs font-semibold dark:border-gray-700">Highlight:</span>
                <button
                  type="button"
                  onClick={() => createHighlight('yellow')}
                  className="focus-ring h-6 w-6 rounded-full bg-yellow-300 transition-transform hover:scale-110"
                  aria-label="Yellow"
                />
                <button
                  type="button"
                  onClick={() => createHighlight('green')}
                  className="focus-ring h-6 w-6 rounded-full bg-green-300 transition-transform hover:scale-110"
                  aria-label="Green"
                />
                <button
                  type="button"
                  onClick={() => createHighlight('blue')}
                  className="focus-ring h-6 w-6 rounded-full bg-blue-300 transition-transform hover:scale-110"
                  aria-label="Blue"
                />
                <button
                  type="button"
                  onClick={() => createHighlight('pink')}
                  className="focus-ring h-6 w-6 rounded-full bg-pink-300 transition-transform hover:scale-110"
                  aria-label="Pink"
                />
                <button
                  type="button"
                  onClick={() => setSelection(null)}
                  className="focus-ring ml-2 rounded p-1 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-1 translate-y-full bg-gray-200 dark:bg-gray-800" aria-hidden="true">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </motion.div>

          {hiddenToolbar && (
            <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-gray-200 dark:bg-gray-800">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
        </>
      )}

      {/* Main Container */}
      <article className="relative z-0 mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[18rem_1fr]">
        <aside className="space-y-6">
          <div className={`rounded-2xl p-5 ${tClasses.panel} shadow-sm`}>
            <img
              src={getBookCover(book)}
              alt={`Cover for ${book.title}`}
              className="mx-auto mb-4 w-44 rounded-xl shadow-md"
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              {book.source === 'gutendex' ? 'Project Gutenberg' : 'Open Library'}
            </p>
            <h1 className="mt-2 text-xl font-bold leading-snug">{book.title}</h1>
            <p className={`mt-1 text-sm ${theme !== 'light' ? 'text-gray-300' : 'text-gray-600'}`}>
              {getBookAuthors(book)}
            </p>
            <p
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                isReadable
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              }`}
            >
              {getAvailabilityLabel(book)}
            </p>

            {isReadable && (
              <div className={`mt-4 border-t pt-4 ${theme !== 'light' ? 'border-gray-800' : 'border-gray-100'} text-sm`}>
                <div className="mb-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Est. reading time: ~{estimatedTotalMin} min</span>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onSaveBook(book)}
                disabled={saved}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:bg-emerald-700"
              >
                {saved ? <Check className="h-4 w-4" aria-hidden="true" /> : <BookmarkPlus className="h-4 w-4" aria-hidden="true" />}
                {saved ? 'Saved in library' : 'Save to Library'}
              </button>
            </div>
          </div>

          {/* Reading Stats Widget */}
          <div className={`rounded-2xl p-5 ${tClasses.panel} shadow-sm`}>
            <h3 className="mb-3 flex items-center gap-2 font-bold">
              <BookOpen className="h-4 w-4" /> Reading Stats (Local)
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Daily Streak</span>
                <span className="font-semibold">{analytics.dailyStreak} {analytics.dailyStreak === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Est. Pages Today</span>
                <span className="font-semibold">~{analytics.pagesReadToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Books Opened</span>
                <span className="font-semibold">{analytics.totalBooksOpened}</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-gray-400">
              Stats are stored strictly in your browser.
            </p>
          </div>
        </aside>

        {/* Reader or Metadata Record Display */}
        <section aria-labelledby="reader-heading" className="relative">
          <h2 id="reader-heading" className="sr-only">Reader content</h2>

          {isReadable ? (
            <>
              <div
                ref={readerRef}
                onScroll={updateProgress}
                onMouseUp={handleSelection}
                onTouchEnd={handleSelection}
                className={`max-h-[75vh] overflow-y-auto rounded-3xl p-6 shadow-sm sm:p-10 ${tClasses.panel} relative focus:outline-none`}
                style={{ fontSize, fontFamily, lineHeight, letterSpacing }}
                tabIndex={0}
                aria-label={`Reading text for ${book.title}`}
              >
                <pre className="whitespace-pre-wrap break-words font-inherit leading-inherit">{content}</pre>
              </div>

              <div className={`mt-4 flex items-center justify-between text-sm ${theme !== 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Scroll progress: {progress}%</p>
                {progress < 100 && <p>Estimated time remaining: ~{remainingMin} min</p>}
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm sm:p-10">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                  Open Library Record
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {book.title}
                </h2>
                <p className="mt-1 text-base text-slate-600">{getBookAuthors(book)}</p>

                <div className="my-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-5 text-sm text-sky-950">
                  <p className="font-semibold">Full text unavailable for in-browser reading</p>
                  <p className="mt-1 text-sky-900 leading-relaxed">
                    This work is catalogued from Open Library as an open bibliographic record. The complete digitised text is either still in copyright or not distributed as a free plain-text ebook.
                  </p>
                </div>

                {book.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Summary</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">{book.description}</p>
                  </div>
                )}

                {book.subjects.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Subjects</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {book.subjects.slice(0, 10).map(subj => (
                        <Link
                          key={subj}
                          to={`/search?q=${encodeURIComponent(subj)}`}
                          className="focus-ring rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
                        >
                          {subj}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
                  <a
                    href={book.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    View on Open Library <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <Link
                    to={`/search?q=${encodeURIComponent(book.title)}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Search className="h-4 w-4" aria-hidden="true" /> Search for Gutenberg edition
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>
      </article>

      {showHighlightsPanel && (
        <HighlightsPanel
          highlights={highlights}
          onClose={() => setShowHighlightsPanel(false)}
          onRemove={removeHighlight}
          onUpdateNote={updateNote}
        />
      )}
    </main>
  );
};

export default BookPage;
