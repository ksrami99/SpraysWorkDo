import { Router } from "express";
import {
  deleteUser,
  getUserDetails,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";
import { validate } from "../middleware/validator.middleware.js";
import {  verifyToken } from "../middleware/auth.middleware.js";
import { userUpdateValidator } from "../validators/user.validator.js";

const router = Router();

router.route("/").get( getUsers);
router.route("/:id").get( getUserDetails);
router
  .route("/:id")
  .patch( userUpdateValidator(), validate, updateUser);
router.route("/:id").delete( deleteUser);

export default router;
