import { Router } from "express";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { createProduct, getProductById, getProducts } from "../controllers/Products.controller.js";

const router = Router();

router.route("/").post(isAdmin, upload.array("images"), createProduct);
router.route("/").get(verifyToken, getProducts);
router.route("/:id").get(verifyToken, getProductById);

export default router;
