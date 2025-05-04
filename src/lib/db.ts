
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
    const storedOrders = JSON.parse(localStorage.getItem('mockOrders') || '[]');
    const storedOrderItems = JSON.parse(localStorage.getItem('mockOrderItems') || '[]');
    const storedRestaurants = JSON.parse(localStorage.getItem('mockRestaurants') || '[]');
    const storedFoods = JSON.parse(localStorage.getItem('mockFoods') || '[]');
    const storedDeliveryPartners = JSON.parse(localStorage.getItem('mockDeliveryPartners') || '[]');
    
    mockTables.users = storedUsers;
    mockTables.customer = storedCustomers;
    mockTables.order_detail = storedOrders;
    mockTables.order_food = storedOrderItems;
    mockTables.restaurant = storedRestaurants;
    mockTables.foods = storedFoods;
    mockTables.delivery_partner = storedDeliveryPartners;
    
    console.log('Loaded mock data from localStorage:', {
      users: mockTables.users.length,
      customers: mockTables.customer.length,
      orders: mockTables.order_detail.length,
      orderItems: mockTables.order_food.length,
      restaurants: mockTables.restaurant.length,
      foods: mockTables.foods.length,
      deliveryPartners: mockTables.delivery_partner.length
    });
  } catch (error) {
    console.error('Error loading mock data from localStorage:', error);
    // If there was an error, clear the localStorage and start fresh
    localStorage.setItem('mockUsers', JSON.stringify([]));
    localStorage.setItem('mockCustomers', JSON.stringify([]));
    localStorage.setItem('mockOrders', JSON.stringify([]));
    localStorage.setItem('mockOrderItems', JSON.stringify([]));
    localStorage.setItem('mockRestaurants', JSON.stringify([]));
    localStorage.setItem('mockFoods', JSON.stringify([]));
    localStorage.setItem('mockDeliveryPartners', JSON.stringify([]));
  }
}

// Initialize mock restaurant and food data
function initializeMockData() {
  // Only initialize if tables are empty
  if (mockTables.restaurant.length === 0) {
    const mockRestaurants = [
      { res_id: 301, res_name: "Southern Spice", res_location: "Rushikonda", res_rating: 4.5 },
      { res_id: 302, res_name: "Deccan Pavilion", res_location: "MVP Colony", res_rating: 4.1 },
      { res_id: 303, res_name: "Barbeque Nation", res_location: "Gajuwaka", res_rating: 4.3 },
      { res_id: 304, res_name: "Sitara Grand", res_location: "Aganampudi", res_rating: 3.9 },
      { res_id: 305, res_name: "Paprika Restaurant", res_location: "Seethammadhara", res_rating: 3.6 },
    ];
    mockTables.restaurant = mockRestaurants;
    localStorage.setItem('mockRestaurants', JSON.stringify(mockRestaurants));
  }
  
  if (mockTables.foods.length === 0) {
    const mockFoods = [
      { food_id: 101, food_name: "Margherita Pizza", price_per_unit: 12.99, res_id: 301, description: "Classic pizza with tomato sauce and cheese", is_vegetarian: true },
      { food_id: 102, food_name: "Chicken Biryani", price_per_unit: 15.99, res_id: 302, description: "Fragrant rice with spiced chicken", is_vegetarian: false },
      { food_id: 103, food_name: "Pasta Carbonara", price_per_unit: 14.50, res_id: 303, description: "Creamy pasta with bacon", is_vegetarian: false },
      { food_id: 104, food_name: "Vegetable Curry", price_per_unit: 11.99, res_id: 304, description: "Mixed vegetables in a spicy sauce", is_vegetarian: true },
    ];
    mockTables.foods = mockFoods;
    localStorage.setItem('mockFoods', JSON.stringify(mockFoods));
  }
  
  if (mockTables.delivery_partner.length === 0) {
    const mockDeliveryPartners = [
      { deliveryp_id: 401, deliveryp_name: "John Doe", deliveryp_contact: "1234567890", deliveryp_vehicle: "Motorcycle" },
      { deliveryp_id: 402, deliveryp_name: "Jane Smith", deliveryp_contact: "2345678901", deliveryp_vehicle: "Bicycle" },
      { deliveryp_id: 403, deliveryp_name: "Mike Johnson", deliveryp_contact: "3456789012", deliveryp_vehicle: "Car" },
    ];
    mockTables.delivery_partner = mockDeliveryPartners;
    localStorage.setItem('mockDeliveryPartners', JSON.stringify(mockDeliveryPartners));
  }
}

// Call this on initialization
if (isBrowser) {
  initMockDataFromStorage();
  initializeMockData();
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
    
    if (tableName && tableName === 'order_detail' && params) {
      // For creating new orders
      const newOrder = {
        order_id: Math.floor(Math.random() * 10000) + 1,
        customer_id: params[0],
        res_id: params[1],
        deliveryp_id: params[2] || null,
        order_status: params[3] || 'pending',
        ordered_time: new Date().toISOString(),
        delivered_time: null,
        total_amount: 0, // Will be calculated after order items are added
      };
      
      mockTables.order_detail.push(newOrder);
      
      // Store in localStorage to persist across page refreshes
      localStorage.setItem('mockOrders', JSON.stringify(mockTables.order_detail));
      
      console.log('Created new order:', newOrder);
      return { insertId: newOrder.order_id } as unknown as T;
    }
    
    if (tableName && tableName === 'order_food' && params) {
      // For adding items to an order
      const newOrderItem = {
        order_food_id: Math.floor(Math.random() * 10000) + 1,
        order_id: params[0],
        food_id: params[1],
        quantity: params[2],
      };
      
      mockTables.order_food.push(newOrderItem);
      
      // Store in localStorage to persist across page refreshes
      localStorage.setItem('mockOrderItems', JSON.stringify(mockTables.order_food));
      
      // Update the total amount in the order
      const food = mockTables.foods.find(f => f.food_id === newOrderItem.food_id);
      if (food) {
        const order = mockTables.order_detail.find(o => o.order_id === newOrderItem.order_id);
        if (order) {
          order.total_amount = order.total_amount || 0;
          order.total_amount += food.price_per_unit * newOrderItem.quantity;
          localStorage.setItem('mockOrders', JSON.stringify(mockTables.order_detail));
        }
      }
      
      console.log('Added new order item:', newOrderItem);
      return { insertId: newOrderItem.order_food_id } as unknown as T;
    }
    
    if (tableName && tableName === 'payment_table' && params) {
      // For creating payments
      const newPayment = {
        payment_id: Math.floor(Math.random() * 10000) + 1,
        order_id: params[0],
        payment_type: params[1],
        payment_status: params[2],
        payment_time: new Date().toISOString(),
      };
      
      mockTables.payment_table.push(newPayment);
      
      console.log('Created new payment:', newPayment);
      return { insertId: newPayment.payment_id } as unknown as T;
    }
  } 
  // For UPDATE queries
  else if (sql.toLowerCase().includes('update')) {
    if (sql.includes('order_detail') && sql.includes('order_status') && params) {
      const status = params[0];
      const orderId = params[1];
      
      const orderIndex = mockTables.order_detail.findIndex(order => order.order_id == orderId);
      if (orderIndex !== -1) {
        mockTables.order_detail[orderIndex].order_status = status;
        if (status === 'delivered') {
          mockTables.order_detail[orderIndex].delivered_time = new Date().toISOString();
        }
        
        // Store in localStorage to persist across page refreshes
        localStorage.setItem('mockOrders', JSON.stringify(mockTables.order_detail));
        console.log(`Updated order ${orderId} status to ${status}`);
      }
    }
    
    if (sql.includes('order_detail') && sql.includes('deliveryp_id') && params) {
      const deliveryPartnerId = params[0];
      const orderId = params[1];
      
      const orderIndex = mockTables.order_detail.findIndex(order => order.order_id == orderId);
      if (orderIndex !== -1) {
        mockTables.order_detail[orderIndex].deliveryp_id = deliveryPartnerId;
        
        // Store in localStorage to persist across page refreshes
        localStorage.setItem('mockOrders', JSON.stringify(mockTables.order_detail));
        console.log(`Assigned delivery partner ${deliveryPartnerId} to order ${orderId}`);
      }
    }
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
      const user = mockTables.users.find(u => u.user_id === parseInt(userId, 10));
      console.log('Found user:', user);
      return user ? [user] as unknown as T : [] as unknown as T;
    }

    // Mock restaurant data
    if (sql.includes('restaurant')) {
      if (mockTables.restaurant.length === 0) {
        initializeMockData();
      }
      
      if (sql.includes('WHERE res_id = ?') && params) {
        const resId = params[0];
        const restaurant = mockTables.restaurant.find(r => r.res_id === parseInt(resId, 10));
        return restaurant ? [restaurant] as unknown as T : [] as unknown as T;
      }
      
      return mockTables.restaurant as unknown as T;
    }

    // Mock foods data
    if (sql.includes('foods')) {
      if (mockTables.foods.length === 0) {
        initializeMockData();
      }
      
      if (sql.includes('WHERE res_id = ?') && params) {
        const resId = params[0];
        const foods = mockTables.foods.filter(f => f.res_id === parseInt(resId, 10));
        return foods as unknown as T;
      }
      
      if (sql.includes('WHERE food_id = ?') && params) {
        const foodId = params[0];
        const food = mockTables.foods.find(f => f.food_id === parseInt(foodId, 10));
        return food ? [food] as unknown as T : [] as unknown as T;
      }
      
      return mockTables.foods as unknown as T;
    }

    // Orders
    if (sql.includes('order_detail')) {
      // Get order by ID
      if (sql.includes('WHERE order_id = ?') && params) {
        const orderId = params[0];
        const order = mockTables.order_detail.find(o => o.order_id === parseInt(orderId, 10));
        return order ? [order] as unknown as T : [] as unknown as T;
      }
      
      // Get all orders for admin dashboard
      if (sql.includes('JOIN restaurant') && !sql.includes('WHERE od.customer_id')) {
        // Simulate joining with restaurant and customer tables
        const orders = mockTables.order_detail.map(order => {
          const restaurant = mockTables.restaurant.find(r => r.res_id === order.res_id);
          const customer = mockTables.customer.find(c => c.customer_id === order.customer_id);
          const deliveryPartner = mockTables.delivery_partner.find(dp => dp.deliveryp_id === order.deliveryp_id);
          
          return {
            ...order,
            restaurant_name: restaurant?.res_name || 'Unknown Restaurant',
            customer_name: customer?.customer_name || 'Unknown Customer',
            deliveryp_name: deliveryPartner?.deliveryp_name || 'Not Assigned'
          };
        });
        
        // Filter by status if provided
        if (sql.includes('WHERE od.order_status = ?') && params) {
          const status = params[0];
          const filteredOrders = orders.filter(order => order.order_status === status);
          return filteredOrders as unknown as T;
        }
        
        return orders as unknown as T;
      }
      
      // Get orders for a specific customer
      if (sql.includes('WHERE od.customer_id = ?') && params) {
        const customerId = params[0];
        const customerOrders = mockTables.order_detail.filter(o => o.customer_id === parseInt(customerId, 10));
        
        // Simulate joining with restaurant
        const ordersWithRestaurant = customerOrders.map(order => {
          const restaurant = mockTables.restaurant.find(r => r.res_id === order.res_id);
          return {
            ...order,
            restaurant_name: restaurant?.res_name || 'Unknown Restaurant'
          };
        });
        
        return ordersWithRestaurant as unknown as T;
      }
      
      return mockTables.order_detail as unknown as T;
    }
    
    // Order items
    if (sql.includes('order_food')) {
      if (sql.includes('WHERE of.order_id = ?') && params) {
        const orderId = params[0];
        const orderItems = mockTables.order_food.filter(item => item.order_id === parseInt(orderId, 10));
        
        // Simulate joining with foods table
        const itemsWithDetails = orderItems.map(item => {
          const food = mockTables.foods.find(f => f.food_id === item.food_id);
          return {
            ...item,
            food_name: food?.food_name || 'Unknown Item',
            price_per_unit: food?.price_per_unit || 0
          };
        });
        
        return itemsWithDetails as unknown as T;
      }
      
      return mockTables.order_food as unknown as T;
    }

    // Delivery partners
    if (sql.includes('delivery_partner')) {
      if (mockTables.delivery_partner.length === 0) {
        initializeMockData();
      }
      return mockTables.delivery_partner as unknown as T;
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
