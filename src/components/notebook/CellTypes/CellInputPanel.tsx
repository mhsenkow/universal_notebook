import React from 'react';
import { CellIO } from '@/types/IOTypes';

interface CellInputPanelProps {
  cell: {
    io: CellIO;
  };
  onInputChange: (inputId: string, value: string) => void;
}

export const CellInputPanel: React.FC<CellInputPanelProps> = ({ cell, onInputChange }) => {
  return (
    <div>
      {cell.io.inputs?.map((input) => (
        <div key={input.id}>
          <label>{input.label}</label>
          <input
            value={String(input.value || '')}
            onChange={(e) => onInputChange(input.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}; 