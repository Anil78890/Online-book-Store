import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { Highlight } from '../hooks/useHighlights';

interface HighlightsPanelProps {
  highlights: Highlight[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
}

export const HighlightsPanel: React.FC<HighlightsPanelProps> = ({ highlights, onClose, onRemove, onUpdateNote }) => {
  const colorMap = {
    yellow: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100',
    green: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100',
    blue: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100',
    pink: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100',
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col dark:bg-gray-900 dark:border-gray-800 text-left">
      <div className="p-4 border-b flex justify-between items-center dark:border-gray-800">
        <h2 className="text-lg font-bold dark:text-white">Highlights & Notes</h2>
        <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {highlights.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10 dark:text-gray-400">No highlights yet. Select text in the book to create one.</p>
        ) : (
          highlights.map(h => (
            <div key={h.id} className="border rounded-lg p-3 dark:border-gray-700">
              <div className={`p-2 rounded text-sm mb-2 ${colorMap[h.color]}`}>
                "{h.text}"
              </div>
              <textarea 
                value={h.note}
                onChange={e => onUpdateNote(h.id, e.target.value)}
                placeholder="Add a note..."
                className="w-full text-sm p-2 border rounded-md bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 mb-2 focus-ring"
                rows={2}
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => onRemove(h.id)} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 focus-ring rounded p-1">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
