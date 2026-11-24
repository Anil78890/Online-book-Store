import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Settings2 } from 'lucide-react';

interface TTSControlsProps {
  text: string;
  onChunkHighlight?: (chunk: string) => void;
}

export const TTSControls: React.FC<TTSControlsProps> = ({ text, onChunkHighlight }) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speed, setSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const chunksRef = useRef<string[]>([]);
  const currentChunkIndex = useRef(0);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoice]);

  useEffect(() => {
    chunksRef.current = text.split(/\n\s*\n/).filter(c => c.trim().length > 0);
    currentChunkIndex.current = 0;
  }, [text]);

  const speakChunk = () => {
    if (currentChunkIndex.current >= chunksRef.current.length) {
      setIsPlaying(false);
      return;
    }
    
    const chunkText = chunksRef.current[currentChunkIndex.current];
    onChunkHighlight?.(chunkText);

    const utterance = new SpeechSynthesisUtterance(chunkText);
    const voice = voices.find(v => v.name === selectedVoice);
    if (voice) utterance.voice = voice;
    utterance.rate = speed;

    utterance.onend = () => {
      currentChunkIndex.current += 1;
      speakChunk();
    };
    
    utterance.onerror = (e) => {
      console.error("TTS Error", e);
      setIsPlaying(false);
    }

    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.cancel();
        speakChunk();
      }
      setIsPlaying(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    currentChunkIndex.current = 0;
    onChunkHighlight?.('');
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center gap-1 relative">
      <button type="button" onClick={togglePlay} className="focus-ring rounded-full p-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800" aria-label={isPlaying ? "Pause TTS" : "Play TTS"}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <button type="button" onClick={stop} className="focus-ring rounded-full p-2 hover:bg-red-50 hover:text-red-700 dark:hover:bg-gray-800" aria-label="Stop TTS">
        <Square className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => setShowSettings(!showSettings)} className={`focus-ring rounded-full p-2 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-800 ${showSettings ? 'bg-blue-50 text-blue-700 dark:bg-gray-800' : ''}`} aria-label="TTS Settings">
        <Settings2 className="h-4 w-4" />
      </button>

      {showSettings && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50 dark:bg-gray-800 dark:border-gray-700 text-left">
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Voice</label>
            <select 
              value={selectedVoice} 
              onChange={e => setSelectedVoice(e.target.value)}
              className="w-full text-sm p-2 border rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-600 dark:text-gray-200"
            >
              {voices.map(v => (
                <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Speed: {speed}x</label>
            <input 
              type="range" 
              min="0.75" max="2" step="0.25" 
              value={speed} 
              onChange={e => setSpeed(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
