import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { source, query, parameters } = req.body;

    if (source === 'csv') {
      const filePath = path.join(process.cwd(), 'data', `${parameters.fileName}.csv`);
      const fileContent = readFileSync(filePath, 'utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
      });

      // Apply limit if specified
      const limit = parameters.limit ? parseInt(parameters.limit) : records.length;
      const data = records.slice(0, limit);
      
      res.status(200).json({
        data,
        columns: Object.keys(data[0] || {})
      });
    } else {
      res.status(400).json({ error: 'Unsupported data source' });
    }
  } catch (error) {
    console.error('Data execution error:', error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Internal server error' 
    });
  }
} 