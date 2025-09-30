import { Router } from "express";
import {  verifyToken } from "../middleware/auth.middleware.js";
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

router.route("/").get( getProducts);
router.route("/:id").get( getProductById);

router.route("/").post( upload.array("images"), createProduct);
router.route("/:id").put( updateProduct);
router.route("/:id").delete( deleteProduct);
router.route("/:id/images").post( upload.array("images"), uploadImage);
router.route("/:id/images/:imageId").delete( deleteProductImage);

export default router;
