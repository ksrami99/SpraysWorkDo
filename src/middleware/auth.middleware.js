import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getUserById } from "../db/procedures/userProcedures.js";

export const verifyToken = asyncHandler(async (req, res, next) => {
  let token = req.header("Authorization") || "";

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

  if (!decodeToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const user = await getUserById(decodeToken.id);

  if (!user) {
    throw new ApiError(401, "Unauthorized request");
  }

  req.user = user[0];

  next();
});

export const isAdmin = asyncHandler(async (req, res, next) => {
  let token = req.header("Authorization") || "";

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decodeToken.role || decodeToken.role !== "admin") {
      throw new ApiError(401, "Unauthorized request");
    }

    const user = await getUserById(decodeToken.id);

    if (!user) {
      throw new ApiError(401, "Unauthorized request");
    }

    req.user = user;
  } catch (error) {
    throw new ApiError(401, "Unauthorized request")
  }

  next();
});
