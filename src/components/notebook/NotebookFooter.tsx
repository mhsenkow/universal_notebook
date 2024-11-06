import React, { useState } from 'react';
import { CellType } from '../../types/Cell';
import { 
  DocumentTextIcon, 
  TableCellsIcon,
  ChartBarIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

interface NotebookFooterProps {
  onAddCell: (type: CellType) => void;
  onGenerateFromPrompt: (prompt: string) => void;
}

export const NotebookFooter: React.FC<NotebookFooterProps> = ({
  onAddCell,
  onGenerateFromPrompt
}) => {
  const [prompt, setPrompt] = useState('');

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerateFromPrompt(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="fixed bottom-0 left-72 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddCell('text')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors duration-200"
            title="Add Text Cell"
          >
            <DocumentTextIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onAddCell('data')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors duration-200"
            title="Add Data Cell"
          >
            <TableCellsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onAddCell('chart')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors duration-200"
            title="Add Chart Cell"
          >
            <ChartBarIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            onClick={() => onAddCell('aiImage')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors duration-200"
            title="Add AI Image Cell"
          >
            <PhotoIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
        
        <form onSubmit={handlePromptSubmit} className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your notebook idea..."
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 
                border border-gray-200 dark:border-gray-700 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-transparent
                text-gray-900 dark:text-gray-100"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2
                btn-primary py-1"
              disabled={!prompt.trim()}
            >
              Generate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 