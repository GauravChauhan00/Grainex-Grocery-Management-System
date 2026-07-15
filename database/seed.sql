INSERT OR IGNORE INTO stores (id, name, owner_name, email, phone, password_hash, status, plan) VALUES
(1, 'Gaurav''s Store', 'Gaurav', 'gaurav@example.com', '9876543210', 'scrypt:32768:8:1$mUN0hb1WGvOlxNMu$6ca8cc9bd9c264045d0de8090c908698d2f4dabce66ea37f6afeb3ed1587a40b164ba8fede76d38c8d251d67e0cd7976d79f03c13ae1edd4a93167784443c36c', 'active', 'premium');

INSERT OR IGNORE INTO categories (store_id, name, description) VALUES
(1, 'Fruits & Vegetables', 'Fresh fruits, vegetables and everyday produce'),
(1, 'Dairy', 'Milk, curd, cheese and chilled dairy products'),
(1, 'Bakery', 'Bread, buns and baked goods'),
(1, 'Beverages', 'Juices, tea, coffee and soft drinks'),
(1, 'Snacks', 'Chips, biscuits and quick snacks'),
(1, 'Grains & Staples', 'Rice, flour, pulses and kitchen staples'),
(1, 'Household', 'Cleaning and household-use products');

INSERT OR IGNORE INTO products
(store_id, product_name, category_id, quantity, unit_price, supplier_name, expiry_date, low_stock_threshold)
VALUES
(1, 'Bananas', (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' AND store_id = 1), 42, 48.00, 'Fresh Farm Traders', date('now', '+5 days'), 10),
(1, 'Red Apples', (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' AND store_id = 1), 8, 160.00, 'Himalayan Produce', date('now', '+12 days'), 10),
(1, 'Tomatoes', (SELECT id FROM categories WHERE name = 'Fruits & Vegetables' AND store_id = 1), 25, 38.00, 'Fresh Farm Traders', date('now', '+6 days'), 10),
(1, 'Toned Milk 1L', (SELECT id FROM categories WHERE name = 'Dairy' AND store_id = 1), 24, 62.00, 'Daily Dairy Co.', date('now', '+4 days'), 8),
(1, 'Plain Yogurt 400g', (SELECT id FROM categories WHERE name = 'Dairy' AND store_id = 1), 0, 55.00, 'Daily Dairy Co.', date('now', '+3 days'), 6),
(1, 'Brown Bread', (SELECT id FROM categories WHERE name = 'Bakery' AND store_id = 1), 15, 45.00, 'City Bakers', date('now', '+5 days'), 5),
(1, 'Orange Juice 1L', (SELECT id FROM categories WHERE name = 'Beverages' AND store_id = 1), 12, 110.00, 'Sunrise Beverages', date('now', '+45 days'), 5),
(1, 'Masala Potato Chips', (SELECT id FROM categories WHERE name = 'Snacks' AND store_id = 1), 6, 30.00, 'Crunch Foods', date('now', '+90 days'), 10),
(1, 'Basmati Rice 5kg', (SELECT id FROM categories WHERE name = 'Grains & Staples' AND store_id = 1), 18, 620.00, 'Golden Grain Supply', date('now', '+300 days'), 5),
(1, 'Whole Wheat Flour 5kg', (SELECT id FROM categories WHERE name = 'Grains & Staples' AND store_id = 1), 9, 285.00, 'Golden Grain Supply', date('now', '+180 days'), 10),
(1, 'Dishwash Liquid 500ml', (SELECT id FROM categories WHERE name = 'Household' AND store_id = 1), 21, 105.00, 'CleanHome Distributors', date('now', '+500 days'), 5),
(1, 'Green Tea 25 Bags', (SELECT id FROM categories WHERE name = 'Beverages' AND store_id = 1), 4, 145.00, 'Sunrise Beverages', date('now', '+240 days'), 6);

INSERT INTO sales (store_id, product_id, quantity_sold, price_per_unit, total_amount, sale_date) VALUES
(1, (SELECT id FROM products WHERE product_name = 'Bananas' AND store_id = 1), 4, 48.00, 192.00, datetime('now', 'localtime', '-6 days', '-3 hours')),
(1, (SELECT id FROM products WHERE product_name = 'Brown Bread' AND store_id = 1), 2, 45.00, 90.00, datetime('now', 'localtime', '-5 days', '-2 hours')),
(1, (SELECT id FROM products WHERE product_name = 'Toned Milk 1L' AND store_id = 1), 3, 62.00, 186.00, datetime('now', 'localtime', '-5 days', '+1 hour')),
(1, (SELECT id FROM products WHERE product_name = 'Red Apples' AND store_id = 1), 2, 160.00, 320.00, datetime('now', 'localtime', '-4 days', '-1 hour')),
(1, (SELECT id FROM products WHERE product_name = 'Masala Potato Chips' AND store_id = 1), 5, 30.00, 150.00, datetime('now', 'localtime', '-3 days', '-2 hours')),
(1, (SELECT id FROM products WHERE product_name = 'Basmati Rice 5kg' AND store_id = 1), 1, 620.00, 620.00, datetime('now', 'localtime', '-3 days', '+2 hours')),
(1, (SELECT id FROM products WHERE product_name = 'Tomatoes' AND store_id = 1), 3, 38.00, 114.00, datetime('now', 'localtime', '-2 days', '-1 hour')),
(1, (SELECT id FROM products WHERE product_name = 'Orange Juice 1L' AND store_id = 1), 2, 110.00, 220.00, datetime('now', 'localtime', '-2 days', '+3 hours')),
(1, (SELECT id FROM products WHERE product_name = 'Toned Milk 1L' AND store_id = 1), 2, 62.00, 124.00, datetime('now', 'localtime', '-1 day', '-2 hours')),
(1, (SELECT id FROM products WHERE product_name = 'Bananas' AND store_id = 1), 6, 48.00, 288.00, datetime('now', 'localtime', '-1 day', '+1 hour')),
(1, (SELECT id FROM products WHERE product_name = 'Whole Wheat Flour 5kg' AND store_id = 1), 1, 285.00, 285.00, datetime('now', 'localtime', '-5 hours')),
(1, (SELECT id FROM products WHERE product_name = 'Dishwash Liquid 500ml' AND store_id = 1), 2, 105.00, 210.00, datetime('now', 'localtime', '-2 hours'));
