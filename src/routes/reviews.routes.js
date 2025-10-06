import { Router } from "express";
import {
  verifyToken,
  authorizePermission,
  authorizeRole,
} from "../middleware/auth.middleware.js";
import {
  addReview,
  getReviewById,
  getReviewsByProduct,
  updateReview,
} from "../controllers/reviews.controller.js";

const router = Router();

router
  .route("/products/:productId")
  .get(
    verifyToken,
    authorizeRole("client", "admin"),
    authorizePermission("client", "admin"),
    getReviewsByProduct,
  );
router
  .route("/:id")
  .get(
    verifyToken,
    authorizeRole("client", "admin"),
    authorizePermission("client", "admin"),
    getReviewById,
  );
router
  .route("/:id")
  .put(
    verifyToken,
    authorizeRole("client", "admin"),
    authorizePermission("client", "admin"),
    updateReview,
  );
router
  .route("/:productId")
  .post(
    verifyToken,
    authorizeRole("client", "admin"),
    authorizePermission("client", "admin"),
    addReview,
  );

export default router;
