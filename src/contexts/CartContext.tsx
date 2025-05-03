
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { cart as cartApi, CartItem } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (foodId: number) => void;
  updateQuantity: (foodId: number, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  itemCount: number;
  restaurantInfo: { restaurant_id: number; restaurant_name?: string } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [restaurantInfo, setRestaurantInfo] = useState<{ restaurant_id: number; restaurant_name?: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load cart from local storage
    loadCart();
  }, []);

  const loadCart = () => {
    const cartItems = cartApi.getItems();
    setItems(cartItems);
    setCartTotal(cartApi.getCartTotal());
    setRestaurantInfo(cartApi.getRestaurantInfo());
  };

  const addToCart = (item: CartItem) => {
    const success = cartApi.addItem(item);
    if (success) {
      loadCart();
      toast({
        title: "Added to Cart",
        description: `${item.food_name} has been added to your cart.`,
        variant: "default",
      });
    }
  };

  const removeFromCart = (foodId: number) => {
    cartApi.removeItem(foodId);
    loadCart();
  };

  const updateQuantity = (foodId: number, quantity: number) => {
    cartApi.updateQuantity(foodId, quantity);
    loadCart();
  };

  const clearCart = () => {
    cartApi.clearCart();
    loadCart();
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount: items.reduce((count, item) => count + item.quantity, 0),
        restaurantInfo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
