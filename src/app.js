import express from "express";

const app = express();

app.use(express.json());

// Import routes
import healthCheckRoutes from "./routes/healthcheck.routes.js";
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import productRoutes from "./routes/products.routes.js"

app.use("/api/v1/healthcheck", healthCheckRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/categories", categoriesRoutes);
app.use("/api/v1/product", productRoutes);

export default app;
