import { Router } from "express";
import {
  authorizePermission,
  verifyToken,
  authorizeRole
} from "../middleware/auth.middleware.js";
import {
  cancelOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/orders.controller.js";

const router = Router();

router
  .route("/")
  .get(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    getMyOrders,
  );
router
  .route("/all")
  .get(
    verifyToken,
    authorizeRole("admin", "order-manager"),
    authorizePermission("admin", "read"),
    getOrders,
  );
router
  .route("/")
  .post(
    verifyToken,
    authorizeRole("client", "admin", "order-manager"),
    authorizePermission("client", "admin", "create"),
    placeOrder,
  );
router
  .route("/:id")
  .get(
    verifyToken,
    authorizeRole("client", "admin", "order-manager"),
    authorizePermission("client", "admin", "read"),
    getOrderById,
  );
router
  .route("/:id/cancel")
  .put(
    verifyToken,
    authorizeRole("client", "admin", "order-manager"),
    authorizePermission("client", "admin", "update"),
    cancelOrder,
  );
router
  .route("/:id/status")
  .put(
    verifyToken,
    authorizeRole("admin", "order-manager"),
    authorizePermission("admin", "update"),
    updateOrderStatus,
  );

export default router;
