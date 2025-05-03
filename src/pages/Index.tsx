import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, MapPin, Utensils, Clock, TrendingUp, 
  Star, ArrowRight, ChevronRight, ChevronLeft, ShoppingBag 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { restaurants, Restaurant, foods, Food } from "@/lib/api";
import RestaurantCard from "@/components/ui/restaurant-card";
import FoodCard from "@/components/ui/food-card";

const Index = () => {
  const navigate = useNavigate();
  const [restaurantSearchTerm, setRestaurantSearchTerm] = React.useState("");
  const [foodSearchTerm, setFoodSearchTerm] = React.useState("");
  const [restaurantIndex, setRestaurantIndex] = React.useState(0);
  const [foodIndex, setFoodIndex] = React.useState(0);

  const { data: featuredRestaurants, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ["featuredRestaurants"],
    queryFn: restaurants.getFeatured,
  });

  const { data: featuredFoods, isLoading: isLoadingFoods } = useQuery({
    queryKey: ["featuredFoods"],
    queryFn: foods.getFeatured,
  });

  const handleRestaurantSearch = () => {
    if (restaurantSearchTerm) {
      navigate(`/restaurants?q=${restaurantSearchTerm}`);
    } else {
      navigate("/restaurants");
    }
  };

  const handleFoodSearch = () => {
    if (foodSearchTerm) {
      navigate(`/foods?q=${foodSearchTerm}`);
    } else {
      navigate("/foods");
    }
  };

  const nextRestaurants = () => {
    setRestaurantIndex((prevIndex) =>
      Math.min(prevIndex + 3, (featuredRestaurants?.length || 0) - 3)
    );
  };

  const prevRestaurants = () => {
    setRestaurantIndex((prevIndex) => Math.max(prevIndex - 3, 0));
  };

  const nextFoods = () => {
    setFoodIndex((prevIndex) =>
      Math.min(prevIndex + 3, (featuredFoods?.length || 0) - 3)
    );
  };

  const prevFoods = () => {
    setFoodIndex((prevIndex) => Math.max(prevIndex - 3, 0));
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-food-primary/10 py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column - Headline and Description */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Your Favorite Food, Delivered Fast
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                Order from the best restaurants in town with ease & track your order in real time.
              </p>

              {/* Search Input and Button */}
              <div className="flex flex-col md:flex-row gap-4">
                <Input
                  type="text"
                  placeholder="Search for restaurants..."
                  value={restaurantSearchTerm}
                  onChange={(e) => setRestaurantSearchTerm(e.target.value)}
                />
                <Button className="bg-food-primary hover:bg-food-primary/90" onClick={handleRestaurantSearch}>
                  <Search className="h-5 w-5 mr-2" />
                  Search Restaurants
                </Button>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="hidden md:block">
              <img
                src="/hero-image.png"
                alt="Delicious food"
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Restaurants Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold mb-2 md:mb-0">Featured Restaurants</h2>
            <Button variant="link" onClick={() => navigate("/restaurants")}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {isLoadingRestaurants ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : featuredRestaurants && featuredRestaurants.length > 0 ? (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-transform duration-300">
                {featuredRestaurants
                  .slice(restaurantIndex, restaurantIndex + 3)
                  .map((restaurant) => (
                    <RestaurantCard key={restaurant.res_id} restaurant={restaurant} />
                  ))}
              </div>
              {featuredRestaurants.length > 3 && (
                <>
                  {restaurantIndex > 0 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 border border-gray-200 hover:bg-gray-100"
                      onClick={prevRestaurants}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  {restaurantIndex < featuredRestaurants.length - 3 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 border border-gray-200 hover:bg-gray-100"
                      onClick={nextRestaurants}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">No featured restaurants found.</div>
          )}
        </div>
      </section>

      {/* Browse by Cuisine Section */}
      <section className="py-12 bg-food-secondary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Browse by Cuisine</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Example Cuisine Categories - Replace with actual data */}
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <Utensils className="h-6 w-6 mx-auto mb-2 text-food-primary" />
              <h3 className="text-sm font-medium">Italian</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <Utensils className="h-6 w-6 mx-auto mb-2 text-food-primary" />
              <h3 className="text-sm font-medium">Mexican</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <Utensils className="h-6 w-6 mx-auto mb-2 text-food-primary" />
              <h3 className="text-sm font-medium">Indian</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <Utensils className="h-6 w-6 mx-auto mb-2 text-food-primary" />
              <h3 className="text-sm font-medium">Chinese</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <Utensils className="h-6 w-6 mx-auto mb-2 text-food-primary" />
              <h3 className="text-sm font-medium">American</h3>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 text-center">
              <Utensils className="h-6 w-6 mx-auto mb-2 text-food-primary" />
              <h3 className="text-sm font-medium">Japanese</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Foods Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="md:flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold mb-2 md:mb-0">Featured Dishes</h2>
            <Button variant="link" onClick={() => navigate("/foods")}>
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {isLoadingFoods ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : featuredFoods && featuredFoods.length > 0 ? (
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-transform duration-300">
                {featuredFoods.slice(foodIndex, foodIndex + 3).map((food) => (
                  <FoodCard key={food.food_id} food={food} />
                ))}
              </div>
              {featuredFoods.length > 3 && (
                <>
                  {foodIndex > 0 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 border border-gray-200 hover:bg-gray-100"
                      onClick={prevFoods}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                  )}
                  {foodIndex < featuredFoods.length - 3 && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 border border-gray-200 hover:bg-gray-100"
                      onClick={nextFoods}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-4">No featured dishes found.</div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-food-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-lg mb-8">
            Explore our menu and discover your next favorite meal.
          </p>
          <Button className="bg-white text-food-primary hover:bg-gray-100">
            <ShoppingBag className="h-5 w-5 mr-2" />
            Start Your Order
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
