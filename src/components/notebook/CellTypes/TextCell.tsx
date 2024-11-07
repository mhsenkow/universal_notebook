import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { CellComponentProps, withIO } from './BaseCellComponent';

export const TextCell: React.FC<CellComponentProps> = withIO(({ cell, onUpdate }) => {
  const [content, setContent] = useState(cell.content);
  
  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onUpdate?.(e.target.value);
        }}
        className="w-full p-4 min-h-[120px] rounded-lg bg-white dark:bg-gray-800"
      />
      <div className="prose dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}); 