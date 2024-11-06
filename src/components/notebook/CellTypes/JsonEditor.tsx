import React from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, onSave }) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      onBlur={() => {
        try {
          JSON.parse(value);
          onSave();
        } catch (e) {
          // Don't save if JSON is invalid
        }
      }}
      className="w-full h-32 p-2 font-mono text-sm border rounded-md 
        dark:bg-gray-800 dark:border-gray-700"
      placeholder="Enter JSON configuration..."
    />
  );
}; 