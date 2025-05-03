
// Create a mock implementation for browser environments
// and use real MySQL connection in server environments

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock implementation for browser
const mockQuery = async <T>(sql: string, params?: any[]): Promise<T> => {
  console.log('Mock DB Query:', { sql, params });
  // This would normally return mock data based on the query
  // For now we'll just return an empty array as mock data
  return [] as unknown as T;
};

// Real MySQL implementation (only used in server environments)
let pool: any;
let realQuery: <T>(sql: string, params?: any[]) => Promise<T>;

if (!isBrowser) {
  const mysql = require('mysql2/promise');
  
  // Database connection configuration
  const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'srijan@2006',
    database: 'food_delivery', // Make sure this matches your database name
  };

  // Create connection pool
  pool = mysql.createPool(dbConfig);

  // Utility function to execute SQL queries
  realQuery = async function query<T>(sql: string, params?: any[]): Promise<T> {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows as T;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  };
}

// Export the appropriate implementation based on environment
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  if (isBrowser) {
    // In browser, use mock implementation
    return mockQuery<T>(sql, params);
  } else {
    // In server, use real implementation
    return realQuery<T>(sql, params);
  }
}

// Test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    if (isBrowser) {
      console.log('Database connection test skipped in browser environment');
      return true;
    } else {
      await query('SELECT 1');
      console.log('Database connection successful');
      return true;
    }
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
