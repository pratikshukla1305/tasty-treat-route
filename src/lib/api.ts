
import { toast } from "@/hooks/use-toast";
import { query } from "./db";

const API_URL = "http://localhost:3000/api"; // Changed to match your backend port

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic fetch function with error handling
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Get token from localStorage if available
  const token = localStorage.getItem("foodAppToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // For local development, we'll directly use database queries instead of API calls
    if (endpoint.startsWith("/restaurants")) {
      // Handle restaurant-related endpoints directly with MySQL
      if (endpoint === "/restaurants") {
        const restaurants = await query<Restaurant[]>('SELECT * FROM restaurant');
        return restaurants as unknown as T;
      } 
      else if (endpoint.startsWith("/restaurants/")) {
        const id = endpoint.split("/").pop();
        if (id) {
          const restaurant = await query<Restaurant[]>('SELECT * FROM restaurant WHERE res_id = ?', [id]);
          return (restaurant[0] || null) as unknown as T;
        }
      }
    }
    else if (endpoint.startsWith("/foods")) {
      // Handle food-related endpoints directly with MySQL
      if (endpoint === "/foods") {
        const foods = await query<Food[]>('SELECT * FROM foods');
        return foods as unknown as T;
      }
      else if (endpoint.startsWith("/foods/restaurant/")) {
        const restaurantId = endpoint.split("/").pop();
        if (restaurantId) {
          const foods = await query<Food[]>('SELECT * FROM foods WHERE res_id = ?', [restaurantId]);
          return foods as unknown as T;
        }
      }
    }
    else if (endpoint.startsWith("/orders")) {
      // Handle order-related endpoints
      if (endpoint === "/orders") {
        // Create order
        if (options.method === "POST") {
          const orderData = JSON.parse(options.body as string) as Order;
          
          // Get customer_id from user_id (in a real app, we'd use authenticated user)
          const userId = orderData.customer_id; // This should be the user_id in the new schema
          
          // Insert order into database and get order_id
          const result = await query<any>(
            'INSERT INTO order_detail (customer_id, res_id, deliveryp_id, order_status) VALUES (?, ?, 1, "pending")', 
            [userId, orderData.res_id]
          );
          
          const orderId = result.insertId;
          
          // Insert order items
          for (const item of orderData.items) {
            await query(
              'INSERT INTO order_food (order_id, food_id, quantity) VALUES (?, ?, ?)',
              [orderId, item.food_id, item.quantity]
            );
          }
          
          // Insert payment info
          await query(
            'INSERT INTO payment_table (order_id, payment_type, payment_status) VALUES (?, "cod", "pending")',
            [orderId]
          );
          
          // Fetch the created order
          const order = await query<Order[]>(
            'SELECT * FROM order_detail WHERE order_id = ?', 
            [orderId]
          );
          
          return order[0] as unknown as T;
        }
      }
      else if (endpoint === "/orders/user") {
        // Get user orders
        const token = localStorage.getItem("foodAppToken");
        if (!token) throw new Error("Not authenticated");
        
        // Extract user ID from token (in a real app, you'd verify the token)
        // This is just a mock implementation
        const userId = 1; // Replace with actual logic to get user_id from token
        
        const orders = await query<Order[]>(
          `SELECT od.*, r.res_name as restaurant_name 
           FROM order_detail od 
           JOIN restaurant r ON od.res_id = r.res_id 
           WHERE od.customer_id = ? 
           ORDER BY od.ordered_time DESC`,
          [userId]
        );
        
        // Get items for each order
        for (const order of orders) {
          const items = await query<OrderItem[]>(
            `SELECT of.*, f.food_name, f.price_per_unit 
             FROM order_food of 
             JOIN foods f ON of.food_id = f.food_id 
             WHERE of.order_id = ?`,
            [order.order_id]
          );
          order.items = items;
        }
        
        return orders as unknown as T;
      }
    }
    else if (endpoint.startsWith("/auth")) {
      if (endpoint === "/auth/login" && options.method === "POST") {
        const { email, password } = JSON.parse(options.body as string);
        
        // In a real app, this would verify against the backend
        // For browser development, we'll use our mock implementation
        
        // First find the user
        const users = await query<any[]>(
          'SELECT * FROM users WHERE email = ?',
          [email]
        );
        
        if (users.length === 0) {
          throw new Error("Invalid email or password");
        }
        
        const user = users[0];
        // In a real app, you'd hash passwords and compare hashes
        
        // Get the customer details
        const customers = await query<User[]>(
          'SELECT * FROM customer WHERE user_id = ?',
          [user.user_id]
        );
        
        if (customers.length === 0) {
          throw new Error("Customer details not found");
        }
        
        const customer = customers[0];
        
        // Mock token generation
        const token = `mock_token_${user.user_id}`;
        localStorage.setItem("foodAppToken", token);
        
        // Map to existing interface
        const userData: User = {
          customer_id: customer.customer_id,
          customer_name: customer.customer_name,
          customer_contact_number: customer.customer_contact_number,
          customer_address: customer.customer_address,
          email: user.email
        };
        
        return {
          token,
          user: userData
        } as unknown as T;
      }
      else if (endpoint === "/auth/register" && options.method === "POST") {
        const userData = JSON.parse(options.body as string);
        
        try {
          // First create the user
          const userResult = await query<any>(
            'INSERT INTO users (email, password, role) VALUES (?, ?, "customer")',
            [userData.email, userData.password] // In a real app, this would be hashed
          );
          
          const userId = userResult?.insertId || Math.floor(Math.random() * 1000) + 1;
          
          // Then create the customer
          const customerResult = await query<any>(
            'INSERT INTO customer (user_id, customer_name, customer_contact_number, customer_address) VALUES (?, ?, ?, ?)',
            [userId, userData.customer_name, userData.customer_contact_number, userData.customer_address]
          );
          
          const customerId = customerResult?.insertId || Math.floor(Math.random() * 1000) + 1;
          
          // Create a user object to match existing interface
          let user: User = {
            customer_id: customerId,
            customer_name: userData.customer_name,
            customer_contact_number: userData.customer_contact_number,
            customer_address: userData.customer_address,
            email: userData.email
          };
          
          // Generate token
          const token = `mock_token_${userId}`;
          localStorage.setItem("foodAppToken", token);
          
          return {
            token,
            user
          } as unknown as T;
        } catch (error) {
          console.error("Registration error:", error);
          throw new Error("Failed to create user account");
        }
      }
    }
    
    // For other endpoints or if database access fails, fall back to API call
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "An error occurred");
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    throw error;
  }
}

// User Authentication and Management
export interface User {
  customer_id: number;
  customer_name: string;
  customer_contact_number: string;
  customer_address: string;
  email?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const auth = {
  login: (email: string, password: string) =>
    fetchApi<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: {
    customer_name: string;
    email: string;
    password: string;
    customer_contact_number: string;
    customer_address: string;
  }) =>
    fetchApi<LoginResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () => fetchApi<User>("/auth/me"),
  
  updateProfile: (userData: Partial<User>) =>
    fetchApi<User>("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    }),
};

// Restaurant Related APIs
export interface Restaurant {
  res_id: number;
  res_name: string;
  res_location: string;
  res_rating: number;
  image_url?: string;
}

export const restaurants = {
  getAll: () => fetchApi<Restaurant[]>("/restaurants"),
  
  getById: (id: number) => fetchApi<Restaurant>(`/restaurants/${id}`),
  
  getFeatured: () => fetchApi<Restaurant[]>("/restaurants/featured"),
  
  search: (query: string) => fetchApi<Restaurant[]>(`/restaurants/search?q=${query}`),
};

// Food Related APIs
export interface Food {
  food_id: number;
  food_name: string;
  price_per_unit: number;
  restaurant_id?: number; // In your schema this is res_id
  res_id?: number;        // Added to match your schema
  category?: string;
  description?: string;
  image_url?: string;
  is_vegetarian?: boolean;
  is_bestseller?: boolean;
}

export const foods = {
  getAll: () => fetchApi<Food[]>("/foods"),
  
  getById: (id: number) => fetchApi<Food>(`/foods/${id}`),
  
  getByRestaurant: (restaurantId: number) => fetchApi<Food[]>(`/foods/restaurant/${restaurantId}`),
  
  search: (query: string) => fetchApi<Food[]>(`/foods/search?q=${query}`),
  
  getFeatured: () => fetchApi<Food[]>("/foods/featured"),
};

// Order Related APIs
export interface OrderItem {
  food_id: number;
  quantity: number;
  food_name?: string;
  price_per_unit?: number;
}

export interface Order {
  order_id?: number;
  customer_id: number;
  res_id: number;
  order_status?: string;
  ordered_time?: string;
  delivered_time?: string;
  total_amount?: number;
  items: OrderItem[];
  restaurant_name?: string;
  deliveryp_name?: string;
  deliveryp_id?: number;
  payment_id?: number;
  payment_type?: string;
  payment_status?: string;
}

export const orders = {
  create: (orderData: Omit<Order, "order_id">) =>
    fetchApi<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
    
  getUserOrders: () => fetchApi<Order[]>("/orders/user"),
  
  getById: (id: number) => fetchApi<Order>(`/orders/${id}`),
  
  updateStatus: (id: number, status: string) =>
    fetchApi<Order>(`/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// Cart Functions (Local Storage)
export interface CartItem extends OrderItem {
  food_name: string;
  price_per_unit: number;
  restaurant_id: number;
  restaurant_name?: string;
  image_url?: string;
  is_vegetarian?: boolean;
}

export const cart = {
  getItems: (): CartItem[] => {
    const cartData = localStorage.getItem("foodCart");
    return cartData ? JSON.parse(cartData) : [];
  },
  
  addItem: (item: CartItem) => {
    const currentCart = cart.getItems();
    
    // Check if adding from a different restaurant
    if (currentCart.length > 0 && currentCart[0].restaurant_id !== item.restaurant_id) {
      // Show toast with action
      toast({
        title: "Different Restaurant",
        description: "Your cart contains items from a different restaurant. Would you like to clear your cart?",
      });
      return false;
    }
    
    // Check if item exists in cart already
    const existingItemIndex = currentCart.findIndex(cartItem => cartItem.food_id === item.food_id);
    
    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += item.quantity;
    } else {
      currentCart.push(item);
    }
    
    localStorage.setItem("foodCart", JSON.stringify(currentCart));
    return true;
  },
  
  updateQuantity: (foodId: number, quantity: number) => {
    const currentCart = cart.getItems();
    const itemIndex = currentCart.findIndex(item => item.food_id === foodId);
    
    if (itemIndex > -1) {
      if (quantity <= 0) {
        currentCart.splice(itemIndex, 1);
      } else {
        currentCart[itemIndex].quantity = quantity;
      }
      
      localStorage.setItem("foodCart", JSON.stringify(currentCart));
    }
  },
  
  removeItem: (foodId: number) => {
    const currentCart = cart.getItems();
    const updatedCart = currentCart.filter(item => item.food_id !== foodId);
    localStorage.setItem("foodCart", JSON.stringify(updatedCart));
  },
  
  clearCart: () => {
    localStorage.setItem("foodCart", JSON.stringify([]));
  },
  
  getCartTotal: () => {
    const currentCart = cart.getItems();
    return currentCart.reduce((total, item) => total + (item.price_per_unit * item.quantity), 0);
  },
  
  getRestaurantInfo: () => {
    const currentCart = cart.getItems();
    if (currentCart.length === 0) return null;
    
    return {
      restaurant_id: currentCart[0].restaurant_id,
      restaurant_name: currentCart[0].restaurant_name
    };
  }
};

// Admin APIs
export interface AdminDashboardData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  recentOrders: Order[];
  topFoods: { food_name: string; count: number }[];
  topRestaurants: { res_name: string; count: number }[];
}

export const admin = {
  getDashboardData: async () => {
    // Get data from MySQL for dashboard
    try {
      // Total orders
      const [totalOrdersResult] = await query<any[]>('SELECT COUNT(*) as count FROM order_detail');
      const totalOrders = totalOrdersResult.count || 0;
      
      // Total revenue
      const [totalRevenueResult] = await query<any[]>(
        'SELECT SUM(f.price_per_unit * of.quantity) as total FROM order_food of JOIN foods f ON of.food_id = f.food_id'
      );
      const totalRevenue = totalRevenueResult.total || 0;
      
      // Total customers
      const [totalCustomersResult] = await query<any[]>('SELECT COUNT(*) as count FROM customer');
      const totalCustomers = totalCustomersResult.count || 0;
      
      // Recent orders
      const recentOrders = await query<Order[]>(
        `SELECT od.*, r.res_name as restaurant_name, c.customer_name 
         FROM order_detail od 
         JOIN restaurant r ON od.res_id = r.res_id 
         JOIN customer c ON od.customer_id = c.user_id 
         ORDER BY od.ordered_time DESC LIMIT 5`
      );
      
      // Top foods
      const topFoods = await query<{ food_name: string; count: number }[]>(
        `SELECT f.food_name, COUNT(of.food_id) as count 
         FROM order_food of 
         JOIN foods f ON of.food_id = f.food_id 
         GROUP BY of.food_id 
         ORDER BY count DESC LIMIT 5`
      );
      
      // Top restaurants
      const topRestaurants = await query<{ res_name: string; count: number }[]>(
        `SELECT r.res_name, COUNT(od.res_id) as count 
         FROM order_detail od 
         JOIN restaurant r ON od.res_id = r.res_id 
         GROUP BY od.res_id 
         ORDER BY count DESC LIMIT 5`
      );
      
      return {
        totalOrders,
        totalRevenue,
        totalCustomers,
        recentOrders,
        topFoods,
        topRestaurants
      } as AdminDashboardData;
    } catch (error) {
      console.error("Error getting admin dashboard data:", error);
      throw error;
    }
  },
  
  getAllOrders: async (status?: string) => {
    try {
      let sql = `
        SELECT od.*, r.res_name as restaurant_name, c.customer_name, dp.deliveryp_name 
        FROM order_detail od 
        JOIN restaurant r ON od.res_id = r.res_id 
        JOIN customer c ON od.customer_id = c.user_id 
        LEFT JOIN delivery_partner dp ON od.deliveryp_id = dp.deliveryp_id 
      `;
      
      const params = [];
      
      if (status) {
        sql += ' WHERE od.order_status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY od.ordered_time DESC';
      
      const orders = await query<Order[]>(sql, params);
      
      // Get items for each order
      for (const order of orders) {
        const items = await query<OrderItem[]>(
          `SELECT of.*, f.food_name, f.price_per_unit 
           FROM order_food of 
           JOIN foods f ON of.food_id = f.food_id 
           WHERE of.order_id = ?`,
          [order.order_id]
        );
        order.items = items;
      }
      
      return orders;
    } catch (error) {
      console.error("Error getting admin orders:", error);
      throw error;
    }
  },
    
  getAllRestaurants: () => query<Restaurant[]>('SELECT * FROM restaurant'),
  
  updateRestaurant: async (id: number, data: Partial<Restaurant>) => {
    try {
      // Build the SET clause dynamically
      const fields = Object.keys(data);
      const values = Object.values(data);
      
      if (fields.length === 0) {
        throw new Error("No fields to update");
      }
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await query(
        `UPDATE restaurant SET ${setClause} WHERE res_id = ?`,
        [...values, id]
      );
      
      // Fetch the updated restaurant
      const restaurants = await query<Restaurant[]>(
        'SELECT * FROM restaurant WHERE res_id = ?',
        [id]
      );
      
      return restaurants[0];
    } catch (error) {
      console.error("Error updating restaurant:", error);
      throw error;
    }
  },
    
  createRestaurant: async (data: Omit<Restaurant, "res_id">) => {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map(() => '?').join(', ');
      
      const result = await query<any>(
        `INSERT INTO restaurant (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      const restaurantId = result.insertId;
      
      // Fetch the created restaurant
      const restaurants = await query<Restaurant[]>(
        'SELECT * FROM restaurant WHERE res_id = ?',
        [restaurantId]
      );
      
      return restaurants[0];
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  },
    
  getAllFoods: () => query<Food[]>('SELECT * FROM foods'),
  
  updateFood: async (id: number, data: Partial<Food>) => {
    try {
      // Build the SET clause dynamically
      const fields = Object.keys(data);
      const values = Object.values(data);
      
      if (fields.length === 0) {
        throw new Error("No fields to update");
      }
      
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      
      await query(
        `UPDATE foods SET ${setClause} WHERE food_id = ?`,
        [...values, id]
      );
      
      // Fetch the updated food
      const foods = await query<Food[]>(
        'SELECT * FROM foods WHERE food_id = ?',
        [id]
      );
      
      return foods[0];
    } catch (error) {
      console.error("Error updating food:", error);
      throw error;
    }
  },
    
  createFood: async (data: Omit<Food, "food_id">) => {
    try {
      const fields = Object.keys(data);
      const values = Object.values(data);
      const placeholders = fields.map(() => '?').join(', ');
      
      const result = await query<any>(
        `INSERT INTO foods (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      const foodId = result.insertId;
      
      // Fetch the created food
      const foods = await query<Food[]>(
        'SELECT * FROM foods WHERE food_id = ?',
        [foodId]
      );
      
      return foods[0];
    } catch (error) {
      console.error("Error creating food:", error);
      throw error;
    }
  },
    
  getAllUsers: () => query<User[]>('SELECT c.*, u.email FROM customer c JOIN users u ON c.user_id = u.user_id'),
  
  getDeliveryPartners: () => query<any[]>('SELECT * FROM delivery_partner'),
  
  assignDeliveryPartner: async (orderId: number, deliveryPartnerId: number) => {
    try {
      await query(
        'UPDATE order_detail SET deliveryp_id = ? WHERE order_id = ?',
        [deliveryPartnerId, orderId]
      );
      
      // Fetch the updated order
      const orders = await query<Order[]>(
        `SELECT od.*, r.res_name as restaurant_name, dp.deliveryp_name 
         FROM order_detail od 
         JOIN restaurant r ON od.res_id = r.res_id 
         LEFT JOIN delivery_partner dp ON od.deliveryp_id = dp.deliveryp_id 
         WHERE od.order_id = ?`,
        [orderId]
      );
      
      return orders[0];
    } catch (error) {
      console.error("Error assigning delivery partner:", error);
      throw error;
    }
  },
    
  updateStatus: async (orderId: number, status: string) => {
    try {
      await query(
        'UPDATE order_detail SET order_status = ? WHERE order_id = ?',
        [status, orderId]
      );
      
      // Fetch the updated order
      const orders = await query<Order[]>(
        `SELECT od.*, r.res_name as restaurant_name, dp.deliveryp_name 
         FROM order_detail od 
         JOIN restaurant r ON od.res_id = r.res_id 
         LEFT JOIN delivery_partner dp ON od.deliveryp_id = dp.deliveryp_id 
         WHERE od.order_id = ?`,
        [orderId]
      );
      
      return orders[0];
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },
};
