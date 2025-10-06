import { Router } from "express";
import {
  verifyToken,
  authorizePermission,
  authorizeRole,
} from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  getProductById,
  getProducts,
  updateProduct,
  uploadImage,
} from "../controllers/Products.controller.js";

const router = Router();

router
  .route("/")
  .get(
    verifyToken,
    authorizeRole("client", "admin", "product-manager"),
    authorizePermission("client", "read"),
    getProducts,
  );
router
  .route("/:id")
  .get(
    verifyToken,
    authorizeRole("client", "admin", "product-manager"),
    authorizePermission("client", "admin", "read"),
    getProductById,
  );

router
  .route("/")
  .post(
    verifyToken,
    authorizeRole("client", "admin", "product-manager"),
    authorizePermission("client", "admin", "create"),
    upload.array("images"),
    createProduct,
  );
router
  .route("/:id")
  .put(
    verifyToken,
    authorizeRole("admin", "product-manager"),
    authorizePermission("admin", "update"),
    updateProduct,
  );
router
  .route("/:id")
  .delete(
    verifyToken,
    authorizeRole("admin", "product-manager"),
    authorizePermission("admin", "delete"),
    deleteProduct,
  );
router
  .route("/:id/images")
  .post(
    verifyToken,
    authorizeRole("admin", "product-manager"),
    authorizePermission("admin", "create"),
    upload.array("images"),
    uploadImage,
  );
router
  .route("/:id/images/:imageId")
  .delete(
    verifyToken,
    authorizeRole("admin", "product-manager"),
    authorizePermission("admin", "delete"),
    deleteProductImage,
  );

export default router;
