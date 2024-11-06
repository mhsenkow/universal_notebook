import { SqlQueryParams } from '../types/sql';

const ALLOWED_TABLES = ['users', 'orders', 'products']; // Add your allowed tables
const BLOCKED_KEYWORDS = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE'];

export function validateAndSanitizeQuery(
  query: string, 
  parameters: Record<string, any>
): SqlQueryParams | null {
  // Convert to uppercase for keyword checking
  const upperQuery = query.toUpperCase();

  // Check for blocked keywords
  if (BLOCKED_KEYWORDS.some(keyword => upperQuery.includes(keyword))) {
    return null;
  }

  // Validate table names
  const tableMatch = query.match(/FROM\s+(\w+)/i);
  if (!tableMatch || !ALLOWED_TABLES.includes(tableMatch[1].toLowerCase())) {
    return null;
  }

  // Convert named parameters to positional parameters
  let paramCount = 1;
  const params: any[] = [];
  const processedQuery = query.replace(/\$\{(\w+)\}/g, (_, key) => {
    params.push(parameters[key]);
    return `$${paramCount++}`;
  });

  return {
    query: processedQuery,
    params
  };
} 