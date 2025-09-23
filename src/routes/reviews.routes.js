import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  addReview,
  getReviewById,
  getReviewsByProduct,
  updateReview,
} from "../controllers/reviews.controller.js";

const router = Router();

router.route("/products/:productId").get(getReviewsByProduct);
router.route("/:id").get(getReviewById);
router.route("/:id").put(updateReview);
router.route("/:productId").post(addReview);

export default router;
