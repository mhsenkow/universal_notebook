import { CellIO } from '@/types/IOTypes';
import { DataSourceType } from '@/types/DataSource';

export type CellType = 'data' | 'aiImage' | 'text' | 'chart';

export type CellResult = {
  data: unknown;
  metadata?: Record<string, unknown>;
  error?: string;
};

export interface DataCellConfig {
  source: DataSourceType;
  query: string;
  visualization?: 'table' | 'bar' | 'line' | 'scatter';
}

export interface Cell {
  id: string;
  type: CellType;
  content: string;
  config?: DataCellConfig;
  io: CellIO;
  connections: {
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
  };
  result?: CellResult;
  status: 'idle' | 'running' | 'complete' | 'error';
} 