import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  addReview,
  getReviewById,
  getReviewsByProduct,
  updateReview,
} from "../controllers/reviews.controller.js";

const router = Router();

router.route("/products/:productId").get(verifyToken, getReviewsByProduct);
router.route("/:id").get(verifyToken, getReviewById);
router.route("/:id").put(verifyToken, updateReview);
router.route("/:productId").post(verifyToken, addReview);

export default router;
