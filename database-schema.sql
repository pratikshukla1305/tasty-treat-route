
-- Create the food_delivery database
CREATE DATABASE IF NOT EXISTS food_delivery;
USE food_delivery;

-- Customer table
CREATE TABLE IF NOT EXISTS customer (
  customer_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  customer_contact_number VARCHAR(15) NOT NULL,
  customer_address TEXT NOT NULL,
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant table
CREATE TABLE IF NOT EXISTS restaurant (
  res_id INT AUTO_INCREMENT PRIMARY KEY,
  res_name VARCHAR(100) NOT NULL,
  res_location VARCHAR(200) NOT NULL,
  res_rating DECIMAL(2,1) DEFAULT 0,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Food table
CREATE TABLE IF NOT EXISTS food (
  food_id INT AUTO_INCREMENT PRIMARY KEY,
  food_name VARCHAR(100) NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  restaurant_id INT NOT NULL,
  category VARCHAR(50),
  description TEXT,
  image_url VARCHAR(255),
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurant(res_id)
);

-- Delivery Partner table
CREATE TABLE IF NOT EXISTS delivery_partner (
  deliveryp_id INT AUTO_INCREMENT PRIMARY KEY,
  deliveryp_name VARCHAR(100) NOT NULL,
  deliveryp_contact VARCHAR(15) NOT NULL,
  availability BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  res_id INT NOT NULL,
  order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  ordered_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  delivered_time TIMESTAMP NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  deliveryp_id INT,
  payment_id INT,
  payment_type VARCHAR(50) DEFAULT 'cash',
  payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
  FOREIGN KEY (res_id) REFERENCES restaurant(res_id),
  FOREIGN KEY (deliveryp_id) REFERENCES delivery_partner(deliveryp_id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  item_id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  food_id INT NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (food_id) REFERENCES food(food_id)
);

-- Insert sample data for testing
-- Sample Customers
INSERT INTO customer (customer_name, customer_contact_number, customer_address, email) VALUES
('John Doe', '9876543210', '123 Main St, Apt 4B, Mumbai', 'john@example.com'),
('Priya Sharma', '8765432109', '456 Park Avenue, Delhi', 'priya@example.com'),
('Raj Kumar', '7654321098', '789 Market Road, Bangalore', 'raj@example.com');

-- Sample Restaurants
INSERT INTO restaurant (res_name, res_location, res_rating, image_url) VALUES
('Spice Garden', 'Mumbai Central', 4.5, 'https://example.com/images/spicegarden.jpg'),
('Taste of Punjab', 'Connaught Place, Delhi', 4.2, 'https://example.com/images/punjab.jpg'),
('Southern Delights', 'MG Road, Bangalore', 4.7, 'https://example.com/images/southern.jpg');

-- Sample Foods
INSERT INTO food (food_name, price_per_unit, restaurant_id, category, description, is_vegetarian, is_bestseller) VALUES
('Butter Chicken', 350.00, 1, 'Main Course', 'Creamy tomato chicken curry', FALSE, TRUE),
('Paneer Tikka', 250.00, 1, 'Starter', 'Grilled cottage cheese with spices', TRUE, TRUE),
('Chole Bhature', 180.00, 2, 'Main Course', 'Spicy chickpea curry with fried bread', TRUE, TRUE),
('Masala Dosa', 120.00, 3, 'Breakfast', 'Crispy rice crepe with potato filling', TRUE, TRUE),
('Chicken Biryani', 280.00, 3, 'Main Course', 'Fragrant rice dish with chicken', FALSE, TRUE);

-- Sample Delivery Partners
INSERT INTO delivery_partner (deliveryp_name, deliveryp_contact, availability) VALUES
('Amit Singh', '9988776655', TRUE),
('Deepak Verma', '8877665544', TRUE);

-- Sample Orders
INSERT INTO orders (customer_id, res_id, order_status, total_amount, deliveryp_id, payment_type) VALUES
(1, 1, 'delivered', 600.00, 1, 'online'),
(2, 2, 'processing', 360.00, 2, 'cash'),
(3, 3, 'pending', 400.00, NULL, 'online');

-- Sample Order Items
INSERT INTO order_items (order_id, food_id, quantity) VALUES
(1, 1, 1),
(1, 2, 1),
(2, 3, 2),
(3, 4, 2),
(3, 5, 1);
