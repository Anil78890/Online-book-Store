import { useEffect, useState, useCallback, useMemo } from 'react';

const ANALYTICS_KEY = 'blueleaf-reading-analytics';
const WORDS_PER_PAGE = 275;

export interface AnalyticsData {
  dailyStreak: number;
  lastReadDate: string | null;
  totalBooksOpened: number;
  /** Composite key `source:id` or legacy `id` mapped to progress percentage (0-100) */
  completionPerBook: Record<string, number>;
  /** Estimated pages read today based on actual word counts and scroll progression */
  pagesReadToday: number;
}

const defaultAnalytics: AnalyticsData = {
  dailyStreak: 0,
  lastReadDate: null,
  totalBooksOpened: 0,
  completionPerBook: {},
  pagesReadToday: 0,
};

/**
 * Migrate legacy analytics storage:
 * - Ensures completionPerBook keys are structured.
 * - Caps anomalous legacy pagesReadToday values.
 */
const migrateStoredAnalytics = (raw: Record<string, unknown>): AnalyticsData => {
  const completionPerBook: Record<string, number> = {};

  if (raw.completionPerBook && typeof raw.completionPerBook === 'object') {
    Object.entries(raw.completionPerBook as Record<string, unknown>).forEach(([key, val]) => {
      const num = typeof val === 'number' && Number.isFinite(val) ? Math.min(100, Math.max(0, val)) : 0;
      completionPerBook[key] = num;
    });
  }

  const today = new Date().toDateString();
  const lastDate = typeof raw.lastReadDate === 'string' ? raw.lastReadDate : null;
  let streak = typeof raw.dailyStreak === 'number' && Number.isFinite(raw.dailyStreak) ? raw.dailyStreak : 0;
  let pagesToday = typeof raw.pagesReadToday === 'number' && Number.isFinite(raw.pagesReadToday) ? raw.pagesReadToday : 0;

  if (lastDate && lastDate !== today) {
    pagesToday = 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate !== yesterday.toDateString()) {
      streak = 0;
    }
  }

  return {
    dailyStreak: streak,
    lastReadDate: lastDate,
    totalBooksOpened: typeof raw.totalBooksOpened === 'number' && Number.isFinite(raw.totalBooksOpened) ? raw.totalBooksOpened : Object.keys(completionPerBook).length,
    completionPerBook,
    pagesReadToday: Math.round(pagesToday),
  };
};

/**
 * Local-only reading progress analytics.
 * Uses composite keys (`source:id`) to prevent collisions between different catalog providers.
 * Calculates honest estimated pages read based on text length.
 */
export const useReadingAnalytics = (
  sourceOrBookId?: string,
  bookIdOrProgress?: string | number,
  progressOrTotalWords?: number,
  optionalTotalWords?: number,
) => {
  // Support flexible signatures: (source, id, progress, totalWords) or legacy (id, progress)
  let source = 'gutendex';
  let bookId = '';
  let progress: number | undefined;
  let totalWords = 0;

  if (typeof bookIdOrProgress === 'string') {
    source = sourceOrBookId || 'gutendex';
    bookId = bookIdOrProgress;
    progress = typeof progressOrTotalWords === 'number' ? progressOrTotalWords : undefined;
    totalWords = typeof optionalTotalWords === 'number' ? optionalTotalWords : 0;
  } else {
    bookId = sourceOrBookId || '';
    progress = typeof bookIdOrProgress === 'number' ? bookIdOrProgress : undefined;
    totalWords = typeof progressOrTotalWords === 'number' ? progressOrTotalWords : 0;
  }

  const compositeKey = useMemo(() => {
    if (!bookId) return '';
    return bookId.includes(':') ? bookId : `${source}:${bookId}`;
  }, [source, bookId]);

  const [analytics, setAnalytics] = useState<AnalyticsData>(() => {
    try {
      const stored = localStorage.getItem(ANALYTICS_KEY);
      if (stored) {
        return migrateStoredAnalytics(JSON.parse(stored) as Record<string, unknown>);
      }
    } catch {
      // Fallback to default
    }
    return defaultAnalytics;
  });

  useEffect(() => {
    try {
      localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
    } catch {
      // Storage quota or disabled localStorage
    }
  }, [analytics]);

  const trackBookOpened = useCallback((key: string) => {
    if (!key) return;
    setAnalytics(prev => {
      const today = new Date().toDateString();
      let streak = prev.dailyStreak;

      if (prev.lastReadDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (prev.lastReadDate === yesterday.toDateString()) {
          streak += 1;
        } else {
          streak = 1;
        }
      }

      const isNewBook = !(key in prev.completionPerBook);
      return {
        ...prev,
        lastReadDate: today,
        dailyStreak: streak,
        totalBooksOpened: isNewBook ? prev.totalBooksOpened + 1 : prev.totalBooksOpened,
        completionPerBook: {
          ...prev.completionPerBook,
          [key]: prev.completionPerBook[key] ?? 0,
        },
      };
    });
  }, []);

  const trackProgress = useCallback((key: string, newProgress: number, words: number) => {
    if (!key || newProgress <= 0) return;

    setAnalytics(prev => {
      const oldProgress = prev.completionPerBook[key] ?? 0;
      if (newProgress <= oldProgress) return prev;

      const progressDiff = newProgress - oldProgress;
      // Calculate defensible pages read based on total words (or average 250-page book estimate)
      const estimatedBookPages = words > 0 ? Math.max(1, Math.round(words / WORDS_PER_PAGE)) : 100;
      const estimatedPagesIncrement = Math.max(1, Math.round((progressDiff / 100) * estimatedBookPages));

      return {
        ...prev,
        pagesReadToday: prev.pagesReadToday + estimatedPagesIncrement,
        completionPerBook: {
          ...prev.completionPerBook,
          [key]: newProgress,
        },
      };
    });
  }, []);

  useEffect(() => {
    if (compositeKey) {
      trackBookOpened(compositeKey);
    }
  }, [compositeKey, trackBookOpened]);

  useEffect(() => {
    if (compositeKey && progress !== undefined && progress > 0) {
      trackProgress(compositeKey, progress, totalWords);
    }
  }, [compositeKey, progress, totalWords, trackProgress]);

  return analytics;
};
