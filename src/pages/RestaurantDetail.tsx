import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/Layout/MainLayout";
import FoodCard from "@/components/ui/food-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { restaurants, foods, Restaurant, Food } from "@/lib/api";
import { Star, Clock, MapPin, Search, ChevronUp, ChevronDown, Info, Check } from "lucide-react";

interface FoodCategory {
  name: string;
  foods: Food[];
}

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const restaurantId = parseInt(id || "0");

  // For production, we would replace these with actual API calls
  const { data: restaurant, isLoading: isLoadingRestaurant } = useQuery({
    queryKey: ["restaurant", restaurantId],
    queryFn: () => restaurants.getById(restaurantId),
    enabled: !!restaurantId,
  });

  const { data: restaurantFoods = [], isLoading: isLoadingFoods } = useQuery({
    queryKey: ["restaurantFoods", restaurantId],
    queryFn: () => foods.getByRestaurant(restaurantId),
    enabled: !!restaurantId,
  });

  // Mock data for development
  const mockRestaurant: Restaurant = {
    res_id: 301,
    res_name: "Southern Spice",
    res_location: "Rushikonda",
    res_rating: 4.5,
  };

  const mockFoods: Food[] = [
    { 
      food_id: 3000101, 
      food_name: "Pulihora", 
      price_per_unit: 120.00,
      category: "Rice Dishes",
      description: "Tangy tamarind rice with peanuts and spices",
      is_vegetarian: true
    },
    { 
      food_id: 3000105, 
      food_name: "Andhra Chicken Curry", 
      price_per_unit: 180.00,
      category: "Non-Veg Curries",
      description: "Spicy chicken curry with traditional Andhra spices",
      is_vegetarian: false,
      is_bestseller: true
    },
    { 
      food_id: 3000111, 
      food_name: "Dosa", 
      price_per_unit: 60.00,
      category: "Breakfast",
      description: "Crispy rice pancake served with chutney and sambar",
      is_vegetarian: true
    },
    { 
      food_id: 3000107, 
      food_name: "Royyala Iguru", 
      price_per_unit: 200.00,
      category: "Non-Veg Curries",
      description: "Prawns cooked with onions and spices",
      is_vegetarian: false
    },
    { 
      food_id: 3000106, 
      food_name: "Gutti Vankaya Curry", 
      price_per_unit: 150.00,
      category: "Veg Curries",
      description: "Stuffed eggplant cooked with aromatic spices",
      is_vegetarian: true,
      is_bestseller: true
    },
    { 
      food_id: 3000109, 
      food_name: "Bobbatlu", 
      price_per_unit: 90.00,
      category: "Desserts",
      description: "Sweet flatbread stuffed with lentil and jaggery",
      is_vegetarian: true
    },
    { 
      food_id: 3000110, 
      food_name: "Pootharekulu", 
      price_per_unit: 75.00,
      category: "Desserts",
      description: "Paper thin sweet made with rice starch and sugar",
      is_vegetarian: true
    },
    { 
      food_id: 3000102, 
      food_name: "Gongura Pachadi", 
      price_per_unit: 80.00,
      category: "Sides",
      description: "Tangy and spicy chutney made from sorrel leaves",
      is_vegetarian: true
    }
  ];

  const currentRestaurant = restaurant || mockRestaurant;
  const currentFoods = restaurantFoods.length > 0 ? restaurantFoods : mockFoods;

  // Filter foods based on search term
  const filteredFoods = currentFoods.filter(food => 
    food.food_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Group foods by category
  const categories: FoodCategory[] = filteredFoods.reduce((acc: FoodCategory[], food) => {
    const categoryName = food.category || "Other";
    const existingCategory = acc.find(cat => cat.name === categoryName);
    
    if (existingCategory) {
      existingCategory.foods.push(food);
    } else {
      acc.push({ name: categoryName, foods: [food] });
    }
    
    return acc;
  }, []);

  const toggleCategory = (category: string) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  if (isLoadingRestaurant) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="h-40 bg-muted rounded-xl animate-pulse mb-8" />
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse mb-4" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Restaurant header */}
      <div 
        className="h-64 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${currentRestaurant.image_url || `https://source.unsplash.com/1200x400/?restaurant,${currentRestaurant.res_name}`})`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="container mx-auto px-4 h-full flex items-end pb-6">
          <div className="text-white relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {currentRestaurant.res_name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {currentRestaurant.res_location}
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 fill-amber-400 text-amber-400" />
                {currentRestaurant.res_rating.toFixed(1)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                30-45 min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="menu">
          <TabsList className="mb-6">
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="menu">
            {/* Search bar */}
            <div className="relative max-w-md mb-6">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>

            {/* Menu sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Menu categories */}
              <div className="md:col-span-2">
                {isLoadingFoods ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-24 bg-muted rounded-lg animate-pulse mb-4" />
                  ))
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <div key={category.name} className="mb-8">
                      <div 
                        className="flex justify-between items-center py-2 border-b cursor-pointer"
                        onClick={() => toggleCategory(category.name)}
                      >
                        <h3 className="text-lg font-medium">{category.name}</h3>
                        <Button variant="ghost" size="icon">
                          {activeCategory === category.name ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                      
                      {(activeCategory === category.name || activeCategory === null) && (
                        <div className="grid grid-cols-1 gap-4 mt-4">
                          {category.foods.map((food) => (
                            <FoodCard 
                              key={food.food_id} 
                              food={food} 
                              restaurantId={currentRestaurant.res_id}
                              restaurantName={currentRestaurant.res_name}
                              className="h-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-medium mb-2">No Menu Items Found</h3>
                    <p className="text-muted-foreground mb-4">
                      We couldn't find any menu items matching your search.
                    </p>
                    <Button 
                      onClick={() => setSearchTerm("")}
                      className="bg-food-primary hover:bg-food-primary/90"
                    >
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Restaurant info sidebar */}
              <div className="md:col-span-1">
                <div className="sticky top-20 bg-card shadow-sm rounded-lg p-6 border">
                  <h3 className="font-medium mb-4">Restaurant Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Address</h4>
                      <p>123 Main Street, {currentRestaurant.res_location}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Opening Hours</h4>
                      <p>Monday - Sunday: 11:00 AM - 10:00 PM</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Contact</h4>
                      <p>+91 98765 43210</p>
                    </div>
                    
                    <div className="pt-2">
                      <Button className="w-full bg-food-primary hover:bg-food-primary/90 flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" />
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="about">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-4">About {currentRestaurant.res_name}</h2>
              <p className="mb-6">
                {currentRestaurant.res_name} is a popular restaurant located in {currentRestaurant.res_location}, 
                specializing in authentic South Indian cuisine. With a rating of {currentRestaurant.res_rating}, 
                we pride ourselves on providing delicious meals made with fresh ingredients and traditional recipes.
              </p>
              <p className="mb-6">
                Our chefs have years of experience in preparing the most delicious and authentic dishes. 
                We source our ingredients locally whenever possible to ensure freshness and to support local farmers.
              </p>
              
              <h3 className="text-lg font-medium mb-2">Our Specialties</h3>
              <ul className="list-disc pl-5 mb-6">
                <li className="mb-1">Authentic Andhra Biryani</li>
                <li className="mb-1">Traditional Dosas and Idlis</li>
                <li className="mb-1">Spicy Andhra Curries</li>
                <li className="mb-1">Homemade Sweets and Desserts</li>
              </ul>
              
              <h3 className="text-lg font-medium mb-2">Facilities</h3>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" /> Free Wi-Fi
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" /> Air Conditioning
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" /> Outdoor Seating
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-2" /> Parking Available
                </div>
              </div>
              
              <img 
                src={`https://source.unsplash.com/800x400/?restaurant,interior,${currentRestaurant.res_name}`}
                alt={`${currentRestaurant.res_name} Interior`}
                className="w-full rounded-lg mb-6"
              />
              
              <h3 className="text-lg font-medium mb-2">Location</h3>
              <div className="bg-muted h-64 rounded-lg flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2">Map goes here</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews">
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Customer Reviews</h2>
                <Button className="bg-food-primary hover:bg-food-primary/90">Write a Review</Button>
              </div>
              
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <div className="bg-food-primary h-16 w-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                    {currentRestaurant.res_rating.toFixed(1)}
                  </div>
                  <div>
                    <div className="flex items-center mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-5 w-5 ${i < Math.round(currentRestaurant.res_rating) ? "text-amber-400 fill-amber-400" : "text-muted"}`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">Based on 124 reviews</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center">
                      <span className="w-4 mr-2">{rating}</span>
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-2" />
                      <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${(6 - rating) * 20}%` }}
                        />
                      </div>
                      <span className="w-8 ml-2 text-xs text-right text-muted-foreground">
                        {Math.round((6 - rating) * 25)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Sample reviews */}
                {[
                  { 
                    name: "Rahul M.", 
                    rating: 5, 
                    date: "2 days ago",
                    comment: "Amazing food! The Hyderabadi Biryani was authentic and flavorful. Will definitely order again."
                  },
                  { 
                    name: "Priya S.", 
                    rating: 4, 
                    date: "1 week ago",
                    comment: "Good food and quick delivery. The Andhra Chicken Curry was spicy just as I like it. The only issue was that the packaging leaked a bit."
                  },
                  { 
                    name: "Ahmed K.", 
                    rating: 5, 
                    date: "2 weeks ago",
                    comment: "Best South Indian food in the area! The dosas are crispy and the chutneys are amazing. Highly recommended!"
                  }
                ].map((review, index) => (
                  <div key={index} className="border-b border-border pb-6">
                    <div className="flex justify-between mb-2">
                      <h4 className="font-medium">{review.name}</h4>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-muted"}`} 
                        />
                      ))}
                    </div>
                    <p>{review.comment}</p>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  Load More Reviews
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RestaurantDetail;
