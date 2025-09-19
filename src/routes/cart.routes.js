import { Router } from "express";
import { addToCart, getCart, removeFromCart, updateCartItem } from "../controllers/cart.controller.js";

const router = Router();

router.route("/").get(getCart);
router.route("/").post(addToCart);
router.route("/:productId").patch(updateCartItem);
router.route("/:productId").delete(removeFromCart);

export default router;
