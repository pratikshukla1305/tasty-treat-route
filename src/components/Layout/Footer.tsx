
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted mt-12">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold text-food-primary mb-4">TastyBites</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Delivering your favorite food from the best restaurants in town, straight to your doorstep.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-food-primary">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-food-primary">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-food-primary">
                <Twitter size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Useful Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-food-primary">About Us</Link>
              </li>
              <li>
                <Link to="/restaurants" className="text-muted-foreground hover:text-food-primary">Restaurants</Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-food-primary">FAQ</Link>
              </li>
              <li>
                <Link to="/careers" className="text-muted-foreground hover:text-food-primary">Careers</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-food-primary">Contact Us</Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-food-primary">Help Center</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-muted-foreground hover:text-food-primary">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-food-primary">Terms of Service</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Download Our App</h4>
            <p className="text-sm text-muted-foreground mb-4">Get the best food delivery experience on our mobile app.</p>
            <div className="flex flex-col space-y-2">
              <a href="#" className="block">
                <img src="https://via.placeholder.com/150x50?text=App+Store" alt="App Store" className="h-10 rounded" />
              </a>
              <a href="#" className="block">
                <img src="https://via.placeholder.com/150x50?text=Google+Play" alt="Google Play" className="h-10 rounded" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TastyBites. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
