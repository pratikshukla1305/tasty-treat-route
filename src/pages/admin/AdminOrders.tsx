
import React from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/Layout/AdminLayout";
import { admin, Order } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronDown, Search, MoreHorizontal, Phone, Store, 
  MapPin, Calendar, Clock, CreditCard, User, Package
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const AdminOrders = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const { toast } = useToast();

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["adminOrders", statusFilter],
    queryFn: () => admin.getAllOrders(statusFilter),
  });

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      const searchStr = `${order.order_id} ${order.customer_id} ${order.restaurant_name}`.toLowerCase();
      return searchStr.includes(searchQuery.toLowerCase());
    });
  }, [orders, searchQuery]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    try {
      await admin.updateStatus(orderId, status);
      toast({
        title: "Order Status Updated",
        description: `Order ${orderId} status updated to ${status}`,
      });
      refetch(); // Refresh the orders data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const handleAssignDeliveryPartner = async (orderId: number, deliveryPartnerId: number) => {
    try {
      await admin.assignDeliveryPartner(orderId, deliveryPartnerId);
      toast({
        title: "Delivery Partner Assigned",
        description: `Delivery partner ${deliveryPartnerId} assigned to order ${orderId}`,
      });
      refetch(); // Refresh the orders data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to assign delivery partner",
        variant: "destructive",
      });
    }
  };

  const { data: deliveryPartners } = useQuery({
    queryKey: ["deliveryPartners"],
    queryFn: () => admin.getDeliveryPartners(),
  });

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage all orders placed by customers</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setStatusFilter(null)}>All</TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>Pending</TabsTrigger>
              <TabsTrigger value="processing" onClick={() => setStatusFilter("processing")}>Processing</TabsTrigger>
              <TabsTrigger value="shipped" onClick={() => setStatusFilter("shipped")}>Shipped</TabsTrigger>
              <TabsTrigger value="delivered" onClick={() => setStatusFilter("delivered")}>Delivered</TabsTrigger>
              <TabsTrigger value="cancelled" onClick={() => setStatusFilter("cancelled")}>Cancelled</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              <div className="flex items-center justify-between">
                <Input
                  type="search"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Delivery Partner <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {deliveryPartners && deliveryPartners.map((partner) => (
                      <DropdownMenuItem key={partner.deliveryp_id}>
                        {partner.deliveryp_name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Restaurant</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Delivery Partner</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">Loading...</TableCell>
                      </TableRow>
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">No orders found.</TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.order_id}>
                          <TableCell>{order.order_id}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-muted-foreground" />
                              {order.customer_id}
                            </div>
                          </TableCell>
                          <TableCell>{order.restaurant_name}</TableCell>
                          <TableCell>
                            {new Date(order.ordered_time || "").toLocaleDateString()}
                          </TableCell>
                          <TableCell>₹{order.total_amount}</TableCell>
                          <TableCell>{order.order_status}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                              {order.deliveryp_id || "Not assigned"}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(order.order_id || 0, "pending")}
                                >
                                  Mark as Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(order.order_id || 0, "processing")}
                                >
                                  Mark as Processing
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(order.order_id || 0, "shipped")}
                                >
                                  Mark as Shipped
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(order.order_id || 0, "delivered")}
                                >
                                  Mark as Delivered
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusUpdate(order.order_id || 0, "cancelled")}
                                >
                                  Mark as Cancelled
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger>Assign Delivery Partner</DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      {deliveryPartners && deliveryPartners.map((partner) => (
                                        <DropdownMenuItem
                                          key={partner.deliveryp_id}
                                          onClick={() => handleAssignDeliveryPartner(order.order_id || 0, partner.deliveryp_id)}
                                        >
                                          {partner.deliveryp_name}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminOrders;
