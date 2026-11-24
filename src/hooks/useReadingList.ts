import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { Book } from '../types/book';

const STORAGE_KEY = 'blueleaf-reading-list';

const isBookArray = (value: unknown): value is Book[] => Array.isArray(value);

const readStoredBooks = (): Book[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return isBookArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export interface ReadingListState {
  readingList: Book[];
  saveBook: (book: Book) => void;
  removeBook: (book: Book) => void;
  isBookSaved: (book: Book) => boolean;
}

export const getBookStorageKey = (book: Book): string => `${book.source}:${book.id}`;

export const useReadingList = (): ReadingListState => {
  const [readingList, setReadingList] = useState<Book[]>(readStoredBooks);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readingList));
  }, [readingList]);

  const savedKeys = useMemo(() => new Set(readingList.map(getBookStorageKey)), [readingList]);

  const saveBook = useCallback((book: Book) => {
    setReadingList(previous => {
      const key = getBookStorageKey(book);
      if (previous.some(item => getBookStorageKey(item) === key)) return previous;
      toast.success('Added to Library', { description: book.title });
      return [...previous, book];
    });
  }, []);

  const removeBook = useCallback((book: Book) => {
    const key = getBookStorageKey(book);
    setReadingList(previous => {
      const filtered = previous.filter(item => getBookStorageKey(item) !== key);
      if (filtered.length !== previous.length) {
        toast.info('Removed from Library', { description: book.title });
      }
      return filtered;
    });
  }, []);

  const isBookSaved = useCallback((book: Book) => savedKeys.has(getBookStorageKey(book)), [savedKeys]);

  return { readingList, saveBook, removeBook, isBookSaved };
};
