import { Router } from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(getWishlist);
router.route("/").post(addToWishlist);
router.route("/:productId").delete(removeFromWishlist);

export default router;
