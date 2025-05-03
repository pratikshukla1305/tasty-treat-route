
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Bell, CreditCard, LogOut, ShoppingBag, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_name: user?.customer_name || "",
    customer_contact_number: user?.customer_contact_number || "",
    customer_address: user?.customer_address || "",
    email: user?.email || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    navigate("/login", { state: { from: "/profile" } });
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, this would update your backend
      // For demo purposes, we'll simulate a successful update
      const success = await updateProfile({
        customer_name: formData.customer_name,
        customer_contact_number: formData.customer_contact_number,
        customer_address: formData.customer_address,
      });
      
      if (success) {
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const userInitials = user.customer_name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="text-xl bg-food-primary text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{user.customer_name}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#account-info">
                      <User className="mr-2 h-4 w-4" />
                      Account Information
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#payment-methods">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment Methods
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/orders")}>
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Order History
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <a href="#preferences">
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </a>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2">
            <Tabs defaultValue="account">
              <TabsList className="mb-6">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="addresses">Addresses</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>
              
              <TabsContent value="account">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4" id="account-info">Account Information</h3>
                    
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customer_name">Full Name</Label>
                          <Input
                            id="customer_name"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            className="mt-1"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1"
                            disabled
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="customer_contact_number">Phone Number</Label>
                        <Input
                          id="customer_contact_number"
                          name="customer_contact_number"
                          value={formData.customer_contact_number}
                          onChange={handleChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="customer_address">Address</Label>
                        <Textarea
                          id="customer_address"
                          name="customer_address"
                          value={form.customer_address}
                          onChange={handleChange}
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-food-primary hover:bg-food-primary/90 flex items-center justify-center gap-2"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            "Updating..."
                          ) : (
                            <>
                              <Check className="h-4 w-4" /> Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4" id="payment-methods">Payment Methods</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Cash on Delivery</p>
                            <p className="text-sm text-muted-foreground">Default payment method</p>
                          </div>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm">Edit</Button>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Add New Payment Method
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="addresses">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Saved Addresses</h3>
                    
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md">
                        <div className="flex justify-between mb-2">
                          <p className="font-medium">Home</p>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            Default
                          </Badge>
                        </div>
                        <p className="text-sm mb-1">{user.customer_address}</p>
                        <p className="text-sm text-muted-foreground mb-3">{user.customer_contact_number}</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Add New Address
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="preferences" id="preferences">
                <Card>
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Order Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive updates about your order status
                          </p>
                        </div>
                        <Switch checked={true} />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Promotional Emails</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive emails about deals and new restaurants
                          </p>
                        </div>
                        <Switch checked={false} />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive SMS alerts about your orders
                          </p>
                        </div>
                        <Switch checked={true} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-medium mb-4">Account Settings</h3>
                    
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full">
                        <Key className="mr-2 h-4 w-4" /> Change Password
                      </Button>
                      
                      <Button variant="outline" className="w-full text-destructive border-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
