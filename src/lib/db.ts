
// Create a mock implementation for browser environments
// and use real MySQL connection in server environments

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Mock database tables for browser environment
const mockTables = {
  users: [] as any[],
  customer: [] as any[],
  restaurant: [] as any[],
  foods: [] as any[],
  delivery_partner: [] as any[],
  order_detail: [] as any[],
  order_food: [] as any[],
  payment_table: [] as any[]
};

// Mock implementation for browser
const mockQuery = async <T>(sql: string, params?: any[]): Promise<T> => {
  console.log('Mock DB Query:', { sql, params });
  
  // For INSERT queries in the browser environment, we'll simulate adding to our mock tables
  if (sql.toLowerCase().includes('insert into')) {
    const tableMatch = sql.match(/insert into\s+(\w+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : null;
    
    if (tableName && tableName === 'users' && params) {
      // For user registration
      const newUser = {
        user_id: Math.floor(Math.random() * 1000) + 1,
        email: params[0],
        password: params[1], // In a real app this would be hashed
        role: params[2] || 'customer',
        created_at: new Date().toISOString()
      };
      
      mockTables.users.push(newUser);
      
      // Store in localStorage to persist across page refreshes
      const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      storedUsers.push(newUser);
      localStorage.setItem('mockUsers', JSON.stringify(storedUsers));
      
      return { insertId: newUser.user_id } as unknown as T;
    }
    
    if (tableName && tableName === 'customer' && params) {
      // For customer registration
      const newCustomer = {
        customer_id: Math.floor(Math.random() * 1000) + 1,
        user_id: params[0],
        customer_name: params[1],
        customer_contact_number: params[2],
        customer_address: params[3],
        created_at: new Date().toISOString()
      };
      
      mockTables.customer.push(newCustomer);
      
      // Store in localStorage to persist across page refreshes
      const storedCustomers = JSON.parse(localStorage.getItem('mockCustomers') || '[]');
      storedCustomers.push(newCustomer);
      localStorage.setItem('mockCustomers', JSON.stringify(storedCustomers));
      
      return { insertId: newCustomer.customer_id } as unknown as T;
    }
    
    // Add similar handling for other tables as needed
  } 
  // For SELECT queries
  else if (sql.toLowerCase().includes('select')) {
    // Load stored data from localStorage
    if (!mockTables.users.length) {
      const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
      mockTables.users = storedUsers;
    }
    
    if (!mockTables.customer.length) {
      const storedCustomers = JSON.parse(localStorage.getItem('mockCustomers') || '[]');
      mockTables.customer = storedCustomers;
    }
    
    if (sql.includes('users WHERE email = ?') && params) {
      const email = params[0];
      const user = mockTables.users.find(u => u.email === email);
      return user ? [user] as unknown as T : [] as unknown as T;
    }
    
    if (sql.includes('customer WHERE user_id = ?') && params) {
      const userId = params[0];
      const customer = mockTables.customer.find(c => c.user_id === userId);
      return customer ? [customer] as unknown as T : [] as unknown as T;
    }
  }
  
  // Default return empty array for unhandled queries
  return [] as unknown as T;
};

// Real MySQL implementation (only used in server environments)
let pool: any;
let realQuery: <T>(sql: string, params?: any[]) => Promise<T>;

if (!isBrowser) {
  try {
    const mysql = require('mysql2/promise');
    
    // Database connection configuration
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Rudraksh2005.',
      database: process.env.DB_NAME || 'foodorderingdb', // Updated to match your database name
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
  } catch (error) {
    console.error('Failed to load mysql2 module (expected in browser):', error);
  }
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

// Load stored mock data from localStorage on initialization
if (isBrowser) {
  try {
    const storedUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const storedCustomers = JSON.parse(localStorage.getItem('mockCustomers') || '[]');
    
    mockTables.users = storedUsers;
    mockTables.customer = storedCustomers;
    
    console.log('Loaded mock data from localStorage:', {
      users: mockTables.users.length,
      customers: mockTables.customer.length
    });
  } catch (error) {
    console.error('Error loading mock data from localStorage:', error);
  }
}
