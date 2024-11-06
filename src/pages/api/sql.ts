import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../utils/db';
import { validateAndSanitizeQuery } from '../../utils/sqlSafety';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query: sqlQuery, parameters } = req.body;

    // Validate and sanitize the SQL query
    const sanitizedQuery = validateAndSanitizeQuery(sqlQuery, parameters);
    if (!sanitizedQuery) {
      return res.status(400).json({ error: 'Invalid SQL query' });
    }

    // Execute the query
    const result = await query(sanitizedQuery.query, sanitizedQuery.params);

    // Format the response
    res.status(200).json({
      data: result.rows,
      columns: result.fields.map(field => field.name)
    });
  } catch (error) {
    console.error('SQL execution error:', error);
    res.status(500).json({ 
      error: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Internal server error' 
    });
  }
}
