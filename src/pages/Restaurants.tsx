
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/Layout/MainLayout";
import RestaurantCard from "@/components/ui/restaurant-card";
import { restaurants, Restaurant } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Filter, 
  Search,
  SlidersHorizontal,
  Star, 
  MapPin,
} from "lucide-react";

const Restaurants = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState<number | null>(null);
  
  // For production, we would replace this with an actual API call
  const { data: allRestaurants = [], isLoading } = useQuery({
    queryKey: ["restaurants"],
    queryFn: () => restaurants.getAll()
  });
  
  // Mock data for development
  const mockRestaurants: Restaurant[] = [
    { res_id: 301, res_name: "Southern Spice", res_location: "Rushikonda", res_rating: 4.5 },
    { res_id: 302, res_name: "Deccan Pavilion", res_location: "MVP Colony", res_rating: 4.1 },
    { res_id: 303, res_name: "Barbeque Nation", res_location: "Gajuwaka", res_rating: 4.3 },
    { res_id: 304, res_name: "Sitara Grand", res_location: "Aganampudi", res_rating: 3.9 },
    { res_id: 305, res_name: "Paprika Restaurant", res_location: "Seethammadhara", res_rating: 3.6 },
    { res_id: 306, res_name: "Alankar Inn", res_location: "Pedda Waltair", res_rating: 4.3 },
    { res_id: 307, res_name: "Papadams Blue", res_location: "Dwaraka Nagar", res_rating: 3.8 },
    { res_id: 308, res_name: "Bawarchi", res_location: "Jagadamba Center", res_rating: 4.2 },
  ];
  
  // Use mock data if API data is not available
  const restaurantsToDisplay = allRestaurants.length > 0 ? allRestaurants : mockRestaurants;
  
  const filteredRestaurants = restaurantsToDisplay
    .filter(restaurant => 
      restaurant.res_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.res_location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(restaurant => 
      filterRating ? restaurant.res_rating >= filterRating : true
    );
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Restaurants</h1>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search restaurants by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterRating === null ? "default" : "outline"}
              onClick={() => setFilterRating(null)}
              className={filterRating === null ? "bg-food-primary hover:bg-food-primary/90" : ""}
            >
              All
            </Button>
            <Button
              variant={filterRating === 4 ? "default" : "outline"}
              onClick={() => setFilterRating(4)}
              className={filterRating === 4 ? "bg-food-primary hover:bg-food-primary/90" : ""}
            >
              <Star className="h-4 w-4 mr-1 fill-amber-500 text-amber-500" />
              4+
            </Button>
            <Button
              variant={filterRating === 3 ? "default" : "outline"}
              onClick={() => setFilterRating(3)}
              className={filterRating === 3 ? "bg-food-primary hover:bg-food-primary/90" : ""}
            >
              <Star className="h-4 w-4 mr-1 fill-amber-500 text-amber-500" />
              3+
            </Button>
            <Button
              variant="outline"
              className="gap-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>
        
        {/* Restaurant list */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRestaurants.map(restaurant => (
              <RestaurantCard key={restaurant.res_id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Restaurants Found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any restaurants matching your search criteria.
            </p>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setFilterRating(null);
              }}
              className="bg-food-primary hover:bg-food-primary/90"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Restaurants;
