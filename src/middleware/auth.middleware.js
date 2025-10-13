import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserByIdWithRoles } from "../db/procedures/userProcedures.js";
import { pool } from "../db/index.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  let token = req.header("Authorization") || "";

  if (!token) throw new ApiError(401, "Unauthorized request");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  let user;

  [user] = await pool.query("SELECT * FROM admin WHERE id = ?", [
    decoded.id,
  ]);
  if(user<1) {
    [user] = await pool.query("SELECT * FROM users WHERE id = ?", [
      decoded.id,
    ]);
  }


  if (user) {
    req.admin = true;
  } else {
    user = await getUserByIdWithRoles(decoded.id);
  }
  console.log(user);

  if (user.length < 1) throw new ApiError(401, "Unauthorized request");
  

  req.user = {
    ...user,
    roles: user.roles || [],
  };
  next();
});

export const authorizeRole = (...allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (req.admin) {
      next();
      return;
    }
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
    if (req.admin) {
      next();
      return;
    }
    if (!req.user || !req.user.permissions) {
      throw new ApiError(403, "Forbidden: No permissions");
    }

    if (!req.user.permissions.includes(permission)) {
      throw new ApiError(403, "Forbidden: Missing permission");
    }

    next();
  });
};

export const authorizeAdmin = asyncHandler(async (req, res, next) => {
  let token = req.header("Authorization") || "";

  if (!token) throw new ApiError(401, "Unauthorized request");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const [userRows] = await pool.query("SELECT * FROM admin WHERE email = ?", [
    decoded.email,
  ]);
  console.log(userRows);

  if (userRows <= 0) throw new ApiError(401, "Unauthorized request");

  req.user = userRows;
  next();
});
