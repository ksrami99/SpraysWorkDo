import express from "express";

const app = express();

app.use(express.json());

// Import routes
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import productRoutes from "./routes/products.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import reviewsRoutes from "./routes/reviews.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import { verifyToken } from "./middleware/auth.middleware.js";

app.use("/api/v1/healthcheck", healthCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/cart",verifyToken, cartRoutes);
app.use("/api/v1/orders",verifyToken, ordersRoutes);
app.use("/api/v1/reviews",verifyToken, reviewsRoutes);
app.use("/api/v1/wishlist",verifyToken, wishlistRoutes);

export default app;
