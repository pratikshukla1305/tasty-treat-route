
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Restaurant } from "@/lib/api";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RestaurantCardProps {
  restaurant: Restaurant;
  className?: string;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  className,
}) => {
  return (
    <Link to={`/restaurants/${restaurant.res_id}`}>
      <Card className={cn("restaurant-card group h-full", className)}>
        <div className="overflow-hidden">
          <img
            src={restaurant.image_url || `https://source.unsplash.com/300x200/?restaurant,food,${restaurant.res_name}`}
            alt={restaurant.res_name}
            className="restaurant-card-image"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-lg">{restaurant.res_name}</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {restaurant.res_location}
          </p>
          <div className="flex items-center">
            <div className="flex items-center bg-food-light px-1.5 py-0.5 rounded text-sm">
              <Star className="h-3.5 w-3.5 text-amber-500 mr-1 fill-amber-500" />
              <span className="font-medium text-food-dark">
                {restaurant.res_rating.toFixed(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RestaurantCard;
