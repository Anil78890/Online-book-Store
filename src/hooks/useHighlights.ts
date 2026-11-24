import { useState, useEffect, useCallback } from 'react';

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink';

export interface Highlight {
  id: string;
  text: string;
  note: string;
  color: HighlightColor;
  startIndex: number;
  endIndex: number;
}

export const useHighlights = (source?: string, bookId?: string) => {
  const key = `blueleaf-highlights-${source}-${bookId}`;
  
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    if (!source || !bookId) return [];
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (source && bookId) {
      localStorage.setItem(key, JSON.stringify(highlights));
    }
  }, [highlights, source, bookId, key]);

  const addHighlight = useCallback((highlight: Omit<Highlight, 'id'>) => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const newHighlight = { ...highlight, id };
    setHighlights(prev => [...prev, newHighlight].sort((a, b) => a.startIndex - b.startIndex));
    return newHighlight;
  }, []);

  const removeHighlight = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  }, []);

  const updateNote = useCallback((id: string, note: string) => {
    setHighlights(prev => prev.map(h => h.id === id ? { ...h, note } : h));
  }, []);

  return { highlights, addHighlight, removeHighlight, updateNote };
};
