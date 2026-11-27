# E-Commerce Management System (Spring Boot + MySQL + RBAC)

A full-featured, enterprise-grade E-Commerce Management System built with **Spring Boot 3**, **Spring Security 6**, **JSON Web Tokens (JWT)**, and **MySQL**, designed with **Role-Based Access Control (RBAC)**.

---

## 🛠️ Technology Stack

- **Backend Framework:** Spring Boot 3.4.3
- **Language:** Java 21 / 25
- **Security:** Spring Security 6 + JJWT (JSON Web Token)
- **Database:** MySQL 8.0 (Production / Default) & H2 (In-memory for automated tests)
- **ORM / Persistence:** Spring Data JPA + Hibernate
- **Build Tool:** Maven (Maven Wrapper `mvnw` included)
- **Documentation:** SpringDoc OpenAPI 3.0 / Swagger UI
- **Utilities:** Lombok, Jakarta Validation

---

## 🛡️ Role-Based Access Control (RBAC)

The system supports three distinct roles with hierarchical permissions:

| Feature / Endpoint | Public / Anonymous | `ROLE_CUSTOMER` | `ROLE_SELLER` | `ROLE_ADMIN` |
| :--- | :---: | :---: | :---: | :---: |
| User Registration & Login | ✅ | ✅ | ✅ | ✅ |
| Browse / Search Products | ✅ | ✅ | ✅ | ✅ |
| Browse Categories | ✅ | ✅ | ✅ | ✅ |
| Add to Cart / Manage Cart | ❌ | ✅ | ❌ | ❌ |
| Checkout & Place Orders | ❌ | ✅ | ❌ | ❌ |
| View Own Order History | ❌ | ✅ | ❌ | ✅ |
| Manage Products (Add/Edit/Delete) | ❌ | ❌ | ✅ (Own items) | ✅ (All items) |
| View Seller Orders & Update Status | ❌ | ❌ | ✅ | ✅ |
| Manage Categories | ❌ | ❌ | ❌ | ✅ |
| Manage Users (Enable/Disable) | ❌ | ❌ | ❌ | ✅ |
| Platform Analytics & Total Revenue | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 Pre-seeded Accounts

When the application boots for the first time, `DataInitializer` automatically ensures all roles exist and seeds a default Super Administrator account:

- **Username:** `admin`
- **Password:** `admin123`
- **Assigned Roles:** `ROLE_ADMIN`, `ROLE_SELLER`, `ROLE_CUSTOMER`

---

## ⚙️ Configuration & Database Setup

The MySQL connection is configured in `src/main/resources/application.yml` with sensible defaults and environment variable overrides:

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:ecommerce_db}?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:root}
```

### Running with your MySQL credentials:

You can supply your MySQL password via environment variables or CLI flags:

```bash
# Using PowerShell environment variables
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
.\mvnw.cmd spring-boot:run

# Or via Spring Boot command-line arguments:
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.password=your_mysql_password"
```

---

## 🖥️ Running the Frontend Application

The modern React + Vite frontend is located in the `frontend/` directory.

### 1. Development Mode
```powershell
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### 2. Production Build
```powershell
cd frontend
npm run build
```

---

## 🧪 Testing the Application

To run the automated integration test suite (runs on embedded H2 database):

```bash
.\mvnw.cmd test
```

---

## 📖 API Documentation & Swagger UI

Once the application is running, visit the interactive Swagger UI:
- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON Spec:** `http://localhost:8080/v3/api-docs`

Use the **Authorize** button in Swagger UI and input your JWT token (`Bearer <token>`) to test authenticated endpoints.

---

## 📡 Core API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a customer or seller
  ```json
  {
    "username": "alice",
    "email": "alice@example.com",
    "password": "password123",
    "fullName": "Alice Smith",
    "phoneNumber": "+1234567890",
    "address": "123 Elm St, New York, NY",
    "roles": ["customer"]
  }
  ```
- `POST /api/auth/login` - Authenticate and obtain JWT
  ```json
  {
    "username": "alice",
    "password": "password123"
  }
  ```

### 2. Products (`/api/products`)
- `GET /api/products` - Paginated product catalog (Public)
- `GET /api/products/{id}` - Product details (Public)
- `GET /api/products/search?keyword=laptop` - Search products (Public)
- `GET /api/products/category/{categoryId}` - Filter by category (Public)
- `POST /api/products` - Create product (`ROLE_SELLER`, `ROLE_ADMIN`)
- `PUT /api/products/{id}` - Update product (Owner or `ROLE_ADMIN`)
- `DELETE /api/products/{id}` - Soft delete product (Owner or `ROLE_ADMIN`)

### 3. Categories (`/api/categories`)
- `GET /api/categories` - List categories (Public)
- `POST /api/categories` - Create category (`ROLE_ADMIN`)
- `PUT /api/categories/{id}` - Update category (`ROLE_ADMIN`)
- `DELETE /api/categories/{id}` - Delete category (`ROLE_ADMIN`)

### 4. Shopping Cart (`/api/cart`) - (`ROLE_CUSTOMER`)
- `GET /api/cart` - View current customer's shopping cart
- `POST /api/cart/items` - Add item to cart
  ```json
  {
    "productId": 1,
    "quantity": 2
  }
  ```
- `PUT /api/cart/items/{productId}?quantity=3` - Update item quantity
- `DELETE /api/cart/items/{productId}` - Remove item from cart
- `DELETE /api/cart` - Empty cart

### 5. Orders & Checkout (`/api/orders`)
- `POST /api/orders` - Checkout active cart (`ROLE_CUSTOMER`)
  ```json
  {
    "shippingAddress": "123 Elm St, New York, NY",
    "paymentMethod": "CREDIT_CARD"
  }
  ```
- `GET /api/orders/my-orders` - Order history (`ROLE_CUSTOMER`)
- `GET /api/orders/tracking/{trackingNumber}` - Track order status (Owner or `ROLE_ADMIN`)
- `GET /api/orders/seller` - View customer orders containing seller's items (`ROLE_SELLER`, `ROLE_ADMIN`)
- `GET /api/orders` - View all platform orders (`ROLE_ADMIN`)
- `PATCH /api/orders/{orderId}/status` - Update order status (`ROLE_SELLER`, `ROLE_ADMIN`)
  ```json
  {
    "status": "SHIPPED"
  }
  ```

### 6. Administration & Analytics (`/api/admin`) - (`ROLE_ADMIN`)
- `GET /api/admin/users` - View all platform users
- `PATCH /api/admin/users/{id}/status?enabled=false` - Suspend/activate user account
- `GET /api/admin/analytics` - Platform overview:
  ```json
  {
    "totalUsers": 25,
    "totalProducts": 140,
    "totalOrders": 85,
    "totalRevenue": 14299.50
  }
  ```
