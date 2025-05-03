
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { orders, Order } from "@/lib/api";
import { Package, Clock, ShoppingBag, ChevronRight, AlertCircle } from "lucide-react";

const OrderStatusBadge = ({ status }: { status: string }) => {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "preparing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "out_for_delivery":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "delivered":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Badge className={`font-medium ${getVariant()}`} variant="outline">
      {status}
    </Badge>
  );
};

const Orders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  
  if (!user) {
    navigate("/login", { state: { from: "/orders" } });
    return null;
  }

  // For production, we would use a real API call
  const { data: userOrders = [], isLoading } = useQuery({
    queryKey: ["userOrders"],
    queryFn: () => orders.getUserOrders(),
    enabled: !!user,
  });

  // Mock order data for development
  const mockOrders: Order[] = [
    {
      order_id: 2340,
      customer_id: user.customer_id,
      res_id: 306,
      restaurant_name: "Alankar Inn",
      order_status: "delivered",
      ordered_time: "2023-05-17 08:45:37",
      delivered_time: "2023-05-17 09:30:16",
      total_amount: 806.50,
      items: [
        { food_id: 3000112, food_name: "Ulavacharu Biryani", quantity: 2, price_per_unit: 230 },
        { food_id: 3000106, food_name: "Gutti Vankaya Curry", quantity: 1, price_per_unit: 150 }
      ],
      payment_type: "cod",
      payment_status: "paid"
    },
    {
      order_id: 2339,
      customer_id: user.customer_id,
      res_id: 309,
      restaurant_name: "Hotel Arina",
      order_status: "confirmed",
      ordered_time: "2023-05-17 09:49:18",
      items: [
        { food_id: 3000137, food_name: "Nachos", quantity: 3, price_per_unit: 110 }
      ],
      total_amount: 330,
      payment_type: "cod",
      payment_status: "paid"
    },
    {
      order_id: 2331,
      customer_id: user.customer_id,
      res_id: 304,
      restaurant_name: "Sitara Grand",
      order_status: "cancelled",
      ordered_time: "2023-05-17 18:00:21",
      items: [
        { food_id: 3000129, food_name: "Punugulu", quantity: 3, price_per_unit: 80 }
      ],
      total_amount: 240,
      payment_type: "upi",
      payment_status: "refunded"
    }
  ];

  const orders = userOrders.length > 0 ? userOrders : mockOrders;
  
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "active") {
      return ["confirmed", "preparing", "out_for_delivery"].includes(order.order_status?.toLowerCase() || "");
    }
    if (activeTab === "completed") {
      return order.order_status?.toLowerCase() === "delivered";
    }
    if (activeTab === "cancelled") {
      return order.order_status?.toLowerCase() === "cancelled";
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.order_id} className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <div className="flex items-center mb-2">
                      <h3 className="font-medium mr-3">{order.restaurant_name}</h3>
                      <OrderStatusBadge status={order.order_status || "pending"} />
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Order #{order.order_id} • {new Date(order.ordered_time || "").toLocaleString()}
                    </div>
                    <div className="mb-2">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity}x {item.food_name}
                          {index === 0 && order.items.length > 1 ? ", " : ""}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-muted-foreground">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                    <div className="text-food-primary font-medium">
                      ₹{order.total_amount?.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex items-center">
                    {order.order_status?.toLowerCase() === "delivered" && (
                      <Button
                        variant="outline"
                        className="mr-2"
                        onClick={() => navigate(`/restaurants/${order.res_id}`)}
                      >
                        Reorder
                      </Button>
                    )}
                    <Button
                      variant={order.order_status?.toLowerCase() === "delivered" ? "outline" : "default"}
                      className={
                        order.order_status?.toLowerCase() !== "delivered" 
                          ? "bg-food-primary hover:bg-food-primary/90" 
                          : ""
                      }
                      onClick={() => navigate(`/orders/${order.order_id}`)}
                    >
                      {order.order_status?.toLowerCase() === "delivered" ? "View Details" : "Track Order"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Orders Found</h3>
            <p className="text-muted-foreground mb-6">
              {activeTab === "all" 
                ? "You haven't placed any orders yet." 
                : `You don't have any ${activeTab} orders.`
              }
            </p>
            <Button 
              onClick={() => navigate("/restaurants")} 
              className="bg-food-primary hover:bg-food-primary/90"
            >
              Browse Restaurants
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Orders;
