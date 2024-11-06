export type CellIO = {
  inputs: Array<{
    id: string;
    type: string;
  }>;
  outputs: Array<{
    id: string;
    type: string;
  }>;
}; 