import { Router } from "express";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlist.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").get(verifyToken, getWishlist);
router.route("/").post(verifyToken, addToWishlist);
router.route("/:productId").delete(verifyToken, removeFromWishlist);

export default router;