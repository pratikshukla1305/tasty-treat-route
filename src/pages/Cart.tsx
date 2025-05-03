import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, cartTotal, restaurantInfo } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCheckout = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to continue with your order.",
        variant: "destructive",
      });
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    
    navigate("/checkout");
  };

  const deliveryFee = 40;
  const taxesAndCharges = Math.round(cartTotal * 0.05);
  const totalAmount = cartTotal + deliveryFee + taxesAndCharges;

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button 
              onClick={() => navigate("/restaurants")} 
              className="bg-food-primary hover:bg-food-primary/90"
            >
              Browse Restaurants
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-lg font-medium">{restaurantInfo?.restaurant_name}</h2>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-food-primary hover:text-food-primary/90"
                  onClick={() => clearCart()}
                >
                  Clear Cart
                </Button>
              </div>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.food_id} className="flex items-center py-2 border-t">
                    <div className="flex-1">
                      <div className="flex items-start">
                        {item.is_vegetarian !== undefined && (
                          <span 
                            className={`inline-block h-4 w-4 mt-1 rounded-full border ${
                              item.is_vegetarian 
                                ? "border-green-500 bg-green-100" 
                                : "border-red-500 bg-red-100"
                            } mr-2 flex-shrink-0`}
                          />
                        )}
                        <div>
                          <h3 className="font-medium">{item.food_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ₹{item.price_per_unit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex items-center border rounded-md mr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.food_id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.food_id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          ₹{(item.price_per_unit * item.quantity).toFixed(2)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.food_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="md:col-span-1">
            <div className="sticky top-20 bg-card rounded-lg border shadow-sm p-4">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes & Charges</span>
                  <span>₹{taxesAndCharges.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-food-primary hover:bg-food-primary/90 mb-2 flex items-center justify-center gap-2"
                onClick={handleCheckout}
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => navigate(`/restaurants/${restaurantInfo?.restaurant_id}`)}
              >
                Add More Items
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
