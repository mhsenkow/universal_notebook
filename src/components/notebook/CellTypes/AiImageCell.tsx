import React, { useState } from 'react';
import { CellComponentProps } from './BaseCellComponent';

export const AiImageCell: React.FC<CellComponentProps> = ({ cell, onUpdate, onExecute }) => {
  const [prompt, setPrompt] = useState(cell.content);
  const imageUrl = cell.result?.imageUrl;
  const error = cell.result?.error;
  const isGenerating = cell.status === 'running';
  
  const handlePromptChange = (newPrompt: string) => {
    setPrompt(newPrompt);
    onUpdate?.(newPrompt);
  };

  return (
    <div className="space-y-4 p-4">
      <textarea
        value={prompt}
        onChange={(e) => handlePromptChange(e.target.value)}
        placeholder="Describe the image you want to generate..."
        className="w-full p-2 bg-gray-50 dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 rounded-lg
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          text-gray-900 dark:text-gray-100 min-h-[100px]"
      />
      <button
        onClick={onExecute}
        disabled={isGenerating || !prompt.trim()}
        className="btn-primary"
      >
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </button>
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      {imageUrl && (
        <div className="max-h-[600px] overflow-hidden rounded-lg">
          <img 
            src={imageUrl} 
            alt="Generated" 
            className="w-full h-auto object-contain rounded-lg" 
          />
        </div>
      )}
    </div>
  );
}; 