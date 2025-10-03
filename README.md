# Sprays Backend API

A comprehensive e-commerce backend API built with Node.js and Express.js for a spray products online store. This API provides complete functionality for user management, product catalog, shopping cart, orders, reviews, and wishlist features.

## 🚀 Technologies Used

### Backend Framework & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **ES6 Modules** - Modern JavaScript module system

### Database & ORM
- **MySQL** - Relational database management system
- **mysql2** - MySQL client for Node.js

### Authentication & Security
- **JWT (jsonwebtoken)** - JSON Web Token for authentication
- **bcryptjs** - Password hashing and verification
- **express-validator** - Input validation and sanitization

### File Upload & Storage
- **Multer** - Middleware for handling multipart/form-data
- **Cloudinary** - Cloud-based image and video management

### Email Services
- **Nodemailer** - Email sending functionality
- **Mailgen** - Email template generator

### Development Tools
- **Nodemon** - Development server with auto-restart
- **Prettier** - Code formatting
- **CORS** - Cross-Origin Resource Sharing

## 🏗️ Architecture & Design Patterns

### MVC Architecture
- **Model** - Database schema and stored procedures
- **View** - JSON API responses with standardized format
- **Controller** - Business logic and request handling

### Middleware Pattern
- **Authentication Middleware** - JWT token verification
- **Authorization Middleware** - Role-based access control
- **Validation Middleware** - Input sanitization and validation
- **File Upload Middleware** - Image handling with Multer

### Database Design
- **Normalized Database** - 3NF compliant schema design
- **Stored Procedures** - Complex database operations
- **Foreign Key Constraints** - Data integrity enforcement
- **Indexes** - Optimized query performance

## 🔒 Security Features

- **JWT Authentication** - Stateless authentication system
- **Password Hashing** - bcryptjs with salt rounds
- **Input Validation** - express-validator for data sanitization
- **CORS Configuration** - Cross-origin request security
- **Role-Based Access Control** - Granular permission system
- **SQL Injection Prevention** - Parameterized queries
- **File Upload Security** - Image type validation and size limits

## 📋 Project Overview

This backend API serves as the foundation for an e-commerce platform specializing in spray products. The system includes:

- **User Management**: Registration, login, profile management with role-based access control (Admin/Customer)
- **Product Catalog**: Complete CRUD operations for products with image management
- **Category Management**: Organize products into categories
- **Shopping Cart**: Add, update, remove items from cart
- **Order Management**: Place orders, track status, and manage order history
- **Review System**: Users can rate and review products
- **Wishlist**: Save favorite products for later
- **Role-Based Access Control**: Admin and customer roles with different permissions

## 🛠 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user profile

### User Management (`/api/v1/user`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user details by ID
- `PATCH /:id` - Update user information
- `DELETE /:id` - Delete user account
- `POST /admin/register` - Register admin account
- `POST /admin/login` - Admin login

### Categories (`/api/v1/categories`)
- `GET /` - Get all categories (Admin only)
- `GET /:id` - Get category by ID (Admin only)
- `POST /` - Create new category (Admin only)
- `PATCH /:id` - Update category (Admin only)
- `DELETE /:id` - Delete category (Admin only)

### Products (`/api/v1/product`)
- `GET /` - Get all products
- `GET /:id` - Get product by ID
- `POST /` - Create new product (with image upload)
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product
- `POST /:id/images` - Upload product images
- `DELETE /:id/images/:imageId` - Delete product image

### Shopping Cart (`/api/v1/cart`)
- `GET /` - Get user's cart
- `POST /` - Add item to cart
- `PATCH /:productId` - Update cart item quantity
- `DELETE /:productId` - Remove item from cart

### Orders (`/api/v1/orders`)
- `GET /` - Get user's orders
- `GET /all` - Get all orders (Admin only)
- `POST /` - Place new order
- `GET /:id` - Get order by ID
- `PUT /:id/cancel` - Cancel order
- `PUT /:id/status` - Update order status (Admin only)

### Reviews (`/api/v1/reviews`)
- `GET /products/:productId` - Get reviews for a product
- `GET /:id` - Get review by ID
- `POST /:productId` - Add review for product
- `PUT /:id` - Update review

### Wishlist (`/api/v1/wishlist`)
- `GET /` - Get user's wishlist
- `POST /` - Add product to wishlist
- `DELETE /:productId` - Remove product from wishlist

### Role-Based Access Control (`/api/v1/rbac`)
- Endpoints for managing user roles and permissions

### Health Check (`/api/v1/healthcheck`)
- `GET /` - API health status

## 🗄 Database Schema

The application uses MySQL with the following database tables:

### User Management Tables

#### `users`
- `id` (INT, Primary Key, Auto Increment)
- `email` (VARCHAR(255), Unique, Not Null)
- `password` (VARCHAR(255), Not Null)
- `fullname` (VARCHAR(150), Not Null)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, Auto Update)

#### `roles`
- `id` (INT, Primary Key, Auto Increment)
- `role_name` (VARCHAR(50), Unique, Not Null)
- `description` (VARCHAR(255))

#### `user_roles`
- `user_id` (INT, Foreign Key → users.id)
- `role_id` (INT, Foreign Key → roles.id)
- Primary Key: (user_id, role_id)

#### `permissions`
- `id` (INT, Primary Key, Auto Increment)
- `permission_name` (VARCHAR(100), Unique, Not Null)
- `description` (VARCHAR(255))

#### `role_permissions`
- `role_id` (INT, Foreign Key → roles.id)
- `permission_id` (INT, Foreign Key → permissions.id)
- Primary Key: (role_id, permission_id)

#### `admins`
- `user_id` (INT, Primary Key, Foreign Key → users.id)
- `department` (VARCHAR(100))
- `super_admin` (BOOLEAN, Default: FALSE)

### Product Management Tables

#### `categories`
- `id` (INT, Primary Key, Auto Increment)
- `name` (VARCHAR(100), Unique, Not Null)
- `slug` (VARCHAR(150), Unique, Not Null)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

#### `products`
- `id` (INT, Primary Key, Auto Increment)
- `title` (VARCHAR(255), Not Null)
- `slug` (VARCHAR(255), Unique, Not Null)
- `description` (TEXT)
- `price` (DECIMAL(10, 2), Not Null)
- `stock` (INT, Not Null, Default: 0)
- `sku` (VARCHAR(100))
- `category_id` (INT, Foreign Key → categories.id)
- `is_active` (TINYINT(1), Default: 1)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, Auto Update)

#### `product_images`
- `id` (INT, Primary Key, Auto Increment)
- `product_id` (INT, Foreign Key → products.id)
- `url` (VARCHAR(500), Not Null)
- `is_primary` (TINYINT(1), Default: 0)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

### E-commerce Functionality Tables

#### `carts`
- `id` (INT, Primary Key, Auto Increment)
- `user_id` (INT, Unique, Foreign Key → users.id)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

#### `cart_items`
- `id` (INT, Primary Key, Auto Increment)
- `cart_id` (INT, Foreign Key → carts.id)
- `product_id` (INT, Foreign Key → products.id)
- `quantity` (INT, Not Null, Default: 1)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

#### `orders`
- `id` (INT, Primary Key, Auto Increment)
- `user_id` (INT, Foreign Key → users.id)
- `total_amount` (DECIMAL(12, 2), Not Null)
- `status` (ENUM: 'pending', 'delivered', 'canceled', Default: 'pending')
- `address` (TEXT)
- `payment_method` (VARCHAR(100))
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, Auto Update)

#### `order_items`
- `id` (INT, Primary Key, Auto Increment)
- `order_id` (INT, Foreign Key → orders.id)
- `product_id` (INT, Foreign Key → products.id)
- `quantity` (INT, Not Null)
- `price_at_purchase` (DECIMAL(10, 2), Not Null)

#### `wishlists`
- `id` (INT, Primary Key, Auto Increment)
- `user_id` (INT, Foreign Key → users.id)
- `product_id` (INT, Foreign Key → products.id)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)
- Unique Key: (user_id, product_id)

#### `reviews`
- `id` (INT, Primary Key, Auto Increment)
- `user_id` (INT, Foreign Key → users.id)
- `product_id` (INT, Foreign Key → products.id)
- `rating` (TINYINT, Not Null, Check: 1-5)
- `title` (VARCHAR(255))
- `comment` (TEXT)
- `created_at` (TIMESTAMP, Default: CURRENT_TIMESTAMP)

## 🔧 Key Features

- **JWT Authentication** - Secure token-based authentication
- **Role-Based Access Control** - Different permissions for admin and customers
- **Image Upload** - Cloudinary integration for product images
- **Input Validation** - Comprehensive validation using express-validator
- **Error Handling** - Centralized error handling with custom error classes
- **Database Procedures** - Stored procedures for complex database operations
- **Admin Seeding** - Initial admin account creation

## 📊 Performance & Scalability

- **RESTful API Design** - Standard HTTP methods and status codes
- **Database Optimization** - Indexed queries and stored procedures
- **Async/Await Pattern** - Non-blocking I/O operations
- **Connection Pooling** - MySQL connection management
- **Error Handling** - Graceful error responses with proper HTTP codes
- **Input Sanitization** - Prevention of malicious data injection
- **Cloud Storage** - Scalable image hosting with Cloudinary

## 🧪 Development Best Practices

- **Code Organization** - Modular architecture with separation of concerns
- **ES6+ Features** - Modern JavaScript syntax and modules
- **Environment Configuration** - Secure environment variable management
- **Code Formatting** - Prettier for consistent code style
- **Git Version Control** - Proper version control with meaningful commits
- **Documentation** - Comprehensive API documentation
- **Error Logging** - Structured error handling and logging

## 📁 Project Structure

```
src/
├── controllers/     # Route handlers and business logic
├── middleware/      # Authentication, validation, and file upload
├── routes/          # API route definitions
├── validators/      # Input validation schemas
├── db/              # Database configuration and procedures
├── utils/           # Utility functions and constants
└── seed/            # Database seeding scripts
```

## 🚀 Getting Started

The project is configured to run with:
- Node.js runtime
- MySQL database
- Environment variables for configuration
- Development server with nodemon for auto-restart

## 🎯 Project Highlights

### Technical Achievements
- **Scalable Architecture** - Built a production-ready e-commerce API supporting multiple user roles
- **Database Design** - Designed and implemented a normalized 13-table database schema
- **Security Implementation** - Implemented JWT authentication with role-based access control
- **Cloud Integration** - Integrated Cloudinary for scalable image management
- **API Design** - Created 40+ RESTful endpoints with proper HTTP status codes

### Business Logic Implementation
- **E-commerce Workflow** - Complete shopping cart to order placement process
- **Inventory Management** - Product stock tracking and management
- **Review System** - Product rating and review functionality
- **Wishlist Feature** - User favorite products management
- **Admin Panel** - Comprehensive admin dashboard functionality

### Code Quality & Standards
- **Clean Architecture** - MVC pattern with separation of concerns
- **Error Handling** - Centralized error handling with custom error classes
- **Input Validation** - Comprehensive validation using express-validator
- **Database Optimization** - Stored procedures and indexed queries
- **Documentation** - Complete API documentation and database schema

## 🛠️ Skills Demonstrated

### Backend Development
- Node.js, Express.js, JavaScript ES6+
- RESTful API design and implementation
- Database design and optimization (MySQL)
- Authentication and authorization systems

### Database Management
- MySQL database design and normalization
- Stored procedures and complex queries
- Foreign key relationships and data integrity
- Connection pooling and performance optimization

### Security & Best Practices
- JWT token-based authentication
- Password hashing and encryption
- Input validation and sanitization
- CORS configuration and security headers

### DevOps & Tools
- Environment configuration management
- Code formatting and linting (Prettier)
- Version control with Git
- Cloud service integration (Cloudinary)

## 📈 Future Enhancements

- **Testing Suite** - Unit and integration tests with Jest
- **API Rate Limiting** - Implement rate limiting for API endpoints
- **Caching Layer** - Redis integration for improved performance
- **Real-time Features** - WebSocket integration for live updates
- **Payment Integration** - Stripe/PayPal payment gateway
- **Microservices** - Break down into microservices architecture

## 👨‍💻 Author

**Karan** - Full-stack developer

---

*This backend API demonstrates professional-level development skills in building scalable, secure, and maintainable e-commerce solutions. The project showcases expertise in modern web technologies, database design, and API development best practices.*
