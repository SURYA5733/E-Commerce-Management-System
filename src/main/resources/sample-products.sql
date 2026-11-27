-- ==========================================================
-- E-Commerce Management System: 15 Sample Products & Categories
-- ==========================================================

-- 1. Insert Categories
INSERT IGNORE INTO categories (id, name, description) VALUES
(1, 'Electronics & Gadgets', 'Laptops, tablets, displays, and productivity gear'),
(2, 'Wearables & Smart Tech', 'Smartwatches, fitness bands, and health monitors'),
(3, 'Audio & Entertainment', 'Headphones, portable speakers, and earbuds'),
(4, 'Fashion & Footwear', 'Premium athletic sneakers, casual wear, and denim'),
(5, 'Home & Lifestyle', 'Modern appliances, espresso machines, and smart e-readers');

-- 2. Insert 15 Products (Assumes seller_id = 1 for default admin)
INSERT INTO products (name, description, price, stock_quantity, sku, image_url, category_id, seller_id, active, created_at, updated_at) VALUES
('Sony WH-1000XM5 Wireless Headphones', 'Industry-leading noise canceling with two processors and 8 microphones. Up to 30 hours of battery life.', 349.99, 25, 'SONY-XM5-01', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', 3, 1, 1, NOW(), NOW()),
('Apple iPad Air 11-inch M2', 'Brilliant Liquid Retina display with P3 wide color, True Tone, and powered by Apple M2 chip.', 599.00, 18, 'AAPL-IPAD-02', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600', 1, 1, 1, NOW(), NOW()),
('Dell UltraSharp 27-inch 4K Monitor', 'Experience brilliant color clarity and detail on an exceptional 27" 4K hub monitor with USB-C.', 479.50, 14, 'DELL-U27-03', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600', 1, 1, 1, NOW(), NOW()),
('Logitech MX Master 3S Wireless Mouse', 'Quiet Click technology and an 8K DPI tracking sensor on any surface including glass.', 99.99, 40, 'LOGI-MX3S-04', 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600', 1, 1, 1, NOW(), NOW()),

('Apple Watch Series 10 GPS 46mm', 'Thinnest Apple Watch ever with our biggest display and sleep apnea notifications.', 399.00, 20, 'AAPL-W10-05', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600', 2, 1, 1, NOW(), NOW()),
('Samsung Galaxy Watch 7 LTE', 'AI-powered personalized health coaching, Dual-frequency GPS, and Energy Score wellness analysis.', 299.99, 22, 'SAMS-GW7-06', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600', 2, 1, 1, NOW(), NOW()),
('Garmin Forerunner 265 Running GPS Watch', 'Vibrant AMOLED touchscreen display with advanced training metrics and recovery insights.', 449.99, 12, 'GARM-FR265-07', 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600', 2, 1, 1, NOW(), NOW()),

('Bose SoundLink Flex Portable Bluetooth Speaker', 'Crisp, clear sound and deep bass. Waterproof and dustproof (IP67) rugged design.', 149.00, 35, 'BOSE-FLEX-08', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600', 3, 1, 1, NOW(), NOW()),
('Apple AirPods Pro (2nd Generation)', 'Up to 2x more Active Noise Cancellation with Adaptive Audio and personalized Spatial Audio.', 249.00, 30, 'AAPL-APP2-09', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600', 3, 1, 1, NOW(), NOW()),
('Marshall Emberton II Portable Speaker', 'Iconic Marshall vintage aesthetic with True Stereophonic 360° sound and 30+ hours of playtime.', 169.99, 15, 'MARSH-EMB-10', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600', 3, 1, 1, NOW(), NOW()),

('Nike Air Max 270 Athletic Sneakers', 'Boasts Nikes biggest heel Air unit yet for a super-soft ride and breathable knit upper.', 160.00, 28, 'NIKE-AM270-11', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600', 4, 1, 1, NOW(), NOW()),
('Adidas Ultraboost Light Running Shoes', 'Lightest Ultraboost ever made with 30% lighter BOOST foam and Continental rubber outsole.', 190.00, 24, 'ADID-UB-12', 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600', 4, 1, 1, NOW(), NOW()),
('Levis Original 501 Straight Fit Jeans', 'The original blue jean since 1873. Classic straight leg fit with iconic button fly.', 79.50, 50, 'LEVI-501-13', 'https://images.unsplash.com/photo-1542272604-780c96856592?w=600', 4, 1, 1, NOW(), NOW()),

('Nespresso Vertuo Pop Coffee Machine', 'Compact single-serve coffee maker brewing authentic espresso and coffee with rich crema.', 129.95, 16, 'NESP-VERT-14', 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600', 5, 1, 1, NOW(), NOW()),
('Kindle Paperwhite 16GB Signature Edition', '6.8-inch display with auto-adjusting front light, wireless charging, and glare-free 300 ppi screen.', 189.99, 30, 'AMZN-KPW-15', 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600', 5, 1, 1, NOW(), NOW());
