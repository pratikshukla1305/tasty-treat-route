
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/Layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { admin, AdminDashboardData } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ShoppingBag,
  Users,
  CreditCard,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

const AdminDashboard = () => {
  // In a real app, we would fetch this data from the backend
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => admin.getDashboardData(),
  });

  // Mock data for the dashboard
  const mockDashboardData: AdminDashboardData = {
    totalOrders: 2340,
    totalRevenue: 178650.50,
    totalCustomers: 17,
    recentOrders: [
      {
        order_id: 2340,
        customer_id: 10014,
        res_id: 306,
        order_status: "delivered",
        ordered_time: "2023-05-17 08:45:37",
        delivered_time: "2023-05-17 09:30:16",
        items: [
          { food_id: 3000112, quantity: 2 },
          { food_id: 3000106, quantity: 1 }
        ],
        total_amount: 806.50,
        restaurant_name: "Alankar Inn",
        deliveryp_name: "Sukumar Rao"
      },
      {
        order_id: 2339,
        customer_id: 10012,
        res_id: 309,
        order_status: "confirmed",
        ordered_time: "2023-05-17 09:49:18",
        items: [
          { food_id: 3000137, quantity: 3 }
        ],
        total_amount: 330,
        restaurant_name: "Hotel Arina",
        deliveryp_name: "Pramod Kumar"
      },
      {
        order_id: 2338,
        customer_id: 10002,
        res_id: 303,
        order_status: "preparing",
        ordered_time: "2023-05-17 10:55:38",
        items: [
          { food_id: 3000139, quantity: 1 }
        ],
        total_amount: 180,
        restaurant_name: "Barbeque Nation",
        deliveryp_name: "Sai Aditya"
      },
      {
        order_id: 2337,
        customer_id: 10010,
        res_id: 307,
        order_status: "out_for_delivery",
        ordered_time: "2023-05-17 11:50:21",
        items: [
          { food_id: 3000130, quantity: 8 },
          { food_id: 3000151, quantity: 1 }
        ],
        total_amount: 670,
        restaurant_name: "Papadams Blue",
        deliveryp_name: "Jatin Yadav"
      }
    ],
    topFoods: [
      { food_name: "Hyderabadi Biryani", count: 32 },
      { food_name: "Dosa", count: 28 },
      { food_name: "Andhra Chicken Curry", count: 24 },
      { food_name: "Gutti Vankaya Curry", count: 18 },
      { food_name: "Pepperoni Pizza", count: 15 }
    ],
    topRestaurants: [
      { res_name: "Southern Spice", count: 42 },
      { res_name: "Barbeque Nation", count: 36 },
      { res_name: "Bawarchi", count: 31 },
      { res_name: "Deccan Pavilion", count: 27 },
      { res_name: "Papadams Blue", count: 22 }
    ]
  };

  const data = dashboardData || mockDashboardData;

  // Colors for charts
  const COLORS = ["#FF642F", "#FF8F52", "#FFA76A", "#FFC092", "#FFD8BA"];

  // Format number as currency
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here's an overview of your business.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.totalRevenue / data.totalOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Foods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.topFoods}
                  margin={{ top: 0, right: 0, left: 0, bottom: 20 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="food_name" 
                    type="category" 
                    scale="band"
                    tickLine={false}
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                  <Bar dataKey="count" fill="#FF642F" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Restaurants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topRestaurants}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="res_name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.topRestaurants.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} orders`, "Count"]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/orders">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium py-3 px-4">Order ID</th>
                  <th className="text-left font-medium py-3 px-4">Restaurant</th>
                  <th className="text-left font-medium py-3 px-4">Customer</th>
                  <th className="text-left font-medium py-3 px-4">Status</th>
                  <th className="text-left font-medium py-3 px-4">Time</th>
                  <th className="text-right font-medium py-3 px-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.order_id} className="border-b">
                    <td className="py-3 px-4">#{order.order_id}</td>
                    <td className="py-3 px-4">{order.restaurant_name}</td>
                    <td className="py-3 px-4">Customer #{order.customer_id}</td>
                    <td className="py-3 px-4">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.order_status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            order.order_status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            order.order_status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                            order.order_status === 'delivered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}
                      >
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(order.ordered_time || "").toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {formatCurrency(order.total_amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
