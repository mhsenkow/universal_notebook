import React, { useState } from 'react';
import { Cell } from '../../../types/Cell';
import ReactMarkdown from 'react-markdown';

interface TextCellProps {
  cell: Cell;
  onUpdate?: (content: string) => void;
}

export const TextCell: React.FC<TextCellProps> = ({ cell, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [content, setContent] = useState(cell.content);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onUpdate?.(content);
    setHasUnsavedChanges(false);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg font-mono text-sm
                      text-gray-200 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            rows={5}
          />
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-200 flex items-center gap-1
                ${hasUnsavedChanges 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 text-gray-400'}`}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        /* Output Section */
        <div 
          className="prose dark:prose-invert max-w-none p-4 rounded-lg cursor-pointer
            hover:bg-gray-800 transition-colors duration-200" 
          onClick={() => setIsEditing(true)}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}; 