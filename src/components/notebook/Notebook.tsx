import React, { useEffect, useState } from 'react';
import { Cell } from '../../types/Cell';
import { NotebookCell } from './NotebookCell';
import { StorageService } from '../../services/storage';
import { NotebookFooter } from './NotebookFooter';

export interface NotebookProps {
  notebookId: string | undefined;
}

class CellErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <h3 className="font-medium">Cell Error</h3>
          <p className="text-sm">{this.state.error?.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export const Notebook: React.FC<NotebookProps> = ({ notebookId }) => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (notebookId) {
      const allCells = StorageService.getAllCells();
      const notebook = StorageService.getAllNotebooks().find(n => n.id === notebookId);
      if (notebook) {
        const notebookCells = notebook.cells.map(id => allCells[id]).filter(Boolean);
        setCells(notebookCells);
      }
    }
  }, [notebookId]);

  const handleExecute = async (cellId: string) => {
    setIsLoading(true);
    try {
      const cell = cells.find(c => c.id === cellId);
      if (!cell) return;

      // Update cell status to running
      setCells(prevCells => prevCells.map(c =>
        c.id === cellId ? { ...c, status: 'running' } : c
      ));

      // Execute based on cell type
      let result;
      switch (cell.type) {
        case 'data':
          const cellConfig = JSON.parse(cell.content);
          const response = await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: cellConfig.source,
              query: cellConfig.query,
              parameters: cell.io.inputs.reduce((acc, input) => ({
                ...acc,
                [input.id]: input.value
              }), {})
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          result = await response.json();
          break;
        
        // Add other cell type executions
        default:
          throw new Error(`Unsupported cell type: ${cell.type}`);
      }

      // Update cell with result
      setCells(prevCells => prevCells.map(c =>
        c.id === cellId ? { ...c, result, status: 'complete' } : c
      ));
    } catch (error) {
      // Handle error state
      setCells(prevCells => prevCells.map(c =>
        c.id === cellId ? { 
          ...c, 
          status: 'error', 
          result: { 
            error: error instanceof Error ? error.message : 'Unknown error',
            data: null 
          } 
        } : c
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (fromId: string, toId: string, fromPortId: string, toPortId: string) => {
    setCells(prevCells => {
      const fromCell = prevCells.find(c => c.id === fromId);
      const toCell = prevCells.find(c => c.id === toId);
      
      if (!fromCell || !toCell) return prevCells;
      
      return prevCells.map(cell => {
        if (cell.id === fromId) {
          return {
            ...cell,
            connections: {
              ...cell.connections,
              outputs: [
                ...cell.connections.outputs,
                {
                  portId: fromPortId,
                  connectedToCells: [
                    ...(cell.connections.outputs.find(o => o.portId === fromPortId)?.connectedToCells || []),
                    { cellId: toId, portId: toPortId }
                  ]
                }
              ]
            }
          };
        }
        if (cell.id === toId) {
          return {
            ...cell,
            connections: {
              ...cell.connections,
              inputs: [
                ...cell.connections.inputs,
                {
                  portId: toPortId,
                  connectedToCell: fromId,
                  connectedToPort: fromPortId
                }
              ]
            }
          };
        }
        return cell;
      });
    });
  };

  const handleInputChange = (cellId: string, inputId: string, value: any) => {
    setCells(prevCells => 
      prevCells.map(cell => {
        if (cell.id === cellId) {
          return {
            ...cell,
            io: {
              ...cell.io,
              inputs: cell.io.inputs.map(input =>
                input.id === inputId ? { ...input, value } : input
              )
            }
          };
        }
        return cell;
      })
    );
  };

  const handleCellUpdate = (cellId: string, content: string) => {
    const updatedCells = cells.map(cell => 
      cell.id === cellId ? { ...cell, content } : cell
    );
    setCells(updatedCells);
    
    // Save to storage
    const cell = cells.find(c => c.id === cellId);
    if (cell) {
      StorageService.saveCell({ ...cell, content });
    }
  };

  const addCell = (type: Cell['type']) => {
    const newCell: Cell = {
      id: crypto.randomUUID(),
      type,
      content: '',
      io: {
        inputs: [],
        outputs: []
      },
      connections: {
        inputs: [],
        outputs: []
      },
      status: 'idle'
    };

    setCells(prev => [...prev, newCell]);
    StorageService.saveCell(newCell);

    if (notebookId) {
      const notebook = StorageService.getAllNotebooks().find(n => n.id === notebookId);
      if (notebook) {
        notebook.cells.push(newCell.id);
        const notebooks = StorageService.getAllNotebooks().map(n => 
          n.id === notebookId ? notebook : n
        );
        localStorage.setItem('notebooks', JSON.stringify(notebooks));
      }
    }
  };

  const handleGenerateFromPrompt = async (prompt: string) => {
    // Here you would integrate with an AI service to generate cells
    // For now, we'll just create a simple text cell with the prompt
    const newCell: Cell = {
      id: crypto.randomUUID(),
      type: 'text',
      content: `# Generated from prompt: ${prompt}\n\nAdd your content here...`,
      io: {
        inputs: [],
        outputs: []
      },
      connections: {
        inputs: [],
        outputs: []
      },
      status: 'idle'
    };
    
    setCells(prev => [...prev, newCell]);
    StorageService.saveCell(newCell);
  };

  const executeCellQueue = async (cellId: string) => {
    const visited = new Set();
    const queue = [cellId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      await handleExecute(currentId);
      visited.add(currentId);
      
      // Add dependent cells to queue
      const cell = cells.find(c => c.id === currentId);
      cell?.connections.outputs.forEach(output => {
        queue.push(output.cellId);
      });
    }
  };

  return (
    <div className="flex-1 p-8 pb-24">
      <div className="space-y-8">
        {cells.map(cell => (
          <CellErrorBoundary key={cell.id}>
            <NotebookCell
              cell={cell}
              onExecute={handleExecute}
              onConnect={handleConnect}
              onInputChange={(inputId, value) => handleInputChange(cell.id, inputId, value)}
              onUpdate={(content) => handleCellUpdate(cell.id, content)}
            />
          </CellErrorBoundary>
        ))}
      </div>
      <NotebookFooter 
        onAddCell={addCell}
        onGenerateFromPrompt={handleGenerateFromPrompt}
      />
    </div>
  );
};