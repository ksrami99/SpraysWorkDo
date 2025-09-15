import bcrypt from "bcryptjs";

import {
  getUserByEmail,
  getAllUsers,
  userUpdate,
  getUserById,
} from "../db/procedures/userProcedures.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { pool } from "../db/index.js";

export const getUsers = asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  res.status(200).json(new ApiResponse(200, users, "Users fetched Success"));
});

export const getUserDetails = asyncHandler(async (req, res) => {
  const id = req.params.id;

  if (!id) {
    throw new ApiError(400, "No Valid user for this id");
  }

  const user = await getUserById(id);

  res.status(200).json(new ApiResponse(200, user, "Data fetched Successfully"));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body || {};

  const userId = req.params.id;
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  const updatedFields = {};
  if (fullname !== undefined) {
    updatedFields.fullname = fullname;
  } else {
    updatedFields.fullname = null;
  }
  if (email !== undefined) {
    updatedFields.email = email;
  } else {
    updatedFields.email = null;
  }
  if (password !== undefined) {
    updatedFields.password = password;
  } else {
    updatedFields.password = null;
  }

  if (email) {
    const existingEmail = await getUserByEmail(email);
    if (existingEmail.length > 0) {
      throw new ApiError(400, "Email Already Exist");
    }
  }

  if (updatedFields.password != null) {
    updatedFields.password = await bcrypt.hash(updatedFields.password, 10);
  }

  const updatedUser = await userUpdate(userId, updatedFields);

  if (updatedUser.affectedRows === 0) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedFields, "User Updated Successfully"));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id) {
    throw new ApiError(400, "User ID is required");
  }

  const user = await getUserById(id);

  const deleteUser = "DELETE FROM users WHERE id = ?";

  await pool.query(deleteUser, [id]);

  res.status(200).json(new ApiResponse(200, user, "User deleted Success"));
});

