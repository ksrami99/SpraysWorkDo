import { Router } from "express";
import { userLoginValidator, userRegistrationValidator } from "../validators/user.validator.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  getProfile,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
const router = Router();

router
  .route("/register")
  .post(userRegistrationValidator(), validate, registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router
  .route("/me")
  .get(verifyToken, getProfile);

export default router;
