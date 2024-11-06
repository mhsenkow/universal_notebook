import { DataQuery } from "@/types/DataSource";
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import path from 'path';
import { Pool } from 'pg';

export interface DataSourceAdapter {
  read(query: DataQuery): Promise<{
    data: any[];
    columns: string[];
  }>;
}

export class CSVAdapter implements DataSourceAdapter {
  async read(query: DataQuery) {
    try {
      if (!query.parameters?.fileName) {
        throw new Error('fileName parameter is required for CSV data source');
      }
      const filePath = path.join(process.cwd(), 'data', `${query.parameters.fileName}.csv`);
      const fileContent = readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Apply limit if specified
      const limit = query.parameters?.limit ? parseInt(query.parameters.limit) : records.length;
      const data = records.slice(0, limit);
      
      return {
        data,
        columns: Object.keys(data[0] || {})
      };
    } catch (error) {
      throw new Error(`CSV reading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class PostgresAdapter implements DataSourceAdapter {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DATABASE,
    });
  }

  async read(query: DataQuery) {
    const client = await this.pool.connect();
    try {
      const result = await client.query(query.query, Object.values(query.parameters || {}));
      return {
        data: result.rows,
        columns: result.fields.map(field => field.name)
      };
    } finally {
      client.release();
    }
  }
}

export function getDataSourceAdapter(source: string): DataSourceAdapter {
  switch (source) {
    case 'csv':
      return new CSVAdapter();
    case 'postgres':
      return new PostgresAdapter();
    default:
      throw new Error(`Unsupported data source: ${source}`);
  }
} 