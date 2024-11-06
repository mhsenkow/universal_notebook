import { Notebook } from '../types/Notebook';
import { Cell } from '../types/Cell';
import { DataSourceType } from '../types/DataSource';

const NOTEBOOKS_KEY = 'notebooks';
const CELLS_KEY = 'cells';

const isClient = typeof window !== 'undefined';

const defaultDataContent = {
  source: 'csv' as DataSourceType,
  query: 'SELECT * FROM ${fileName}',
  visualization: 'table' as const
};

export const StorageService = {
  // Notebook operations
  getAllNotebooks: (): Notebook[] => {
    if (!isClient) return [];
    const notebooks = localStorage.getItem(NOTEBOOKS_KEY);
    return notebooks ? JSON.parse(notebooks) : [];
  },

  createNotebook: () => {
    if (!isClient) throw new Error('Cannot create notebook on server');
    
    const notebook: Notebook = {
      id: crypto.randomUUID(),
      name: 'Untitled Notebook',
      createdAt: new Date(),
      updatedAt: new Date(),
      cells: [crypto.randomUUID()] // Create with one default cell
    };

    // Save initial data cell
    const initialCell: Cell = {
      id: notebook.cells[0],
      type: 'data',
      content: JSON.stringify(defaultDataContent, null, 2),
      config: defaultDataContent,
      io: {
        inputs: [
          { id: 'fileName', type: 'string' },
          { id: 'limit', type: 'number' }
        ],
        outputs: [
          { id: 'data', type: 'dataset' }
        ]
      },
      connections: {
        inputs: [],
        outputs: []
      },
      status: 'idle'
    };

    StorageService.saveCell(initialCell);

    // Save notebook
    const notebooks = StorageService.getAllNotebooks();
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify([...notebooks, notebook]));

    // Ensure we have an empty cells record
    const cells = StorageService.getAllCells();
    localStorage.setItem(CELLS_KEY, JSON.stringify(cells));

    return notebook;
  },

  deleteNotebook: (notebookId: string) => {
    if (!isClient) return;
    
    // Get current notebooks
    const notebooks = StorageService.getAllNotebooks();
    const notebook = notebooks.find(n => n.id === notebookId);
    
    if (!notebook) return;

    // Delete associated cells
    const cells = StorageService.getAllCells();
    notebook.cells.forEach(cellId => {
      delete cells[cellId];
    });
    localStorage.setItem(CELLS_KEY, JSON.stringify(cells));

    // Delete notebook
    const updatedNotebooks = notebooks.filter(n => n.id !== notebookId);
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(updatedNotebooks));
  },

  // Cell operations
  getAllCells: (): Record<string, Cell> => {
    if (!isClient) return {};
    const cells = localStorage.getItem(CELLS_KEY);
    return cells ? JSON.parse(cells) : {};
  },

  saveCell: (cell: Cell) => {
    if (!isClient) return;
    const cells = StorageService.getAllCells();
    cells[cell.id] = cell;
    localStorage.setItem(CELLS_KEY, JSON.stringify(cells));
  },

  renameNotebook: (notebookId: string, newName: string) => {
    if (!isClient) return;
    
    const notebooks = StorageService.getAllNotebooks();
    const updatedNotebooks = notebooks.map(notebook => 
      notebook.id === notebookId 
        ? { ...notebook, name: newName, updatedAt: new Date() }
        : notebook
    );
    
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(updatedNotebooks));
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'));
  }
}; 