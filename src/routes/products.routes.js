import { Router } from "express";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
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

router.route("/").get(verifyToken, getProducts);
router.route("/:id").get(verifyToken, getProductById);

router.route("/").post(isAdmin, upload.array("images"), createProduct);
router.route("/:id").put(isAdmin, updateProduct);
router.route("/:id").delete(isAdmin, deleteProduct);
router.route("/:id/images").post(isAdmin, upload.array("images"), uploadImage);
router.route("/:id/images/:imageId").delete(isAdmin, deleteProductImage);

export default router;
