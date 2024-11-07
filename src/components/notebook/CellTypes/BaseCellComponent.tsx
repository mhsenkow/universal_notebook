import React from 'react';
import { Cell } from '../../../types/Cell';
import { IOPort, IOType } from '../../../types/IOTypes';

const InputField: React.FC<{
  input: IOPort;
  value: any;
  onChange: (value: any) => void;
  disabled?: boolean;
}> = ({ input, value, onChange, disabled }) => {
  if (input.type === IOType.Number) {
    return (
      <input
        type="number"
        value={value || ''}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 rounded-md"
      />
    );
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 rounded-md"
    />
  );
};

export interface CellComponentProps {
  cell: Cell;
  onUpdate?: (content: string) => void;
  onExecute?: () => void;
  onInputChange?: (portId: string, value: any) => void;
  onConnect?: (portId: string, direction: 'input' | 'output') => void;
}

export const withIO = (WrappedComponent: React.FC<CellComponentProps>) => {
  return (props: CellComponentProps) => (
    <div className="space-y-4">
      {props.cell.io.inputs.length > 0 && (
        <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          {props.cell.io.inputs.map(input => (
            <div key={input.id} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full bg-blue-500 cursor-pointer"
                data-port-id={input.id}
                data-port-type={input.type}
                data-port-direction="input"
                data-cell-id={props.cell.id}
                onClick={() => props.onConnect?.(input.id, 'input')}
              />
              <span className="text-sm font-medium">{input.name}</span>
              <InputField
                input={input}
                value={input.value}
                onChange={(value) => {
                  console.log('Input change:', input.id, value);
                  props.onInputChange?.(input.id, value);
                }}
                disabled={props.cell.connections?.inputs?.some(conn => conn.portId === input.id)}
              />
            </div>
          ))}
        </div>
      )}
      <WrappedComponent {...props} />
    </div>
  );
}; 