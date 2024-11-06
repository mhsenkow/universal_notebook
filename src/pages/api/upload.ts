import { NextApiRequest, NextApiResponse } from 'next';
import { promises as fs } from 'fs';
import path from 'path';
import formidable from 'formidable';
import { parse } from 'csv-parse/sync';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const uploadDir = path.join(process.cwd(), 'data');
    await fs.mkdir(uploadDir, { recursive: true });

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      filter: function ({ mimetype }) {
        return mimetype === 'text/csv';
      },
    });

    const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Validate CSV format
    const fileContent = await fs.readFile(file.filepath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      to: 5 // Only parse first 5 rows for preview
    });

    // Rename file to remove random characters
    const newPath = path.join(uploadDir, file.originalFilename || file.newFilename);
    await fs.rename(file.filepath, newPath);

    res.status(200).json({ 
      message: 'File uploaded successfully',
      filename: path.parse(file.originalFilename || file.newFilename).name,
      preview: records
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Error uploading file' 
    });
  }
} 