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
import { loginAdmin, registerAdmin } from "../controllers/auth.controller.js";

const router = Router();

router.route("/").get(getUsers);
router.route("/:id").get(getUserDetails);
router.route("/:id").patch(userUpdateValidator(), validate, updateUser);
router.route("/:id").delete(deleteUser);

router.post("/admin/register", registerAdmin);
router.post("/admin/login", loginAdmin);

export default router;
