
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CreditCard,
  Wallet,
  Banknote,
  Clock,
  MapPin,
  Check,
  ShoppingBag,
} from "lucide-react";
import { orders, Order } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Checkout = () => {
  const { user } = useAuth();
  const { items, cartTotal, restaurantInfo, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [address, setAddress] = useState(user?.customer_address || "");
  const [phone, setPhone] = useState(user?.customer_contact_number || "");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate("/login", { state: { from: "/checkout" } });
    return null;
  }

  if (items.length === 0 || !restaurantInfo) {
    navigate("/cart");
    return null;
  }

  const deliveryFee = 40;
  const taxesAndCharges = Math.round(cartTotal * 0.05);
  const totalAmount = cartTotal + deliveryFee + taxesAndCharges;

  const handleSubmitOrder = async () => {
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please provide a delivery address.",
        variant: "destructive",
      });
      return;
    }

    if (!phone.trim()) {
      toast({
        title: "Phone Number Required",
        description: "Please provide a contact number for delivery.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare order data
      const orderData: Order = {
        customer_id: user.customer_id,
        res_id: restaurantInfo.restaurant_id,
        items: items.map(item => ({
          food_id: item.food_id,
          quantity: item.quantity,
          food_name: item.food_name,
          price_per_unit: item.price_per_unit
        })),
        total_amount: totalAmount,
        order_status: "pending"
      };

      // In a real app, this would call your API
      // const response = await orders.create(orderData);
      
      // For demo, we'll simulate a successful response
      setTimeout(() => {
        toast({
          title: "Order Placed Successfully!",
          description: "Your order has been confirmed and is being prepared.",
          variant: "default",
        });
        
        clearCart();
        navigate("/order-confirmation");
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to place order:", error);
      toast({
        title: "Failed to Place Order",
        description: "There was an issue placing your order. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Address */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
              <div className="flex items-start mb-4">
                <MapPin className="h-5 w-5 mt-1 mr-2 text-food-primary flex-shrink-0" />
                <div>
                  <h2 className="text-lg font-medium mb-2">Delivery Address</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1"
                        placeholder="Enter your full address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="mt-1"
                        placeholder="Enter your contact number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instructions">Delivery Instructions (Optional)</Label>
                      <Textarea
                        id="instructions"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="mt-1"
                        placeholder="Add any special instructions for delivery"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
              <div className="flex items-start mb-4">
                <CreditCard className="h-5 w-5 mt-1 mr-2 text-food-primary flex-shrink-0" />
                <div className="w-full">
                  <h2 className="text-lg font-medium mb-4">Payment Method</h2>
                  
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div className="flex items-center justify-between space-x-2 border rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex items-center">
                          <Banknote className="h-5 w-5 mr-2 text-green-600" />
                          Cash on Delivery
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2 border rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="upi" id="upi" />
                        <Label htmlFor="upi" className="flex items-center">
                          <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                          UPI Payment
                        </Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2 border rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                          Credit/Debit Card
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <div className="flex items-start mb-4">
                <ShoppingBag className="h-5 w-5 mt-1 mr-2 text-food-primary flex-shrink-0" />
                <div>
                  <div className="flex justify-between">
                    <h2 className="text-lg font-medium">Order Details</h2>
                    <span className="text-sm text-muted-foreground">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>
                  
                  <div className="mt-4 space-y-2 divide-y">
                    {items.map((item) => (
                      <div key={item.food_id} className="flex justify-between py-2">
                        <div className="flex">
                          <span className="font-medium mr-2">{item.quantity}x</span>
                          <span>{item.food_name}</span>
                        </div>
                        <span>₹{(item.price_per_unit * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              
              <div className="mb-4">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Clock className="h-4 w-4 mr-1" />
                  Estimated delivery time: 30-45 min
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
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
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    Place Order <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                By placing your order, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
