import { Router } from "express";
import { isAdmin } from "../middleware/auth.middleware.js";
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

router.route("/").get(isAdmin, getAllCategories);
router.route("/:id").get(isAdmin, getCategory);
router
  .route("/")
  .post(isAdmin, createCategoryValidator(), validate, createCategory);
router
  .route("/:id")
  .patch(isAdmin, updateCategoryValidator(), validate, updateCategory);
router.route("/:id").delete(isAdmin, deleteCategory);

export default router;
