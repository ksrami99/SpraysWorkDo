import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import {
  verifyToken,
  authorizePermission,
  authorizeRole,
} from "../middleware/auth.middleware.js";

const router = Router();

router
  .route("/")
  .get(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    getWishlist,
  );
router
  .route("/")
  .post(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    addToWishlist,
  );
router
  .route("/:productId")
  .delete(
    verifyToken,
    authorizeRole("client"),
    authorizePermission("client"),
    removeFromWishlist,
  );

export default router;
