import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"

import {
  getUserByEmail,
  getUserById,
  getUserPassword,
} from "../db/procedures/userProcedures.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { pool } from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password, fullname } = req.body;

  const existingEmail = await getUserByEmail(email);

  if (existingEmail.length > 0) {
    throw new ApiError(400, "email already used");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
    [fullname, email, hashedPassword],
  );

  console.log(result);

  const newUser = await getUserById(result.insertId);
  console.log(newUser);

  if (!newUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  res
    .status(200)
    .json(new ApiResponse(201, newUser[0], "User Created Successfully"));
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await getUserByEmail(email);

  if (existingUser.length == 0) {
    throw new ApiError(400, "User does not exists");
  }

  const id = existingUser[0].id;
  const role = existingUser[0].role;

  const userPassword = await getUserPassword(id);

  const isPasswordCorrect = await bcrypt.compare(
    password,
    userPassword[0].password,
  );

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Email or password");
  }

  let token = jwt.sign({ id, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
  token = "Bearer " + token;

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { existingUser, token },
        "User Created Successfully",
      ),
    );
});

export const getProfile  = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res.status(200).json(new ApiResponse(200, user, "User fetched Success"));
});