
import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'srijan@2006',
  database: 'food_delivery', // Make sure this matches your database name
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Utility function to execute SQL queries
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
