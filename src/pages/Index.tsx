
import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import RestaurantCard from "@/components/ui/restaurant-card";
import FoodCard from "@/components/ui/food-card";
import { Button } from "@/components/ui/button";
import { restaurants, foods, Restaurant, Food } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Search, ArrowRight, UtensilsCrossed } from "lucide-react";

const Index = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

  const { data: featuredRestaurants = [], isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["featuredRestaurants"],
    queryFn: () => restaurants.getFeatured()
  });

  const { data: popularFoods = [], isLoading: isLoadingFoods } = useQuery({
    queryKey: ["popularFoods"],
    queryFn: () => foods.getFeatured()
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // For demo purposes, let's create some mock data until the actual API is implemented
  const mockFeaturedRestaurants: Restaurant[] = [
    { res_id: 301, res_name: "Southern Spice", res_location: "Rushikonda", res_rating: 4.5 },
    { res_id: 302, res_name: "Deccan Pavilion", res_location: "MVP Colony", res_rating: 4.1 },
    { res_id: 303, res_name: "Barbeque Nation", res_location: "Gajuwaka", res_rating: 4.3 },
    { res_id: 304, res_name: "Sitara Grand", res_location: "Aganampudi", res_rating: 3.9 },
  ];

  const mockPopularFoods: Food[] = [
    { food_id: 3000103, food_name: "Hyderabadi Biryani", price_per_unit: 250.00, description: "Aromatic basmati rice with flavorful spices and tender meat", is_vegetarian: false, is_bestseller: true },
    { food_id: 3000132, food_name: "Pepperoni Pizza", price_per_unit: 300.00, description: "Classic pizza topped with pepperoni slices and cheese", is_vegetarian: false },
    { food_id: 3000108, food_name: "Chepala Pulusu", price_per_unit: 170.00, description: "Traditional fish curry with tangy tamarind sauce", is_vegetarian: false, is_bestseller: true },
    { food_id: 3000106, food_name: "Gutti Vankaya Curry", price_per_unit: 150.00, description: "Stuffed eggplant cooked with aromatic spices", is_vegetarian: true },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-food-light overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-food-dark mb-4">
              Delicious Food,<br />Delivered To Your Door
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Order from your favorite restaurants and enjoy the best meals without leaving home.
            </p>
            
            <form onSubmit={handleSearch} className="relative max-w-md">
              <input
                type="text"
                placeholder="Search for restaurants or dishes..."
                className="w-full px-5 py-3 pr-12 rounded-full border border-border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute right-1 top-1 rounded-full bg-food-primary hover:bg-food-primary/90"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>
        </div>
        {/* Decorative food images */}
        <div className="hidden md:block absolute -right-24 top-1/2 -translate-y-1/2">
          <div className="relative w-96 h-96">
            <div className="absolute top-10 right-10 w-48 h-48 rounded-full shadow-xl bg-white p-2">
              <img 
                src="https://source.unsplash.com/300x300/?biryani" 
                alt="Food" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full shadow-xl bg-white p-2">
              <img 
                src="https://source.unsplash.com/300x300/?pizza" 
                alt="Food" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute top-40 left-32 w-36 h-36 rounded-full shadow-xl bg-white p-2 animate-bounce-subtle">
              <img 
                src="https://source.unsplash.com/300x300/?burger" 
                alt="Food" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Restaurants</h2>
          <Button
            variant="ghost"
            onClick={() => navigate("/restaurants")}
            className="text-food-primary hover:text-food-primary/90"
          >
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoadingRestaurants ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 bg-muted rounded-xl animate-pulse" />
            ))
          ) : featuredRestaurants.length > 0 ? (
            featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.res_id} restaurant={restaurant} />
            ))
          ) : mockFeaturedRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.res_id} restaurant={restaurant} />
          ))}
        </div>
      </section>

      {/* Popular Foods */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Popular Dishes</h2>
          <Button
            variant="ghost"
            onClick={() => navigate("/restaurants")}
            className="text-food-primary hover:text-food-primary/90"
          >
            Explore More <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoadingFoods ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))
          ) : popularFoods.length > 0 ? (
            popularFoods.map((food) => (
              <FoodCard 
                key={food.food_id} 
                food={food}
                // We'd need to get the actual restaurant ID from the API
                restaurantId={food.restaurant_id || 301}
              />
            ))
          ) : mockPopularFoods.map((food) => (
            <FoodCard 
              key={food.food_id} 
              food={food}
              restaurantId={301} // Using a default value for mocked data
              restaurantName="Southern Spice"
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-food-light py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-food-primary/10 text-food-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Choose Restaurant</h3>
              <p className="text-muted-foreground">
                Browse through our selection of top-rated restaurants in your area.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-food-primary/10 text-food-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <UtensilsCrossed className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select Your Meal</h3>
              <p className="text-muted-foreground">
                Pick your favorite dishes from the restaurant's menu.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-food-primary/10 text-food-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">Get It Delivered</h3>
              <p className="text-muted-foreground">
                Our delivery partners will bring your order right to your doorstep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-food-primary to-food-accent rounded-xl overflow-hidden">
          <div className="md:flex items-center">
            <div className="p-8 md:p-12 md:w-1/2">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Get The TastyBites App
              </h2>
              <p className="text-white/90 mb-6">
                Download our mobile app for a better experience. Order food, track deliveries, and get exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-white text-food-primary hover:bg-white/90">
                  <img src="https://via.placeholder.com/20x20" alt="App Store" className="mr-2" />
                  App Store
                </Button>
                <Button className="bg-white text-food-primary hover:bg-white/90">
                  <img src="https://via.placeholder.com/20x20" alt="Google Play" className="mr-2" />
                  Google Play
                </Button>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2">
              <img 
                src="https://source.unsplash.com/600x400/?mobile,food,app" 
                alt="Mobile App" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
