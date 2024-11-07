import React, { useEffect, useState } from 'react';
import { Cell } from '../../types/Cell';
import { NotebookCell } from './NotebookCell';
import { StorageService } from '../../services/storage';
import { NotebookFooter } from './NotebookFooter';
import { CellIO, IOValue } from '../../types/IOTypes';

const defaultDataContent = {
  filename: null
};

export interface NotebookProps {
  notebookId: string | undefined;
}

class CellErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <h3 className="font-medium">Cell Error</h3>
          <p className="text-sm">{(this.state.error as Error).message}</p>
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

      setCells(prevCells => prevCells.map(c =>
        c.id === cellId ? { ...c, status: 'running' } : c
      ));

      let endpoint = '/api/data';
      let requestBody: any = {};

      switch (cell.type) {
        case 'data': {
          const cellConfig = JSON.parse(cell.content);
          if (!cellConfig.filename) {
            throw new Error('No file selected');
          }
          requestBody = {
            source: 'csv',
            parameters: {
              filename: cellConfig.filename.includes('.csv') 
                ? cellConfig.filename 
                : `${cellConfig.filename}.csv`,
              limit: 1000
            }
          };
          break;
        }
        
        case 'aiImage': {
          endpoint = '/api/generate-image';
          requestBody = { 
            prompt: cell.content
          };
          break;
        }
        
        default:
          throw new Error(`Unsupported cell type: ${cell.type}`);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();

      setCells(prevCells => prevCells.map(c =>
        c.id === cellId ? { ...c, result, status: 'idle' } : c
      ));

    } catch (error) {
      setCells(prevCells => prevCells.map(c =>
        c.id === cellId ? { 
          ...c, 
          result: { error: error instanceof Error ? error.message : 'An unknown error occurred' }, 
          status: 'idle' 
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
      
      // Validate port types match
      const outputPort = fromCell.io.outputs.find(o => o.id === fromPortId);
      const inputPort = toCell.io.inputs.find(i => i.id === toPortId);
      
      if (!outputPort || !inputPort || outputPort.type !== inputPort.type) {
        console.error('Invalid connection: port types do not match');
        return prevCells;
      }
      
      // Check if connection already exists
      const existingOutput = fromCell.connections.outputs
        .find(o => o.portId === fromPortId)?.connectedToCells
        .some(conn => conn.cellId === toId && conn.portId === toPortId);
        
      if (existingOutput) return prevCells;
      
      return prevCells.map(cell => {
        if (cell.id === fromId) {
          const existingOutputPort = cell.connections.outputs
            .find(o => o.portId === fromPortId);

          if (existingOutputPort) {
            return {
              ...cell,
              connections: {
                ...cell.connections,
                outputs: cell.connections.outputs.map(o =>
                  o.portId === fromPortId ? {
                    ...o,
                    connectedToCells: [
                      ...o.connectedToCells,
                      { cellId: toId, portId: toPortId }
                    ]
                  } : o
                )
              }
            };
          } else {
            return {
              ...cell,
              connections: {
                ...cell.connections,
                outputs: [
                  ...cell.connections.outputs,
                  {
                    portId: fromPortId,
                    connectedToCells: [{ cellId: toId, portId: toPortId }]
                  }
                ]
              }
            };
          }
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

  const getDefaultIO = (type: Cell['type']): CellIO => {
    switch (type) {
      case 'data':
        return {
          inputs: [],
          outputs: [
            { id: crypto.randomUUID(), type: 'dataset', name: 'Result', label: 'Result' }
          ]
        };
      case 'aiImage':
        return {
          inputs: [],
          outputs: [
            { id: crypto.randomUUID(), type: 'image', name: 'Generated Image', label: 'Generated Image' }
          ]
        };
      case 'text':
        return {
          inputs: [],
          outputs: [
            { id: crypto.randomUUID(), type: 'markdown', name: 'Rendered Text', label: 'Rendered Text' }
          ]
        };
      default:
        return { inputs: [], outputs: [] };
    }
  };

  const addCell = (type: Cell['type']) => {
    const newCell: Cell = {
      id: crypto.randomUUID(),
      type,
      content: type === 'data' ? JSON.stringify(defaultDataContent, null, 2) : '',
      io: getDefaultIO(type),
      connections: {
        inputs: [],
        outputs: []
      },
      status: 'idle',
      result: undefined
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
    const visited = new Set<string>();
    const queue: string[] = [cellId];
    
    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) continue;
      
      await handleExecute(currentId);
      visited.add(currentId);
      
      // Add dependent cells to queue
      const cell = cells.find(c => c.id === currentId);
      cell?.connections.outputs.forEach(output => {
        output.connectedToCells.forEach(connection => {
          queue.push(connection.cellId);
        });
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