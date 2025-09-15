import { Router } from "express";
import {
  deleteUser,
  getUserDetails,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import {
  userUpdateValidator,
} from "../validators/user.validator.js";

const router = Router();

router.route("/users").get(isAdmin, getUsers);
router.route("/users/:id").get(isAdmin, getUserDetails);
router
  .route("/users/:id")
  .patch(isAdmin, userUpdateValidator(), validate, updateUser);
router
  .route("/users/:id")
  .delete(isAdmin, deleteUser);

export default router;
