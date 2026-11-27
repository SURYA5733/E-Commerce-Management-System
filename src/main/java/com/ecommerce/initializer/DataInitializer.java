package com.ecommerce.initializer;

import com.ecommerce.entity.Category;
import com.ecommerce.entity.ERole;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.RoleRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

        private final RoleRepository roleRepository;
        private final UserRepository userRepository;
        private final CategoryRepository categoryRepository;
        private final ProductRepository productRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                // 1. Initialize Roles
                for (ERole roleName : ERole.values()) {
                        if (!roleRepository.existsByName(roleName)) {
                                roleRepository.save(Role.builder().name(roleName).build());
                                log.info("Initialized role: {}", roleName);
                        }
                }

                // 2. Initialize Default Admin user if not exists
                User admin = userRepository.findByUsername("admin").orElseGet(() -> {
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                        .orElseThrow(() -> new RuntimeException("Role not found"));
                        Role sellerRole = roleRepository.findByName(ERole.ROLE_SELLER)
                                        .orElseThrow(() -> new RuntimeException("Role not found"));
                        Role customerRole = roleRepository.findByName(ERole.ROLE_CUSTOMER)
                                        .orElseThrow(() -> new RuntimeException("Role not found"));

                        Set<Role> roles = new HashSet<>();
                        roles.add(adminRole);
                        roles.add(sellerRole);
                        roles.add(customerRole);

                        User newAdmin = User.builder()
                                        .username("admin")
                                        .email("admin@ecommerce.com")
                                        .password(passwordEncoder.encode("admin123"))
                                        .fullName("Platform Administrator")
                                        .phoneNumber("+1234567890")
                                        .address("Admin HQ, 100 Main Street")
                                        .enabled(true)
                                        .roles(roles)
                                        .build();

                        User saved = userRepository.save(newAdmin);
                        log.info("Default Admin created: username='admin', password='admin123'");
                        return saved;
                });

                // 3. Seed 15 Sample Products if catalog is empty
                if (productRepository.count() == 0) {
                        log.info("Catalog is empty. Seeding 15 sample products...");

                        // Create Categories
                        Category electronics = getOrCreateCategory("Electronics & Gadgets",
                                        "Laptops, tablets, displays, and productivity gear");
                        Category wearables = getOrCreateCategory("Wearables & Smart Tech",
                                        "Smartwatches, fitness bands, and health monitors");
                        Category audio = getOrCreateCategory("Audio & Entertainment",
                                        "Headphones, portable speakers, and earbuds");
                        Category footwear = getOrCreateCategory("Fashion & Footwear",
                                        "Premium athletic sneakers, casual wear, and denim");
                        Category home = getOrCreateCategory("Home & Lifestyle",
                                        "Modern appliances, espresso machines, and smart e-readers");

                        List<Product> sampleProducts = List.of(
                                        // Electronics
                                        Product.builder()
                                                        .name("Sony WH-1000XM5 Wireless Headphones")
                                                        .description("Industry-leading noise canceling with two processors and 8 microphones. Up to 30 hours of battery life with quick charging.")
                                                        .price(new BigDecimal("349.99"))
                                                        .stockQuantity(25)
                                                        .sku("SONY-XM5-01")
                                                        .imageUrl("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600")
                                                        .category(audio)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Apple iPad Air 11-inch M2")
                                                        .description("Brilliant Liquid Retina display with P3 wide color, True Tone, and ultralow reflectivity. Powered by the incredibly fast Apple M2 chip.")
                                                        .price(new BigDecimal("599.00"))
                                                        .stockQuantity(18)
                                                        .sku("AAPL-IPAD-02")
                                                        .imageUrl("https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600")
                                                        .category(electronics)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Dell UltraSharp 27-inch 4K Monitor")
                                                        .description("Experience brilliant color clarity and detail on an exceptional 27\" 4K hub monitor with extensive connectivity including USB-C.")
                                                        .price(new BigDecimal("479.50"))
                                                        .stockQuantity(14)
                                                        .sku("DELL-U27-03")
                                                        .imageUrl("https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600")
                                                        .category(electronics)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Logitech MX Master 3S Wireless Mouse")
                                                        .description("Quiet Click technology and an 8K DPI tracking sensor on any surface including glass. Ergonomic sculpted design for all-day comfort.")
                                                        .price(new BigDecimal("99.99"))
                                                        .stockQuantity(40)
                                                        .sku("LOGI-MX3S-04")
                                                        .imageUrl("https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600")
                                                        .category(electronics)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        // Wearables
                                        Product.builder()
                                                        .name("Apple Watch Series 10 GPS 46mm")
                                                        .description("Thinnest Apple Watch ever with our biggest display. Breakthrough health insights with sleep apnea notifications and ECG tracking.")
                                                        .price(new BigDecimal("399.00"))
                                                        .stockQuantity(20)
                                                        .sku("AAPL-W10-05")
                                                        .imageUrl("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600")
                                                        .category(wearables)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Samsung Galaxy Watch 7 LTE")
                                                        .description("AI-powered personalized health coaching, Dual-frequency GPS, Energy Score, and comprehensive wellness analysis.")
                                                        .price(new BigDecimal("299.99"))
                                                        .stockQuantity(22)
                                                        .sku("SAMS-GW7-06")
                                                        .imageUrl("https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600")
                                                        .category(wearables)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Garmin Forerunner 265 Running GPS Watch")
                                                        .description("Vibrant AMOLED touchscreen display with advanced training metrics, recovery insights, and multi-sport GPS tracking.")
                                                        .price(new BigDecimal("449.99"))
                                                        .stockQuantity(12)
                                                        .sku("GARM-FR265-07")
                                                        .imageUrl("https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600")
                                                        .category(wearables)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        // Audio
                                        Product.builder()
                                                        .name("Bose SoundLink Flex Portable Bluetooth Speaker")
                                                        .description("Crisp, clear sound and deep bass. Waterproof and dustproof (IP67) rugged design, engineered to withstand drops and elements.")
                                                        .price(new BigDecimal("149.00"))
                                                        .stockQuantity(35)
                                                        .sku("BOSE-FLEX-08")
                                                        .imageUrl("https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600")
                                                        .category(audio)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Apple AirPods Pro (2nd Generation)")
                                                        .description("Up to 2x more Active Noise Cancellation. Transparency mode, Adaptive Audio, and personalized Spatial Audio with dynamic head tracking.")
                                                        .price(new BigDecimal("249.00"))
                                                        .stockQuantity(30)
                                                        .sku("AAPL-APP2-09")
                                                        .imageUrl("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600")
                                                        .category(audio)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Marshall Emberton II Portable Speaker")
                                                        .description("Iconic Marshall vintage aesthetic with True Stereophonic multi-directional 360° sound and 30+ hours of portable playtime.")
                                                        .price(new BigDecimal("169.99"))
                                                        .stockQuantity(15)
                                                        .sku("MARSH-EMB-10")
                                                        .imageUrl("https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600")
                                                        .category(audio)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        // Fashion / Footwear
                                        Product.builder()
                                                        .name("Nike Air Max 270 Athletic Sneakers")
                                                        .description("Boasts Nike's biggest heel Air unit yet for a super-soft ride that feels as impossible as it looks. Breathable knit mesh upper.")
                                                        .price(new BigDecimal("160.00"))
                                                        .stockQuantity(28)
                                                        .sku("NIKE-AM270-11")
                                                        .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600")
                                                        .category(footwear)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Adidas Ultraboost Light Running Shoes")
                                                        .description("Lightest Ultraboost ever made with 30% lighter BOOST foam material. Continental rubber outsole for superior grip in all conditions.")
                                                        .price(new BigDecimal("190.00"))
                                                        .stockQuantity(24)
                                                        .sku("ADID-UB-12")
                                                        .imageUrl("https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600")
                                                        .category(footwear)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Levi's Original 501 Straight Fit Jeans")
                                                        .description("The original blue jean since 1873. Classic straight leg fit with iconic button fly and timeless durable denim styling.")
                                                        .price(new BigDecimal("79.50"))
                                                        .stockQuantity(50)
                                                        .sku("LEVI-501-13")
                                                        .imageUrl("https://images.unsplash.com/photo-1542272604-780c96856592?w=600")
                                                        .category(footwear)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        // Home & Lifestyle
                                        Product.builder()
                                                        .name("Nespresso Vertuo Pop Coffee & Espresso Machine")
                                                        .description("Compact single-serve coffee maker brewing authentic espresso and coffee cups with rich crema at the touch of a single button.")
                                                        .price(new BigDecimal("129.95"))
                                                        .stockQuantity(16)
                                                        .sku("NESP-VERT-14")
                                                        .imageUrl("https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600")
                                                        .category(home)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build(),

                                        Product.builder()
                                                        .name("Kindle Paperwhite 16GB Signature Edition")
                                                        .description("6.8-inch display with auto-adjusting front light, wireless charging, glare-free 300 ppi paper-like screen, and weeks of battery.")
                                                        .price(new BigDecimal("189.99"))
                                                        .stockQuantity(30)
                                                        .sku("AMZN-KPW-15")
                                                        .imageUrl("https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600")
                                                        .category(home)
                                                        .seller(admin)
                                                        .active(true)
                                                        .build());

                        productRepository.saveAll(sampleProducts);
                        log.info("Successfully seeded 15 sample products across 5 categories!");
                }
        }

        private Category getOrCreateCategory(String name, String description) {
                return categoryRepository.findByNameIgnoreCase(name)
                                .orElseGet(() -> categoryRepository.save(Category.builder()
                                                .name(name)
                                                .description(description)
                                                .build()));
        }
}
