import { Router } from "express";
import {
  deleteUser,
  getUserDetails,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { userUpdateValidator } from "../validators/user.validator.js";

const router = Router();

router
  .route("/")
  .get(
    verifyToken,
    authorizeRole("admin", "user-manager"),
    authorizePermission("admin", "read"),
    getUsers,
  );
router
  .route("/:id")
  .get(
    verifyToken,
    authorizeRole("admin", "user-manager"),
    authorizePermission("admin", "read"),
    getUserDetails,
  );
router
  .route("/:id")
  .patch(
    verifyToken,
    authorizeRole("admin", "user-manager"),
    authorizePermission("admin", "update"),
    userUpdateValidator(),
    validate,
    updateUser,
  );
router
  .route("/:id")
  .delete(
    verifyToken,
    authorizeRole("admin", "user-manager"),
    authorizePermission("admin", "delete"),
    deleteUser,
  );

export default router;
