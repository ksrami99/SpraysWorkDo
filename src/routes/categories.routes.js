import { Router } from "express";
import {
  authorizeRole,
  verifyToken,
  authorizePermission,
} from "../middleware/auth.middleware.js";
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

router
  .route("/")
  .get(
    verifyToken,
    authorizeRole("client", "admin"),
    getAllCategories,
  );

router
  .route("/:id")
  .get(
    verifyToken,
    authorizeRole("client", "category-manager", "admin"),
    getCategory,
  );

router
  .route("/")
  .post(
    verifyToken,
    authorizeRole("category-manager", "admin"),
    createCategoryValidator(),
    validate,
    createCategory,
  );
router
  .route("/:id")
  .patch(
    verifyToken,
    authorizeRole("category-manager", "admin"),
    updateCategoryValidator(),
    validate,
    updateCategory,
  );
router
  .route("/:id")
  .delete(
    verifyToken,
    authorizeRole("admin", "category-manager"),
    deleteCategory,
  );

export default router;
