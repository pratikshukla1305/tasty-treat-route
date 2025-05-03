
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

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
          children: "Clear Cart",
          altText: "Clear Cart",
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
  getDashboardData: () => fetchApi<AdminDashboardData>("/admin/dashboard"),
  
  getAllOrders: (status?: string) => 
    fetchApi<Order[]>(`/admin/orders${status ? `?status=${status}` : ''}`),
    
  getAllRestaurants: () => fetchApi<Restaurant[]>("/admin/restaurants"),
  
  updateRestaurant: (id: number, data: Partial<Restaurant>) =>
    fetchApi<Restaurant>(`/admin/restaurants/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    
  createRestaurant: (data: Omit<Restaurant, "res_id">) =>
    fetchApi<Restaurant>("/admin/restaurants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  getAllFoods: () => fetchApi<Food[]>("/admin/foods"),
  
  updateFood: (id: number, data: Partial<Food>) =>
    fetchApi<Food>(`/admin/foods/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    
  createFood: (data: Omit<Food, "food_id">) =>
    fetchApi<Food>("/admin/foods", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    
  getAllUsers: () => fetchApi<User[]>("/admin/users"),
  
  getDeliveryPartners: () => fetchApi<any[]>("/admin/delivery-partners"),
  
  assignDeliveryPartner: (orderId: number, deliveryPartnerId: number) =>
    fetchApi<Order>(`/admin/orders/${orderId}/assign-delivery`, {
      method: "PUT",
      body: JSON.stringify({ deliveryp_id: deliveryPartnerId }),
    }),
    
  updateStatus: (orderId: number, status: string) =>
    fetchApi<Order>(`/admin/orders/${orderId}/status`, {
      method: "PUT", 
      body: JSON.stringify({ status }),
    }),
};
