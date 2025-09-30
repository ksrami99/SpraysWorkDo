import { Router } from "express";
import {  verifyToken } from "../middleware/auth.middleware.js";
import { cancelOrder, getMyOrders, getOrderById, getOrders, placeOrder, updateOrderStatus } from "../controllers/orders.controller.js";

const router = Router();

router.route("/").get( getMyOrders);
router.route("/all").get( getOrders);
router.route("/").post( placeOrder);
router.route("/:id").get( getOrderById);
router.route("/:id/cancel").put( cancelOrder);
router.route("/:id/status").put( updateOrderStatus);

export default router;
