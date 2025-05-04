
import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const from = location.state?.from || "/";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", email, "and password");
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        navigate(from, { replace: true });
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // For demo purposes, we'll provide a dummy login
  const handleDemoLogin = async () => {
    setIsLoading(true);
    setEmail("demo@example.com");
    setPassword("password123");
    
    try {
      console.log("Attempting demo login");
      const success = await login("demo@example.com", "password123");
      
      if (success) {
        toast({
          title: "Demo login successful",
          description: "Welcome to the demo account!",
        });
        navigate(from, { replace: true });
      } else {
        // If demo login fails, show a message
        console.log("Demo login failed, please try registering");
        setError("Demo account not available. Please register a new account.");
      }
    } catch (error) {
      console.error("Demo login error:", error);
      setError("Error accessing demo account. Please try registering.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <Link to="/" className="inline-block">
              <h1 className="text-2xl font-bold text-food-primary">TastyBites</h1>
            </Link>
            <h2 className="mt-4 text-2xl font-bold">Sign in to your account</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Or{" "}
              <Link to="/register" className="text-food-primary hover:underline">
                create a new account
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="mt-1"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="text-sm text-food-primary hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-food-primary hover:bg-food-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Demo Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
