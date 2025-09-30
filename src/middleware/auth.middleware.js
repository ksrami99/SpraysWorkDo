import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserByIdWithRoles } from "../db/procedures/userProcedures.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  let token = req.header("Authorization") || "";

  if (!token) throw new ApiError(401, "Unauthorized request");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await getUserByIdWithRoles(decoded.id);
  if (!user) throw new ApiError(401, "Unauthorized request");

  req.user = {
    ...user,
    roles: user.roles || [],
  };
  next();
});

export const authorizeRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.roles) {
      throw new ApiError(403, "Forbidden: No roles assigned");
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      throw new ApiError(403, "Forbidden: Insufficient role");
    }
    next();
  });
};

export const authorizePermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      throw new ApiError(403, "Forbidden: No permissions");
    }

    if (!req.user.permissions.includes(permission)) {
      throw new ApiError(403, "Forbidden: Missing permission");
    }

    next();
  });
};
