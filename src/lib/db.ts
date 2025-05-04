
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

// Initialize mock data from localStorage
function initMockDataFromStorage() {
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
    // If there was an error, clear the localStorage and start fresh
    localStorage.setItem('mockUsers', JSON.stringify([]));
    localStorage.setItem('mockCustomers', JSON.stringify([]));
  }
}

// Call this on initialization
if (isBrowser) {
  initMockDataFromStorage();
}

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
      localStorage.setItem('mockUsers', JSON.stringify(mockTables.users));
      
      console.log('Created new user:', newUser);
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
      localStorage.setItem('mockCustomers', JSON.stringify(mockTables.customer));
      
      console.log('Created new customer:', newCustomer);
      return { insertId: newCustomer.customer_id } as unknown as T;
    }
    
    // Add similar handling for other tables as needed
  } 
  // For SELECT queries
  else if (sql.toLowerCase().includes('select')) {
    // Load stored data from localStorage - ensure we have latest data
    initMockDataFromStorage();
    
    if (sql.includes('users WHERE email = ?') && params) {
      const email = params[0];
      console.log('Finding user with email:', email);
      console.log('Available users:', mockTables.users);
      const user = mockTables.users.find(u => u.email === email);
      console.log('Found user:', user);
      return user ? [user] as unknown as T : [] as unknown as T;
    }
    
    if (sql.includes('customer WHERE user_id = ?') && params) {
      const userId = params[0];
      console.log('Finding customer with user_id:', userId);
      console.log('Available customers:', mockTables.customer);
      const customer = mockTables.customer.find(c => c.user_id === userId);
      console.log('Found customer:', customer);
      return customer ? [customer] as unknown as T : [] as unknown as T;
    }

    if (sql.includes('users WHERE user_id = ?') && params) {
      const userId = params[0];
      console.log('Finding user with user_id:', userId);
      console.log('Available users:', mockTables.users);
      const user = mockTables.users.find(u => u.user_id === userId);
      console.log('Found user:', user);
      return user ? [user] as unknown as T : [] as unknown as T;
    }

    // Mock restaurant data
    if (sql.includes('restaurant')) {
      const mockRestaurants = [
        { res_id: 301, res_name: "Southern Spice", res_location: "Rushikonda", res_rating: 4.5 },
        { res_id: 302, res_name: "Deccan Pavilion", res_location: "MVP Colony", res_rating: 4.1 },
        { res_id: 303, res_name: "Barbeque Nation", res_location: "Gajuwaka", res_rating: 4.3 },
        { res_id: 304, res_name: "Sitara Grand", res_location: "Aganampudi", res_rating: 3.9 },
        { res_id: 305, res_name: "Paprika Restaurant", res_location: "Seethammadhara", res_rating: 3.6 },
      ];
      
      if (sql.includes('WHERE res_id = ?') && params) {
        const resId = params[0];
        const restaurant = mockRestaurants.find(r => r.res_id === resId);
        return restaurant ? [restaurant] as unknown as T : [] as unknown as T;
      }
      
      return mockRestaurants as unknown as T;
    }

    // Mock foods data
    if (sql.includes('foods')) {
      const mockFoods = [
        { food_id: 101, food_name: "Margherita Pizza", price_per_unit: 12.99, res_id: 301 },
        { food_id: 102, food_name: "Chicken Biryani", price_per_unit: 15.99, res_id: 302 },
        { food_id: 103, food_name: "Pasta Carbonara", price_per_unit: 14.50, res_id: 303 },
        { food_id: 104, food_name: "Vegetable Curry", price_per_unit: 11.99, res_id: 304 },
      ];
      
      if (sql.includes('WHERE res_id = ?') && params) {
        const resId = params[0];
        const foods = mockFoods.filter(f => f.res_id === resId);
        return foods as unknown as T;
      }
      
      return mockFoods as unknown as T;
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
      database: process.env.DB_NAME || 'foodorderingdb',
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

// Create a demo account if it doesn't exist
export async function ensureDemoAccount() {
  if (isBrowser) {
    const demoEmail = "demo@example.com";
    const demoPassword = "password123";
    
    // Check if demo account exists
    const existingUsers = await query<any[]>('SELECT * FROM users WHERE email = ?', [demoEmail]);
    
    if (!existingUsers.length) {
      console.log("Creating demo account");
      
      // Create user
      const userResult = await query<any>(
        'INSERT INTO users (email, password, role) VALUES (?, ?, "customer")',
        [demoEmail, demoPassword]
      );
      
      const userId = userResult.insertId;
      
      // Create customer
      await query(
        'INSERT INTO customer (user_id, customer_name, customer_contact_number, customer_address) VALUES (?, ?, ?, ?)',
        [userId, "Demo User", "1234567890", "123 Demo Street"]
      );
      
      console.log("Demo account created successfully");
      return true;
    }
    
    return false;
  }
  
  return false;
}

// Call this on initialization to ensure demo account exists
if (isBrowser) {
  ensureDemoAccount().catch(console.error);
}
