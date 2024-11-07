import { CellIO } from '@/types/IOTypes';
import { DataSourceType } from '@/types/DataSource';

export type CellType = 'data' | 'aiImage' | 'text' | 'chart';

export type CellResult = {
  data?: unknown;
  columns?: string[];
  metadata?: Record<string, unknown>;
  error?: string;
  imageUrl?: string;
};

export interface CellConnections {
  inputs: Array<{
    portId: string;
    connectedToCell: string;
    connectedToPort: string;
  }>;
  outputs: Array<{
    portId: string;
    connectedToCells: Array<{
      cellId: string;
      portId: string;
    }>;
  }>;
}

export interface Cell {
  id: string;
  type: CellType;
  content: string;
  io: CellIO;
  connections: CellConnections;
  result?: CellResult;
  status: CellStatus;
}

export type CellStatus = 'idle' | 'running' | 'complete' | 'error'; 