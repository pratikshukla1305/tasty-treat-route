
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, User } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    customer_name: string;
    email: string;
    password: string;
    customer_contact_number: string;
    customer_address: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("foodAppToken");
    
    if (token) {
      loadUserData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const userData = await auth.getCurrentUser();
      setUser(userData);
      
      // For demonstration purposes, we'll consider any user with ID < 5 as admin
      // In a real app, this would come from the backend as a role
      setIsAdmin(userData.customer_id < 5);
    } catch (error) {
      console.error("Failed to load user data", error);
      localStorage.removeItem("foodAppToken");
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await auth.login(email, password);
      localStorage.setItem("foodAppToken", response.token);
      setUser(response.user);
      setIsAdmin(response.user.customer_id < 5); // Same admin check as above
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${response.user.customer_name}!`,
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error("Login failed", error);
      return false;
    }
  };

  const register = async (userData: {
    customer_name: string;
    email: string;
    password: string;
    customer_contact_number: string;
    customer_address: string;
  }) => {
    try {
      const response = await auth.register(userData);
      localStorage.setItem("foodAppToken", response.token);
      setUser(response.user);
      
      toast({
        title: "Registration Successful",
        description: `Welcome, ${response.user.customer_name}!`,
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error("Registration failed", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("foodAppToken");
    setUser(null);
    setIsAdmin(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
      variant: "default",
    });
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const updatedUser = await auth.updateProfile(userData);
      setUser(updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
      return true;
    } catch (error) {
      console.error("Profile update failed", error);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
