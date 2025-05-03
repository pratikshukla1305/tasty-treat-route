
import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, MapPin, Receipt, ChevronRight } from "lucide-react";

const OrderConfirmation = () => {
  const navigate = useNavigate();
  
  // Generate a random order ID for demo
  const orderId = Math.floor(10000 + Math.random() * 90000);
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-4">
            Your order has been received and is being prepared.
          </p>
          <div className="bg-muted inline-block px-4 py-2 rounded-md mb-6">
            <span className="text-sm text-muted-foreground">Order ID:</span> <span className="font-medium"># {orderId}</span>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Order Status */}
          <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
            <h2 className="font-medium mb-4 text-lg">Order Status</h2>
            
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted"></div>
              
              <div className="relative flex mb-6">
                <div className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center flex-shrink-0 z-10">
                  <Check className="h-4 w-4" />
                </div>
                <div className="ml-4">
                  <div className="font-medium">Order Placed</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="relative flex mb-6">
                <div className="h-7 w-7 rounded-full bg-food-primary text-white flex items-center justify-center flex-shrink-0 z-10">
                  <SpatialAudio className="h-4 w-4" />
                </div>
                <div className="ml-4">
                  <div className="font-medium">Food Preparation</div>
                  <div className="text-sm text-muted-foreground">
                    Your order is being prepared by the restaurant
                  </div>
                </div>
              </div>
              
              <div className="relative flex mb-6">
                <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 z-10">
                  <Package className="h-4 w-4" />
                </div>
                <div className="ml-4">
                  <div className="font-medium">Out for Delivery</div>
                  <div className="text-sm text-muted-foreground">
                    Waiting for a delivery partner to pick up your order
                  </div>
                </div>
              </div>
              
              <div className="relative flex">
                <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0 z-10">
                  <Home className="h-4 w-4" />
                </div>
                <div className="ml-4">
                  <div className="font-medium">Delivered</div>
                  <div className="text-sm text-muted-foreground">
                    Estimated delivery time: 30-45 minutes
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Delivery Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mt-0.5 mr-2 text-food-primary flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-2">Delivery Address</h3>
                  <p className="text-sm mb-1">
                    {/* This would come from the user's saved address */}
                    123 Main Street, Apt 4B
                  </p>
                  <p className="text-sm mb-1">Rushikonda, Vizag</p>
                  <p className="text-sm">PIN: 530045</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border shadow-sm p-6">
              <div className="flex items-start">
                <Clock className="h-5 w-5 mt-0.5 mr-2 text-food-primary flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-2">Estimated Delivery</h3>
                  <p className="text-sm mb-1">
                    Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {
                      new Date(Date.now() + 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    }
                  </p>
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    On time
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="bg-card rounded-lg border shadow-sm p-6 mb-6">
            <div className="flex items-start mb-4">
              <Receipt className="h-5 w-5 mt-0.5 mr-2 text-food-primary flex-shrink-0" />
              <div className="w-full">
                <h2 className="font-medium mb-2">Order Summary</h2>
                <div className="text-sm mb-2">Southern Spice</div>
                
                <div className="mt-4 space-y-2 divide-y">
                  <div className="flex justify-between py-2">
                    <div>2x Hyderabadi Biryani</div>
                    <div>₹500.00</div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div>1x Gutti Vankaya Curry</div>
                    <div>₹150.00</div>
                  </div>
                  <div className="flex justify-between py-2">
                    <div>2x Butter Naan</div>
                    <div>₹80.00</div>
                  </div>
                </div>
                
                <div className="border-t mt-4 pt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Subtotal</span>
                    <span>₹730.00</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Delivery Fee</span>
                    <span>₹40.00</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Taxes & Charges</span>
                    <span>₹36.50</span>
                  </div>
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                    <span>Total</span>
                    <span>₹806.50</span>
                  </div>
                </div>
                
                <div className="mt-4 p-2 bg-muted rounded-md flex justify-between items-center">
                  <div className="text-sm">Payment Method</div>
                  <div className="font-medium">Cash on Delivery</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-food-primary hover:bg-food-primary/90"
              onClick={() => navigate("/orders")}
            >
              View My Orders
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate("/")}
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderConfirmation;
