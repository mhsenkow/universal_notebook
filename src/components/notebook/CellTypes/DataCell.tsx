import React, { useState } from 'react';
import { CellComponentProps } from './BaseCellComponent';
import { FileUpload } from './FileUpload';
import { CellIO } from '@/types/IOTypes';
import { DataSourceType } from '@/types/DataSource';

interface DataCellConfig {
  filename: string | null;
}

interface DataRow {
  [key: string]: string | number | null;
}

interface DataCellResult {
  data: DataRow[];
  columns: string[];
  error?: string;
}

export const DataCell: React.FC<CellComponentProps> = ({ cell, onUpdate, onExecute, onInputChange }) => {
  const [config, setConfig] = useState<DataCellConfig>(() => {
    try {
      return JSON.parse(cell.content);
    } catch {
      return { filename: null };
    }
  });

  const handleUploadComplete = (filename: string) => {
    const newConfig: DataCellConfig = { filename };
    setConfig(newConfig);
    onUpdate?.(JSON.stringify(newConfig));
  };

  const handleExecuteClick = () => {
    if (!config.filename) {
      cell.result = { error: 'Please select a file first' };
      return;
    }
    onExecute?.();
  };

  const result = cell.result as DataCellResult | undefined;

  return (
    <div className="space-y-4 p-4">
      {!config.filename ? (
        <FileUpload 
          onUploadComplete={handleUploadComplete}
          disabled={cell.status === 'running'}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Current file: {config.filename}
            </span>
            <button
              onClick={() => setConfig({ filename: null })}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove file
            </button>
          </div>
          <button
            onClick={handleExecuteClick}
            disabled={cell.status === 'running'}
            className="btn-primary"
          >
            {cell.status === 'running' ? 'Loading...' : 'Load Data'}
          </button>
        </div>
      )}

      {result?.error && (
        <div className="text-red-500 text-sm">{result.error}</div>
      )}

      {result?.data && Array.isArray(result.data) && result.data.length > 0 ? (
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {result.columns.map((column, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 
                      dark:text-gray-400 uppercase tracking-wider"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {result.data.map((row, i) => (
                <tr key={i}>
                  {result.columns.map((column, j) => (
                    <td
                      key={j}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 
                        dark:text-gray-100"
                    >
                      {row[column] != null ? String(row[column]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : cell.status === 'running' ? (
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
          <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading data...
        </div>
      ) : null}
    </div>
  );
}; 