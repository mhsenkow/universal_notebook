export interface NotebookTemplate {
  name: string;
  description: string;
  cells: Array<{
    type: 'data' | 'aiImage' | 'text' | 'chart';
    content: string;
    config?: {
      source?: string;
      visualization?: string;
    };
    io: {
      inputs: Array<{ id: string; name: string; type: string }>;
      outputs: Array<{ id: string; name: string; type: string }>;
    };
  }>;
}

export const templates: Record<string, NotebookTemplate> = {
  dataAnalysis: {
    name: 'Data Analysis',
    description: 'SQL query with chart visualization',
    cells: [
      {
        type: 'text',
        content: '# Data Analysis\nQuery and visualize data from our database.',
        io: { 
          inputs: [
            { id: 'param1', name: 'Database Name', type: 'string' },
            { id: 'param2', name: 'Table Name', type: 'string' }
          ], 
          outputs: [] 
        }
      },
      {
        type: 'data',
        content: 'SELECT * FROM ${tableName} LIMIT 10',
        io: {
          inputs: [
            { id: 'tableName', name: 'Table Name', type: 'string' },
            { id: 'limit', name: 'Row Limit', type: 'number' }
          ],
          outputs: [{ id: 'data', name: 'Query Result', type: 'dataset' }]
        }
      },
      {
        type: 'chart',
        content: '{"type": "bar", "options": {}}',
        io: {
          inputs: [
            { id: 'dataset', name: 'Data', type: 'dataset' },
            { id: 'chartType', name: 'Chart Type', type: 'string' }
          ],
          outputs: []
        }
      }
    ]
  },
  aiImageGen: {
    name: 'AI Image Generation',
    description: 'Generate and analyze images with AI',
    cells: [
      {
        type: 'text',
        content: '# AI Image Generation\nCreate and analyze images using AI.',
        io: { inputs: [], outputs: [] }
      },
      {
        type: 'aiImage',
        content: 'A beautiful sunset over mountains',
        io: {
          inputs: [],
          outputs: [{ id: 'image', name: 'Generated Image', type: 'image' }]
        }
      }
    ]
  }
}; 