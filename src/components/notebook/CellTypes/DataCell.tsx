import React, { useState } from 'react';
import { Cell } from '../../../types/Cell';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { FileUpload } from './FileUpload';
import { JsonEditor } from './JsonEditor';

interface DataCellProps {
  cell: Cell;
  onUpdate?: (content: string) => void;
  onExecute?: () => void;
  inputs?: Record<string, any>;
  isHeader?: boolean;
}

interface DataResult {
  data: any[];
  columns: string[];
  error?: string;
}

interface InputConfig {
  id: string;
  label: string;
  type: string;
  options?: string[];
  default?: any;
}

const locks = new Set<string>();

const withLock = async (key: string, operation: () => Promise<void>) => {
  if (locks.has(key)) {
    throw new Error('Operation in progress');
  }
  locks.add(key);
  try {
    await operation();
  } finally {
    locks.delete(key);
  }
};

const validateInput = (value: any, type: string): any => {
  switch (type) {
    case 'number':
      const num = Number(value);
      return isNaN(num) ? null : num;
    case 'string':
      return String(value);
    default:
      return value;
  }
};

export const DataCell: React.FC<DataCellProps> = ({ 
  cell, 
  onUpdate, 
  onExecute, 
  inputs,
  isHeader 
}) => {
  const defaultInputs: InputConfig[] = [
    {
      id: 'fileName',
      label: 'File Name',
      type: 'string',
      default: 'sample'
    },
    {
      id: 'limit',
      label: 'Row Limit',
      type: 'number',
      default: 100
    }
  ];

  const [content, setContent] = useState(cell.content);
  const [result, setResult] = useState<DataResult | null>(null);
  const [localInputs, setLocalInputs] = useState<Record<string, any>>(() => {
    return defaultInputs.reduce((acc, input) => ({
      ...acc,
      [input.id]: inputs?.[input.id] ?? input.default
    }), {});
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const onInputChange = (id: string, value: any) => {
    setLocalInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleExecute = async () => {
    try {
      let cellConfig;
      try {
        cellConfig = JSON.parse(cell.content);
      } catch (e) {
        throw new Error('Invalid JSON configuration');
      }
      
      if (!cellConfig.source || !cellConfig.query) {
        throw new Error('Missing required configuration: source and query');
      }
      
      // Validate required inputs
      if (!localInputs.fileName) {
        throw new Error('File Name is required');
      }
      
      // Show running state
      onExecute?.();
      
      await withLock(cell.id, async () => {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            source: cellConfig.source,
            query: cellConfig.query,
            parameters: {
              fileName: localInputs.fileName,
              limit: parseInt(localInputs.limit) || 100
            }
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        
        if (!data || !Array.isArray(data.data)) {
          throw new Error('Invalid response format');
        }
        
        setResult(data);
      });
    } catch (error) {
      console.error('Data execution error:', error);
      setResult({
        data: [],
        columns: [],
        error: error instanceof Error 
          ? error.message 
          : 'An unexpected error occurred while fetching data'
      });
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onUpdate?.(content);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="space-y-4">
      <FileUpload 
        onUploadComplete={(filename) => {
          onInputChange('fileName', filename);
        }}
      />
      
      {/* Configuration Section */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Configuration
        </h3>
        <JsonEditor
          value={content}
          onChange={handleContentChange}
          onSave={handleSave}
        />
        {hasUnsavedChanges && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Execute Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExecute}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          Execute
        </button>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-4">
          {result.error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              {result.error}
            </div>
          ) : (
            <>
              <div className="relative w-full">
                <div className="overflow-x-auto">
                  <table className="table-auto w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        {result.columns.map((column) => (
                          <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {result.data.map((row, i) => (
                        <tr key={i}>
                          {result.columns.map((column) => (
                            <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {row[column]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}; 