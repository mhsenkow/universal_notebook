export interface Notebook {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  cells: string[]; // Array of cell IDs
} 