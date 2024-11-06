import React from 'react';
import { Cell } from '../../types/Cell';
import { getCellComponent } from './CellTypes';
import { CellInputPanel } from './CellInputPanel';

interface NotebookCellProps {
  cell: Cell;
  onExecute: (cellId: string) => void;
  onConnect: (fromId: string, toId: string) => void;
  onInputChange: (cellId: string, inputId: string, value: any) => void;
  onUpdate: (content: string) => void;
}

export const NotebookCell: React.FC<NotebookCellProps> = ({
  cell,
  onExecute,
  onConnect,
  onInputChange,
  onUpdate
}) => {
  const CellComponent = getCellComponent(cell.type);

  return (
    <div className="w-full">
      <div className="mx-10 border border-gray-200 dark:border-gray-700 rounded-lg">
        {cell.io.inputs.length > 0 && (
          <CellInputPanel 
            cell={cell}
            onInputChange={(inputId, value) => onInputChange(cell.id, inputId, value)}
          />
        )}
        <div className="overflow-x-auto">
          <CellComponent 
            cell={cell}
            onUpdate={onUpdate}
            onExecute={() => onExecute(cell.id)}
          />
        </div>
      </div>
    </div>
  );
}; 