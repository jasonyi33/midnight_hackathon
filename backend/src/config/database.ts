import { Pool } from 'pg';
import { config } from './index';

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function query<T>(text: string, params?: any[]): Promise<T[]> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: result.rowCount });
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Query that automatically filters out soft deleted records
export async function queryActive<T>(text: string, params?: any[]): Promise<T[]> {
  // Add soft delete filter if the query contains FROM and doesn't already have deleted_at condition
  let modifiedQuery = text;
  if (text.includes('FROM') && !text.includes('deleted_at')) {
    // Extract table name from query
    const tableMatch = text.match(/FROM\s+(\w+)/i);
    if (tableMatch) {
      const tableName = tableMatch[1];
      // Add soft delete filter
      if (text.includes('WHERE')) {
        modifiedQuery = text.replace(/WHERE/i, `WHERE ${tableName}.deleted_at IS NULL AND`);
      } else {
        modifiedQuery = text.replace(/FROM\s+(\w+)/i, `FROM $1 WHERE $1.deleted_at IS NULL`);
      }
    }
  }

  return query<T>(modifiedQuery, params);
}

// Soft delete a record
export async function softDelete<T>(table: string, id: string): Promise<T[]> {
  const text = `
    UPDATE ${table}
    SET deleted_at = NOW()
    WHERE id = $1 AND deleted_at IS NULL
    RETURNING *
  `;
  return query<T>(text, [id]);
}

// Restore a soft deleted record
export async function restore<T>(table: string, id: string): Promise<T[]> {
  const text = `
    UPDATE ${table}
    SET deleted_at = NULL
    WHERE id = $1 AND deleted_at IS NOT NULL
    RETURNING *
  `;
  return query<T>(text, [id]);
}

// Hard delete (permanent) - use with caution
export async function hardDelete<T>(table: string, id: string): Promise<T[]> {
  const text = `
    DELETE FROM ${table}
    WHERE id = $1
    RETURNING *
  `;
  return query<T>(text, [id]);
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL connected');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    return false;
  }
}