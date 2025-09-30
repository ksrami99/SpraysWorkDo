import { Router } from "express";
import { authorizeRole, verifyToken } from "../middleware/auth.middleware.js";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/categories.controller.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/category.validator.js";
import { validate } from "../middleware/validator.middleware.js";

const router = Router();

router.route("/").get(authorizeRole("admin"), getAllCategories);
router.route("/:id").get(authorizeRole("admin"), getCategory);
router
  .route("/")
  .post(authorizeRole("admin"), createCategoryValidator(), validate, createCategory);
router
  .route("/:id")
  .patch(authorizeRole("admin"), updateCategoryValidator(), validate, updateCategory);
router.route("/:id").delete(authorizeRole("admin"), deleteCategory);

export default router;
