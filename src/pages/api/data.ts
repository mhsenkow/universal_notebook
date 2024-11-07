import { NextApiRequest, NextApiResponse } from 'next';
import { parse } from 'csv-parse';
import fs from 'fs';
import path from 'path';

const findMatchingFile = async (filename: string, dirPath: string): Promise<string | null> => {
  const dirContents = await fs.promises.readdir(dirPath);
  
  // Try exact match first
  if (dirContents.includes(filename)) {
    return filename;
  }
  
  // Try case-insensitive match and handle spaces
  const normalizedSearchFilename = filename.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
  const match = dirContents.find(file => {
    const normalizedFile = file.toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
    return normalizedFile.includes(normalizedSearchFilename);
  });
  
  return match || null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const { source, parameters } = req.body;
    
    console.log('Received parameters:', parameters);
    
    if (!parameters?.filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const dirPath = path.join(process.cwd(), 'data');
    const searchFilename = parameters.filename.endsWith('.csv') 
      ? parameters.filename 
      : `${parameters.filename}.csv`;

    const matchedFilename = await findMatchingFile(searchFilename, dirPath);
    if (!matchedFilename) {
      const dirContents = await fs.promises.readdir(dirPath);
      return res.status(404).json({ 
        error: 'File not found',
        details: {
          requestedPath: path.join(dirPath, searchFilename),
          filename: parameters.filename,
          availableFiles: dirContents
        }
      });
    }

    const filePath = path.join(dirPath, matchedFilename);
    console.log('Found matching file at:', filePath);
    
    if (!fs.existsSync(filePath)) {
      const dirPath = path.join(process.cwd(), 'data');
      const dirContents: string[] = await fs.promises.readdir(dirPath);
      
      console.error('File not found:', filePath);
      console.error('Directory contents:', dirContents);
      
      return res.status(404).json({ 
        error: 'File not found',
        details: {
          requestedPath: filePath,
          filename: parameters.filename,
          availableFiles: dirContents
        }
      });
    }

    const fileStream = fs.createReadStream(filePath);
    const parser = parse({
      columns: true,
      skip_empty_lines: true,
    });

    fileStream.pipe(parser);

    const records: any[] = [];
    let columns: string[] = [];
    let recordCount = 0;
    const limit = parameters.limit || 1000;

    try {
      for await (const record of parser) {
        if (recordCount === 0) {
          columns = Object.keys(record);
        }
        records.push(record);
        recordCount++;
        
        if (recordCount >= limit) {
          break;
        }
      }

      clearTimeout(timeout);

      const query = parameters.query;
      let filteredRecords = records;

      if (query && typeof query === 'string' && query.trim()) {
        // Simple case-insensitive search across all columns
        const searchTerm = query.toLowerCase();
        filteredRecords = records.filter(record => 
          Object.values(record).some(value => 
            String(value).toLowerCase().includes(searchTerm)
          )
        );
      }

      return res.status(200).json({
        data: filteredRecords,
        columns,
        hasMore: recordCount >= limit
      });
    } catch (streamError: unknown) {
      if ((streamError as { name?: string }).name === 'AbortError') {
        return res.status(504).json({ error: 'Data processing timed out' });
      }
      throw streamError;
    }

  } catch (error) {
    clearTimeout(timeout);
    console.error('API error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
  }
} 