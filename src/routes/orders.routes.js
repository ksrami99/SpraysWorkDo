import { Router } from "express";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { cancelOrder, getMyOrders, getOrderById, getOrders, placeOrder, updateOrderStatus } from "../controllers/orders.controller.js";

const router = Router();

router.route("/").get(verifyToken, getMyOrders);
router.route("/all").get(isAdmin, getOrders);
router.route("/").post(verifyToken, placeOrder);
router.route("/:id").get(verifyToken, getOrderById);
router.route("/:id/cancel").put(verifyToken, cancelOrder);
router.route("/:id/status").put(isAdmin, updateOrderStatus);

export default router;
