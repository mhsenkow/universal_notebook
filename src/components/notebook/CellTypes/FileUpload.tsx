import React, { useCallback } from 'react';

interface FileUploadProps {
  onUploadComplete: (filename: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const handleUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onUploadComplete(data.filename);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Error uploading file');
    }
  }, [onUploadComplete]);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed 
      border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 
      transition-colors duration-200">
      <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-3">
        Upload CSV File
      </label>
      <input
        type="file"
        accept=".csv"
        onChange={handleUpload}
        className="block w-full text-sm text-gray-500 dark:text-gray-400
          file:mr-4 file:py-2.5 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-medium
          file:bg-blue-50 file:text-blue-700
          dark:file:bg-blue-900/20 dark:file:text-blue-300
          hover:file:bg-blue-100 dark:hover:file:bg-blue-900/30
          cursor-pointer"
      />
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Drop your CSV file here or click to browse
      </p>
    </div>
  );
}; 