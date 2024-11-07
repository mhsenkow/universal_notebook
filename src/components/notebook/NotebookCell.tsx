import React from 'react';
import { Cell } from '../../types/Cell';
import { getCellComponent } from './CellTypes';

declare global {
  interface Window {
    __connectionState: {
      cellId: string;
      portId: string;
      direction: string;
    } | null;
  }
}

interface NotebookCellProps {
  cell: Cell;
  onExecute: (cellId: string) => void;
  onConnect: (fromId: string, toId: string, fromPortId: string, toPortId: string) => void;
  onUpdate: (content: string) => void;
  onInputChange: (cellId: string, portId: string, value: any) => void;
}

export const NotebookCell: React.FC<NotebookCellProps> = ({
  cell,
  onExecute,
  onConnect,
  onUpdate,
  onInputChange
}) => {
  const CellComponent = getCellComponent(cell.type);

  return (
    <div className="w-full">
      <div className="mx-10 border border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="overflow-x-auto">
          <CellComponent 
            cell={cell}
            onUpdate={onUpdate}
            onExecute={() => onExecute(cell.id)}
            onInputChange={(portId, value) => onInputChange(cell.id, portId, value)}
            onConnect={(portId, direction) => {
              window.__connectionState = {
                cellId: cell.id,
                portId,
                direction
              };
              
              const state = window.__connectionState;
              if (state && state.cellId !== cell.id) {
                if (direction === 'input' && state.direction === 'output') {
                  onConnect(state.cellId, cell.id, state.portId, portId);
                } else if (direction === 'output' && state.direction === 'input') {
                  onConnect(cell.id, state.cellId, portId, state.portId);
                }
                window.__connectionState = null;
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}; 