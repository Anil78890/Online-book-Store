import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft,
  BookmarkPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  List,
  Loader2,
  Minus,
  Moon,
  PanelRightOpen,
  Plus,
  RefreshCw,
  Search,
  Sun,
  Type,
  X,
  BookOpen,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import type { Book, BookSource, Chapter } from '../types/book';
import {
  getAvailabilityLabel,
  getBookAuthors,
  getBookById,
  getBookContent,
  getBookCover,
  extractChapters,
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
  value === 'gutendex' ||
  value === 'openlibrary' ||
  value === 'internetarchive' ||
  value === 'wikisource' ||
  value === 'standardebooks';

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

  // Typography & Reader Preferences
  const [fontSize, setFontSize] = useState(() => readNumberSetting('blueleaf-reader-font-size', 18));
  const [theme, setTheme] = useState<ThemeMode>(() => (readStringSetting('blueleaf-reader-theme', 'light') as ThemeMode));
  const [fontFamily, setFontFamily] = useState(() => readStringSetting('blueleaf-reader-font-family', 'Georgia, serif'));
  const [lineHeight, setLineHeight] = useState(() => readStringSetting('blueleaf-reader-line-height', '1.8'));
  const [letterSpacing, setLetterSpacing] = useState(() => readStringSetting('blueleaf-reader-letter-spacing', 'normal'));
  const [continuousScroll, setContinuousScroll] = useState(() => readStringSetting('blueleaf-reader-continuous', 'false') === 'true');

  // Chapter navigation & progress
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [showChaptersMenu, setShowChaptersMenu] = useState(false);
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

  // Extract structured chapters from loaded text
  const chapters = useMemo<Chapter[]>(() => {
    if (!content) return [];
    return extractChapters(content);
  }, [content]);

  // Current active slice of text
  const currentChapter = chapters[activeChapterIndex] || chapters[0];
  const displayedText = useMemo(() => {
    if (!content) return '';
    if (continuousScroll || !currentChapter) return content;
    return content.slice(currentChapter.startIndex, currentChapter.endIndex);
  }, [content, continuousScroll, currentChapter]);

  const wordCount = useMemo(
    () => (content ? content.split(/\s+/).filter(word => word.length > 0).length : 0),
    [content],
  );
  const estimatedTotalMin = Math.ceil(wordCount / 200);

  // Overall book completion percentage
  const overallProgress = useMemo(() => {
    if (continuousScroll || chapters.length <= 1) return progress;
    const chapterWeight = 100 / chapters.length;
    const completedChapters = activeChapterIndex * chapterWeight;
    const currentChapterContribution = (progress / 100) * chapterWeight;
    return Math.min(100, Math.round(completedChapters + currentChapterContribution));
  }, [continuousScroll, chapters.length, activeChapterIndex, progress]);

  const remainingMin = Math.ceil(estimatedTotalMin * (1 - overallProgress / 100));

  const analytics = useReadingAnalytics(source, id, overallProgress, wordCount);
  const { highlights, addHighlight, removeHighlight, updateNote } = useHighlights(source, id);

  // Restore saved chapter index
  useEffect(() => {
    if (source && id) {
      const savedIndex = readNumberSetting(`blueleaf-chapter-${source}-${id}`, 0);
      if (savedIndex >= 0 && savedIndex < (chapters.length || 1)) {
        setActiveChapterIndex(savedIndex);
      }
    }
  }, [source, id, chapters.length]);

  // Persist preferences
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
    localStorage.setItem('blueleaf-reader-continuous', String(continuousScroll));
  }, [continuousScroll]);

  // Persist chapter progress
  const changeChapter = useCallback(
    (index: number) => {
      if (index >= 0 && index < chapters.length) {
        setActiveChapterIndex(index);
        setShowChaptersMenu(false);
        if (source && id) {
          localStorage.setItem(`blueleaf-chapter-${source}-${id}`, String(index));
        }
        if (readerRef.current) {
          readerRef.current.scrollTop = 0;
        }
        setProgress(0);
      }
    },
    [chapters.length, source, id],
  );

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

        if (loadedBook.readingCapability === 'METADATA_ONLY' || loadedBook.readingCapability === 'BORROW_REQUIRED') {
          // If metadata-only or borrow-required, attempt to see if a Gutenberg full-text twin exists
          try {
            const loadedContent = await getBookContent(loadedBook, controller.signal);
            setContent(loadedContent);
          } catch {
            setIsTextUnavailable(true);
          }
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
    return { bg: 'bg-amber-50/60 text-gray-900', panel: 'bg-white border-gray-200', nav: 'bg-white border-gray-200' };
  };

  const tClasses = getThemeClasses();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-blue-50/50 pt-20">
        <div className="text-center text-slate-700">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" aria-hidden="true" />
          <p className="font-semibold text-slate-900">Retrieving book content…</p>
          <p className="mt-1 text-xs text-slate-500">Checking local cache and authorized full-text sources</p>
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
  const hasInAppFullText = !isTextUnavailable && content.length > 0;
  const hasExternalEmbed = book.externalReaderUrl && (book.readingCapability === 'EXTERNAL_READER' || book.readingCapability === 'FULL_TEXT');

  return (
    <main className={`min-h-screen pt-20 ${tClasses.bg}`}>
      {/* Reader Toolbar (rendered when in-app full text is available) */}
      {hasInAppFullText && (
        <>
          <motion.div
            variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
            animate={hiddenToolbar ? 'hidden' : 'visible'}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={`fixed left-0 right-0 top-16 z-30 border-b ${tClasses.nav} shadow-sm`}
          >
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
              <Link
                to="/search"
                className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  theme !== 'light' ? 'text-gray-100 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
              </Link>

              {/* Chapters Selector */}
              {chapters.length > 1 && !continuousScroll && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowChaptersMenu(!showChaptersMenu)}
                    className={`focus-ring inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      theme !== 'light'
                        ? 'border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700'
                        : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 shadow-sm'
                    }`}
                    aria-expanded={showChaptersMenu}
                    aria-label="Table of Contents"
                  >
                    <List className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="max-w-[130px] truncate sm:max-w-[200px]">
                      {currentChapter ? currentChapter.title : 'Contents'}
                    </span>
                    <span className="text-gray-400">
                      ({activeChapterIndex + 1}/{chapters.length})
                    </span>
                  </button>

                  {showChaptersMenu && (
                    <div
                      className={`absolute left-0 mt-2 max-h-80 w-72 overflow-y-auto rounded-2xl border p-2 shadow-xl z-50 ${
                        theme !== 'light' ? 'border-gray-700 bg-gray-900 text-gray-100' : 'border-gray-200 bg-white text-gray-900'
                      }`}
                    >
                      <div className="mb-2 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Table of Contents
                      </div>
                      <div className="space-y-1">
                        {chapters.map((ch, idx) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => changeChapter(idx)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                              idx === activeChapterIndex
                                ? 'bg-blue-600 font-semibold text-white'
                                : theme !== 'light'
                                  ? 'hover:bg-gray-800 text-gray-200'
                                  : 'hover:bg-gray-100 text-gray-800'
                            }`}
                          >
                            <span className="truncate pr-2">{ch.title}</span>
                            <span className="shrink-0 text-[10px] opacity-70">
                              ~{Math.max(1, Math.round(ch.wordCount / 200))}m
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <TTSControls text={displayedText} onChunkHighlight={setTtsHighlightChunk} />

                <div className="mx-1 h-5 w-px bg-gray-300 dark:bg-gray-700" />

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setFontSize(size => Math.max(14, size - 2))}
                    className="focus-ring rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800"
                    aria-label="Decrease reader font size"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="min-w-10 text-center text-xs font-semibold">{fontSize}px</span>
                  <button
                    type="button"
                    onClick={() => setFontSize(size => Math.min(32, size + 2))}
                    className="focus-ring rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800"
                    aria-label="Increase reader font size"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="focus-ring rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800"
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
                  className={`focus-ring rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800 ${
                    showSettings ? 'bg-blue-50 text-blue-700 dark:bg-gray-800' : ''
                  }`}
                  aria-label="Typography Settings"
                >
                  <Type className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowHighlightsPanel(!showHighlightsPanel)}
                  className={`focus-ring rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800 ${
                    showHighlightsPanel ? 'bg-blue-50 text-blue-700 dark:bg-gray-800' : ''
                  }`}
                  aria-label="Toggle Highlights Panel"
                >
                  <PanelRightOpen className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Typography drawer */}
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
                  {chapters.length > 1 && (
                    <div className="flex items-center gap-2 self-end pb-1">
                      <input
                        type="checkbox"
                        id="continuous-mode"
                        checked={continuousScroll}
                        onChange={e => setContinuousScroll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="continuous-mode" className="text-xs font-medium cursor-pointer">
                        Continuous Full-Text (No Chapter Chunking)
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Selection highlight popup */}
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
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
          </motion.div>

          {hiddenToolbar && (
            <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-gray-200 dark:bg-gray-800">
              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${overallProgress}%` }} />
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
              {book.sourceAttribution || (book.source === 'gutendex' ? 'Project Gutenberg' : book.source === 'internetarchive' ? 'Internet Archive' : book.source === 'wikisource' ? 'Wikisource' : book.source === 'standardebooks' ? 'Standard Ebooks' : 'Open Library')}
            </p>
            <h1 className="mt-2 text-xl font-bold leading-snug">{book.title}</h1>
            <p className={`mt-1 text-sm ${theme !== 'light' ? 'text-gray-300' : 'text-gray-600'}`}>
              {getBookAuthors(book)}
            </p>
            <p
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                hasInAppFullText
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              }`}
            >
              {getAvailabilityLabel(book)}
            </p>

            {hasInAppFullText && (
              <div className={`mt-4 border-t pt-4 ${theme !== 'light' ? 'border-gray-800' : 'border-gray-100'} text-sm`}>
                <div className="mb-2 flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Est. reading time: ~{estimatedTotalMin} min</span>
                </div>
                {chapters.length > 1 && !continuousScroll && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Chapter {activeChapterIndex + 1} of {chapters.length}
                  </p>
                )}
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

            {/* Source Transparency & Rights */}
            <div className={`mt-4 border-t pt-3 text-xs ${theme !== 'light' ? 'border-gray-800 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Source: {book.sourceAttribution || book.source}
              </p>
              {book.rights?.licenseName && (
                <p className="mt-1">Rights: {book.rights.licenseName}</p>
              )}
              {book.rights?.attributionText && (
                <p className="mt-1 italic">{book.rights.attributionText}</p>
              )}
              <a
                href={book.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring mt-2 inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                View on provider <ExternalLink className="h-3 w-3" />
              </a>
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

        {/* Reader or Provider View */}
        <section aria-labelledby="reader-heading" className="relative">
          <h2 id="reader-heading" className="sr-only">Reader content</h2>

          {hasInAppFullText ? (
            <div className="space-y-4">
              {/* In-App Reader Canvas */}
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
                {chapters.length > 1 && !continuousScroll && currentChapter && (
                  <div className="mb-6 border-b border-gray-200/60 pb-3 dark:border-gray-800">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {currentChapter.title}
                    </span>
                  </div>
                )}
                <pre className="whitespace-pre-wrap break-words font-inherit leading-inherit">{displayedText}</pre>
              </div>

              {/* Chapter Navigation Controls */}
              {chapters.length > 1 && !continuousScroll && (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => changeChapter(activeChapterIndex - 1)}
                    disabled={activeChapterIndex === 0}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous Chapter
                  </button>

                  <span className="text-xs font-medium text-gray-500">
                    Chapter {activeChapterIndex + 1} of {chapters.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => changeChapter(activeChapterIndex + 1)}
                    disabled={activeChapterIndex >= chapters.length - 1}
                    className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Next Chapter <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className={`mt-2 flex items-center justify-between text-xs ${theme !== 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Overall progress: {overallProgress}%</p>
                {overallProgress < 100 && <p>Estimated time remaining: ~{remainingMin} min</p>}
              </div>
            </div>
          ) : hasExternalEmbed ? (
            /* Embedded Official Reader (e.g. Internet Archive Public Domain Embed) */
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Official Internet Archive Reader</h3>
                  <p className="text-xs text-slate-500">Public-domain digitized edition embedded directly.</p>
                </div>
                <a
                  href={`https://archive.org/details/${encodeURIComponent(book.iaId || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Open on Archive.org <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:aspect-[16/10]">
                <iframe
                  src={book.externalReaderUrl}
                  title={`Internet Archive reader for ${book.title}`}
                  className="h-full w-full border-0"
                  allowFullScreen
                />
              </div>
            </div>
          ) : book.readingCapability === 'BORROW_REQUIRED' ? (
            /* Open Library / Internet Archive Digital Lending */
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm sm:p-10">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-800">
                  Controlled Digital Lending
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {book.title}
                </h2>
                <p className="mt-1 text-base text-slate-600">{getBookAuthors(book)}</p>

                <div className="my-6 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 text-sm text-indigo-950">
                  <p className="font-semibold">Borrowable via Open Library / Internet Archive</p>
                  <p className="mt-1 text-indigo-900 leading-relaxed">
                    This book is protected by copyright but available for borrowing through Open Library's authorized digital lending library. You can borrow and read the digitized copy with a free Open Library account.
                  </p>
                </div>

                {book.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Summary</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 whitespace-pre-line">{book.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
                  <a
                    href={book.borrowUrl || book.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-ring inline-flex items-center gap-2 rounded-full bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
                  >
                    Borrow on Open Library <ExternalLink className="h-4 w-4" aria-hidden="true" />
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
          ) : (
            /* Metadata-Only Open Library Record */
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-slate-800 shadow-sm sm:p-10">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
                  Bibliographic Record
                </span>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {book.title}
                </h2>
                <p className="mt-1 text-base text-slate-600">{getBookAuthors(book)}</p>

                <div className="my-6 rounded-2xl border border-sky-100 bg-sky-50/70 p-5 text-sm text-sky-950">
                  <p className="font-semibold">Full text unavailable for in-browser reading</p>
                  <p className="mt-1 text-sky-900 leading-relaxed">
                    This work is catalogued from Open Library as an open bibliographic record. The complete digitised text is either in copyright or not distributed as an open plain-text ebook.
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
