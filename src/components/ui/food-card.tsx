
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { Food } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Plus, Check } from "lucide-react";

interface FoodCardProps {
  food: Food;
  restaurantId: number;
  restaurantName?: string;
  className?: string;
}

const FoodCard: React.FC<FoodCardProps> = ({
  food,
  restaurantId,
  restaurantName,
  className,
}) => {
  const { addToCart, items } = useCart();
  
  const isInCart = items.some(item => item.food_id === food.food_id);

  const handleAddToCart = () => {
    addToCart({
      food_id: food.food_id,
      food_name: food.food_name,
      price_per_unit: food.price_per_unit,
      quantity: 1,
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      image_url: food.image_url,
    });
  };

  return (
    <Card className={cn("food-card group", className)}>
      <div className="overflow-hidden aspect-video">
        <img
          src={food.image_url || `https://source.unsplash.com/300x200/?food,${food.food_name}`}
          alt={food.food_name}
          className="food-card-image"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium">{food.food_name}</h3>
          <span className="text-food-primary font-semibold">
            ₹{food.price_per_unit.toFixed(2)}
          </span>
        </div>
        
        {food.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {food.description}
          </p>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            {food.is_vegetarian !== undefined && (
              <span 
                className={`inline-block h-4 w-4 rounded-full border ${
                  food.is_vegetarian 
                    ? "border-green-500 bg-green-100" 
                    : "border-red-500 bg-red-100"
                } mr-2`}
                title={food.is_vegetarian ? "Vegetarian" : "Non-vegetarian"}
              />
            )}
            {food.is_bestseller && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-sm font-medium">
                Bestseller
              </span>
            )}
          </div>
          
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={isInCart}
            className={cn(
              "h-8 gap-1",
              isInCart 
                ? "bg-green-500 hover:bg-green-500/90" 
                : "bg-food-primary hover:bg-food-primary/90"
            )}
          >
            {isInCart ? (
              <>
                <Check className="h-4 w-4" /> Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodCard;
