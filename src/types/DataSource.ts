export type DataSourceType = 'csv' | 'postgres' | 'json' | 'api';

export interface DataSource {
  type: DataSourceType;
  config: {
    // For CSV
    filePath?: string;
    // For Postgres
    connectionString?: string;
    // For API
    url?: string;
    headers?: Record<string, string>;
  };
}

export interface DataQuery {
  source: DataSource;
  query: string;
  parameters?: Record<string, any>;
} 