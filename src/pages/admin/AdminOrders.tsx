
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/Layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { admin, Order } from "@/lib/api";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState("");
  
  const { toast } = useToast();

  // In a real app, we would fetch this data from the backend
  const { data: allOrders = [], isLoading } = useQuery({
    queryKey: ["adminOrders", statusFilter],
    queryFn: () => admin.getAllOrders(statusFilter !== "all" ? statusFilter : undefined)
  });

  const { data: deliveryPartners = [] } = useQuery({
    queryKey: ["deliveryPartners"],
    queryFn: () => admin.getDeliveryPartners()
  });

  // Mock data for development
  const mockOrders: Order[] = Array.from({ length: 20 }).map((_, i) => ({
    order_id: 2340 - i,
    customer_id: 10000 + Math.floor(Math.random() * 17) + 1,
    res_id: 301 + Math.floor(Math.random() * 10),
    restaurant_name: ["Southern Spice", "Deccan Pavilion", "Barbeque Nation", "Sitara Grand", "Alankar Inn"][Math.floor(Math.random() * 5)],
    order_status: ["confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"][Math.floor(Math.random() * 5)],
    ordered_time: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    delivered_time: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
      food_id: 3000100 + Math.floor(Math.random() * 60),
      food_name: ["Hyderabadi Biryani", "Andhra Chicken Curry", "Dosa", "Gongura Pachadi", "Pepperoni Pizza"][Math.floor(Math.random() * 5)],
      quantity: Math.floor(Math.random() * 3) + 1,
      price_per_unit: Math.floor(Math.random() * 200) + 50
    })),
    total_amount: Math.floor(Math.random() * 1000) + 100,
    payment_type: ["cod", "upi", "card", "wallet"][Math.floor(Math.random() * 4)],
    payment_status: Math.random() > 0.1 ? "paid" : "pending",
    deliveryp_id: Math.random() > 0.2 ? 5110 + Math.floor(Math.random() * 16) + 1 : undefined,
    deliveryp_name: Math.random() > 0.2 ? ["Pramod Kumar", "Anand Prakash", "Swetha Gupta", "Chandra Sekhar", "Ajith Das"][Math.floor(Math.random() * 5)] : undefined,
  }));

  const mockDeliveryPartners = [
    { deliveryp_id: 5111, deliveryp_name: "Pramod Kumar", deliveryp_avg_rating: 4.1 },
    { deliveryp_id: 5112, deliveryp_name: "Anand Prakash", deliveryp_avg_rating: 3.8 },
    { deliveryp_id: 5113, deliveryp_name: "Swetha Gupta", deliveryp_avg_rating: 4.7 },
    { deliveryp_id: 5114, deliveryp_name: "Chandra Sekhar", deliveryp_avg_rating: 4.9 },
    { deliveryp_id: 5115, deliveryp_name: "Ajith Das", deliveryp_avg_rating: 3.5 },
  ];

  // Use mock data if API data is not available
  const orders = allOrders.length > 0 ? allOrders : mockOrders;
  const deliveryPartnersData = deliveryPartners.length > 0 ? deliveryPartners : mockDeliveryPartners;

  // Filter orders by search term
  const filteredOrders = orders.filter(order => {
    const orderIdMatch = order.order_id?.toString().includes(searchTerm);
    const restaurantMatch = order.restaurant_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const customerMatch = order.customer_id?.toString().includes(searchTerm);
    
    return orderIdMatch || restaurantMatch || customerMatch;
  });

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.ordered_time || "").getTime() - new Date(a.ordered_time || "").getTime();
      case "oldest":
        return new Date(a.ordered_time || "").getTime() - new Date(b.ordered_time || "").getTime();
      case "highest":
        return (b.total_amount || 0) - (a.total_amount || 0);
      case "lowest":
        return (a.total_amount || 0) - (b.total_amount || 0);
      default:
        return 0;
    }
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleAssignDelivery = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDeliveryPartner("");
    setIsAssignDialogOpen(true);
  };

  const confirmAssignDelivery = async () => {
    if (!selectedOrder || !selectedDeliveryPartner) return;

    try {
      // In a real app, this would update your backend
      // const response = await admin.assignDeliveryPartner(
      //   selectedOrder.order_id!, 
      //   parseInt(selectedDeliveryPartner)
      // );
      
      toast({
        title: "Delivery Partner Assigned",
        description: `Order #${selectedOrder.order_id} has been assigned to a delivery partner.`,
      });
      
      setIsAssignDialogOpen(false);
    } catch (error) {
      toast({
        title: "Failed to Assign",
        description: "There was an error assigning the delivery partner.",
        variant: "destructive",
      });
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      // In a real app, this would update your backend
      // await admin.updateOrderStatus(orderId, status);
      
      toast({
        title: "Order Status Updated",
        description: `Order #${orderId} status changed to ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Status Update Failed",
        description: "There was an error updating the order status.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-muted-foreground">
          View and manage all customer orders.
        </p>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search by order ID, restaurant or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="highest">Highest Amount</SelectItem>
            <SelectItem value="lowest">Lowest Amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium py-4 px-6">Order ID</th>
                  <th className="text-left font-medium py-4 px-6">Restaurant</th>
                  <th className="text-left font-medium py-4 px-6">Customer</th>
                  <th className="text-left font-medium py-4 px-6">Status</th>
                  <th className="text-left font-medium py-4 px-6">Date & Time</th>
                  <th className="text-right font-medium py-4 px-6">Amount</th>
                  <th className="text-right font-medium py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b animate-pulse">
                      <td colSpan={7} className="py-4 px-6">
                        <div className="h-6 bg-muted rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : sortedOrders.length > 0 ? (
                  sortedOrders.map((order) => (
                    <tr key={order.order_id} className="border-b">
                      <td className="py-4 px-6">#{order.order_id}</td>
                      <td className="py-4 px-6">{order.restaurant_name}</td>
                      <td className="py-4 px-6">Customer #{order.customer_id}</td>
                      <td className="py-4 px-6">
                        <Badge
                          className={
                            order.order_status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            order.order_status === 'preparing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            order.order_status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            order.order_status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }
                          variant="outline"
                        >
                          {order.order_status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        {new Date(order.ordered_time || "").toLocaleDateString()} 
                        <br />
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.ordered_time || "").toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {formatCurrency(order.total_amount || 0)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            
                            {order.order_status === 'confirmed' && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => updateOrderStatus(order.order_id!, 'preparing')}
                                >
                                  <Clock className="mr-2 h-4 w-4" />
                                  Mark as Preparing
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleAssignDelivery(order)}>
                                  <User className="mr-2 h-4 w-4" />
                                  Assign Delivery
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {order.order_status === 'preparing' && (
                              <DropdownMenuItem 
                                onClick={() => updateOrderStatus(order.order_id!, 'out_for_delivery')}
                              >
                                <Package className="mr-2 h-4 w-4" />
                                Mark as Out for Delivery
                              </DropdownMenuItem>
                            )}
                            
                            {order.order_status === 'out_for_delivery' && (
                              <DropdownMenuItem 
                                onClick={() => updateOrderStatus(order.order_id!, 'delivered')}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Delivered
                              </DropdownMenuItem>
                            )}
                            
                            {(order.order_status === 'confirmed' || order.order_status === 'preparing') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => updateOrderStatus(order.order_id!, 'cancelled')}
                                  className="text-destructive"
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-6 text-center">
                      <Filter className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.order_id}</DialogTitle>
            <DialogDescription>
              Placed on {selectedOrder ? new Date(selectedOrder.ordered_time || "").toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Restaurant</h4>
                  <p>{selectedOrder.restaurant_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Customer</h4>
                  <p>Customer #{selectedOrder.customer_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                  <Badge
                    className={
                      selectedOrder.order_status === 'confirmed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      selectedOrder.order_status === 'preparing' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      selectedOrder.order_status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                      selectedOrder.order_status === 'delivered' ? 'bg-green-100 text-green-800 border-green-200' :
                      'bg-red-100 text-red-800 border-red-200'
                    }
                    variant="outline"
                  >
                    {selectedOrder.order_status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Payment</h4>
                  <p className="capitalize">{selectedOrder.payment_type} ({selectedOrder.payment_status})</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h4>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left text-sm py-2 px-4">Item</th>
                        <th className="text-center text-sm py-2 px-4">Qty</th>
                        <th className="text-right text-sm py-2 px-4">Price</th>
                        <th className="text-right text-sm py-2 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index} className={index !== selectedOrder.items.length - 1 ? "border-b" : ""}>
                          <td className="py-2 px-4">{item.food_name}</td>
                          <td className="py-2 px-4 text-center">{item.quantity}</td>
                          <td className="py-2 px-4 text-right">₹{item.price_per_unit?.toFixed(2)}</td>
                          <td className="py-2 px-4 text-right">
                            ₹{((item.price_per_unit || 0) * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={3} className="py-2 px-4 text-right font-medium">Total</td>
                        <td className="py-2 px-4 text-right font-medium">
                          ₹{selectedOrder.total_amount?.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {selectedOrder.deliveryp_name && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Delivery Partner</h4>
                  <p>{selectedOrder.deliveryp_name}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Delivery Partner Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner for order #{selectedOrder?.order_id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <Select value={selectedDeliveryPartner} onValueChange={setSelectedDeliveryPartner}>
              <SelectTrigger>
                <SelectValue placeholder="Select delivery partner" />
              </SelectTrigger>
              <SelectContent>
                {deliveryPartnersData.map((partner) => (
                  <SelectItem key={partner.deliveryp_id} value={partner.deliveryp_id.toString()}>
                    {partner.deliveryp_name} (Rating: {partner.deliveryp_avg_rating})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmAssignDelivery} 
              disabled={!selectedDeliveryPartner}
              className="bg-food-primary hover:bg-food-primary/90"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
