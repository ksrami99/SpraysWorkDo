import { Router } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cart.controller.js";
import {
  authorizePermission,
  authorizeRole,
  verifyToken,
} from "../middleware/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    getCart,
  );
router
  .route("/")
  .post(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    addToCart,
  );
router
  .route("/:productId")
  .patch(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    updateCartItem,
  );
router
  .route("/:productId")
  .delete(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    removeFromCart,
  );

export default router;
