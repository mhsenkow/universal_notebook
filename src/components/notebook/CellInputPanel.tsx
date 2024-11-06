import React from 'react';
import { Cell } from '../../types/Cell';

interface CellInputPanelProps {
  cell: Cell;
  onInputChange: (inputId: string, value: any) => void;
}

export const CellInputPanel: React.FC<CellInputPanelProps> = ({ cell, onInputChange }) => {
  return (
    <div className="p-6 space-y-4 bg-white dark:bg-gray-800">
      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300">Parameters</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {cell.io.inputs.map((input: { id: string; type: string }) => (
          <div key={input.id} className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {input.type === 'string' ? 'Text Input' : 'Numeric Input'}
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 
                text-gray-600 dark:text-gray-400">
                {input.type}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type={input.type === 'number' ? 'number' : 'text'}
                className="w-full px-4 py-2.5
                  bg-gray-50 dark:bg-gray-800 
                  border border-gray-200 dark:border-gray-700 
                  rounded-lg
                  text-gray-900 dark:text-gray-100 
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent
                  hover:border-gray-300 dark:hover:border-gray-600
                  transition-colors duration-200"
                placeholder={input.type === 'number' ? 'Enter a number...' : 'Enter text...'}
                onChange={(e) => onInputChange(input.id, e.target.value)}
              />
              <div className="w-3 h-3 rounded-full bg-blue-500" 
                   title="Connection point"
                   data-input-id={input.id} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};