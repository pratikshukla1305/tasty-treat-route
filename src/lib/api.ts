import { toast } from "@/components/ui/use-toast";
import { query } from "./db";

const API_URL = "http://localhost:5000/api";

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
        const foods = await query<Food[]>('SELECT * FROM food');
        return foods as unknown as T;
      }
      else if (endpoint.startsWith("/foods/restaurant/")) {
        const restaurantId = endpoint.split("/").pop();
        if (restaurantId) {
          const foods = await query<Food[]>('SELECT * FROM food WHERE restaurant_id = ?', [restaurantId]);
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
          // Insert order into database and get order_id
          const result = await query<any>(
            'INSERT INTO orders (customer_id, res_id, order_status, total_amount) VALUES (?, ?, "pending", ?)', 
            [orderData.customer_id, orderData.res_id, orderData.total_amount || 0]
          );
          
          const orderId = result.insertId;
          
          // Insert order items
          for (const item of orderData.items) {
            await query(
              'INSERT INTO order_items (order_id, food_id, quantity) VALUES (?, ?, ?)',
              [orderId, item.food_id, item.quantity]
            );
          }
          
          // Fetch the created order
          const order = await query<Order[]>(
            'SELECT * FROM orders WHERE order_id = ?', 
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
        const customerId = 1; // Replace with actual logic to get customer_id from token
        
        const orders = await query<Order[]>(
          `SELECT o.*, r.res_name as restaurant_name 
           FROM orders o 
           JOIN restaurant r ON o.res_id = r.res_id 
           WHERE o.customer_id = ? 
           ORDER BY o.ordered_time DESC`,
          [customerId]
        );
        
        // Get items for each order
        for (const order of orders) {
          const items = await query<OrderItem[]>(
            `SELECT oi.*, f.food_name, f.price_per_unit 
             FROM order_items oi 
             JOIN food f ON oi.food_id = f.food_id 
             WHERE oi.order_id = ?`,
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
        
        const users = await query<User[]>(
          'SELECT * FROM customer WHERE email = ?',
          [email]
        );
        
        if (users.length === 0) {
          throw new Error("Invalid email or password");
        }
        
        const user = users[0];
        // In a real app, you'd hash passwords and compare hashes
        // This is just a mock implementation for demonstration
        
        // Mock token generation
        const token = `mock_token_${user.customer_id}`;
        localStorage.setItem("foodAppToken", token);
        
        return {
          token,
          user
        } as unknown as T;
      }
      else if (endpoint === "/auth/register" && options.method === "POST") {
        const userData = JSON.parse(options.body as string);
        
        // Check if user already exists
        const existingUsers = await query<User[]>(
          'SELECT * FROM customer WHERE email = ?',
          [userData.email]
        );
        
        if (existingUsers.length > 0) {
          throw new Error("Email already in use");
        }
        
        // Insert new user
        const result = await query<any>(
          'INSERT INTO customer (customer_name, email, customer_contact_number, customer_address) VALUES (?, ?, ?, ?)',
          [userData.customer_name, userData.email, userData.customer_contact_number, userData.customer_address]
        );
        
        const customerId = result.insertId;
        
        // In a real app, you'd store hashed passwords in a separate table
        // For demo purposes only
        
        // Fetch the created user
        const users = await query<User[]>(
          'SELECT * FROM customer WHERE customer_id = ?',
          [customerId]
        );
        
        const user = users[0];
        const token = `mock_token_${customerId}`;
        localStorage.setItem("foodAppToken", token);
        
        return {
          token,
          user
        } as unknown as T;
      }
    }
    
    // For other endpoints or if database access fails, fall back to API call
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "An error occurred");
    }

    return data.data as T;
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
  restaurant_id?: number;
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
      // Show toast with action button
      toast({
        title: "Different Restaurant",
        description: "Your cart contains items from a different restaurant. Would you like to clear your cart?",
        action: {
          actionText: "Clear Cart",
          onClick: () => {
            cart.clearCart();
            cart.addItem(item);
          },
        },
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
      const [totalOrdersResult] = await query<any[]>('SELECT COUNT(*) as count FROM orders');
      const totalOrders = totalOrdersResult.count || 0;
      
      // Total revenue
      const [totalRevenueResult] = await query<any[]>('SELECT SUM(total_amount) as total FROM orders');
      const totalRevenue = totalRevenueResult.total || 0;
      
      // Total customers
      const [totalCustomersResult] = await query<any[]>('SELECT COUNT(*) as count FROM customer');
      const totalCustomers = totalCustomersResult.count || 0;
      
      // Recent orders
      const recentOrders = await query<Order[]>(
        `SELECT o.*, r.res_name as restaurant_name, c.customer_name 
         FROM orders o 
         JOIN restaurant r ON o.res_id = r.res_id 
         JOIN customer c ON o.customer_id = c.customer_id 
         ORDER BY o.ordered_time DESC LIMIT 5`
      );
      
      // Top foods
      const topFoods = await query<{ food_name: string; count: number }[]>(
        `SELECT f.food_name, COUNT(oi.food_id) as count 
         FROM order_items oi 
         JOIN food f ON oi.food_id = f.food_id 
         GROUP BY oi.food_id 
         ORDER BY count DESC LIMIT 5`
      );
      
      // Top restaurants
      const topRestaurants = await query<{ res_name: string; count: number }[]>(
        `SELECT r.res_name, COUNT(o.res_id) as count 
         FROM orders o 
         JOIN restaurant r ON o.res_id = r.res_id 
         GROUP BY o.res_id 
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
        SELECT o.*, r.res_name as restaurant_name, c.customer_name, dp.deliveryp_name 
        FROM orders o 
        JOIN restaurant r ON o.res_id = r.res_id 
        JOIN customer c ON o.customer_id = c.customer_id 
        LEFT JOIN delivery_partner dp ON o.deliveryp_id = dp.deliveryp_id 
      `;
      
      const params = [];
      
      if (status) {
        sql += ' WHERE o.order_status = ?';
        params.push(status);
      }
      
      sql += ' ORDER BY o.ordered_time DESC';
      
      const orders = await query<Order[]>(sql, params);
      
      // Get items for each order
      for (const order of orders) {
        const items = await query<OrderItem[]>(
          `SELECT oi.*, f.food_name, f.price_per_unit 
           FROM order_items oi 
           JOIN food f ON oi.food_id = f.food_id 
           WHERE oi.order_id = ?`,
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
    
  getAllFoods: () => query<Food[]>('SELECT * FROM food'),
  
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
        `UPDATE food SET ${setClause} WHERE food_id = ?`,
        [...values, id]
      );
      
      // Fetch the updated food
      const foods = await query<Food[]>(
        'SELECT * FROM food WHERE food_id = ?',
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
        `INSERT INTO food (${fields.join(', ')}) VALUES (${placeholders})`,
        values
      );
      
      const foodId = result.insertId;
      
      // Fetch the created food
      const foods = await query<Food[]>(
        'SELECT * FROM food WHERE food_id = ?',
        [foodId]
      );
      
      return foods[0];
    } catch (error) {
      console.error("Error creating food:", error);
      throw error;
    }
  },
    
  getAllUsers: () => query<User[]>('SELECT * FROM customer'),
  
  getDeliveryPartners: () => query<any[]>('SELECT * FROM delivery_partner'),
  
  assignDeliveryPartner: async (orderId: number, deliveryPartnerId: number) => {
    try {
      await query(
        'UPDATE orders SET deliveryp_id = ? WHERE order_id = ?',
        [deliveryPartnerId, orderId]
      );
      
      // Fetch the updated order
      const orders = await query<Order[]>(
        `SELECT o.*, r.res_name as restaurant_name, dp.deliveryp_name 
         FROM orders o 
         JOIN restaurant r ON o.res_id = r.res_id 
         LEFT JOIN delivery_partner dp ON o.deliveryp_id = dp.deliveryp_id 
         WHERE o.order_id = ?`,
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
        'UPDATE orders SET order_status = ? WHERE order_id = ?',
        [status, orderId]
      );
      
      // Fetch the updated order
      const orders = await query<Order[]>(
        `SELECT o.*, r.res_name as restaurant_name, dp.deliveryp_name 
         FROM orders o 
         JOIN restaurant r ON o.res_id = r.res_id 
         LEFT JOIN delivery_partner dp ON o.deliveryp_id = dp.deliveryp_id 
         WHERE o.order_id = ?`,
        [orderId]
      );
      
      return orders[0];
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },
};
