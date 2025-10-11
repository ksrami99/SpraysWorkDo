import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { pool } from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      roles: user.roles,
      permissions: user.permissions,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "7d" },
  );
};

const getUserWithRolesAndPermissions = async (userId) => {
  const [userRows] = await pool.query(
    "SELECT id, fullname, email FROM users WHERE id = ?",
    [userId],
  );
  if (!userRows.length) return null;

  // fetch roles
  const [roleRows] = await pool.query(
    `SELECT r.slug 
     FROM roles r
     JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [userId],
  );
  const roles = roleRows.map((r) => r.slug);

  // fetch permissions
  const [permRows] = await pool.query(
    `SELECT p.slug
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = ?`,
    [userId],
  );
  const permissions = permRows.map((p) => p.slug);

  return { ...userRows[0], roles, permissions };
};

/* ====================== Register ====================== */
export const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user exists
  const [exists] = await pool.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (exists.length) {
    throw new ApiError(400, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)",
    [fullname, email, hashedPassword],
  );

  const userId = result.insertId;

  await pool.query(
    "INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
    [userId, 1],
  );

  const user = await getUserWithRolesAndPermissions(userId);
  const token = generateToken(user);

  res.status(201).json(new ApiResponse(201, { token, user }));
});

/* ====================== Login ====================== */
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(400, "Email and password required");

  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  if (!rows.length) throw new ApiError(401, "Invalid credentials");

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const fullUser = await getUserWithRolesAndPermissions(user.id);
  const token = generateToken(fullUser);

  res.json(new ApiResponse(200, { token, user: fullUser }));
});

/* ====================== Profile (Me) ====================== */
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await getUserWithRolesAndPermissions(userId);
  if (!user) throw new ApiError(404, "User not found");

  res.json(new ApiResponse(200, user));
});

/* ====================== ADMIN ====================== */

/* ====================== ADMIN REGISTER ====================== */

export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user exists
  const [exists] = await pool.query("SELECT id FROM admin WHERE email = ?", [
    email,
  ]);
  if (exists.length) {
    throw new ApiError(400, "Email already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [result] = await pool.query(
    "INSERT INTO admin (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
  );

  const userId = result.insertId;

  const token = jwt.sign({ userId, email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, { token, roles: ["admin"], permissions: ["admin"] }),
    );
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    throw new ApiError(400, "Email and password required");

  const [rows] = await pool.query("SELECT * FROM admin WHERE email = ?", [
    email,
  ]);
  if (!rows.length) throw new ApiError(401, "Invalid credentials");

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  const userId = user.id;

  const token = jwt.sign(
    { userId, roles: ["admin"], permissions: ["admin"] },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "7d",
    },
  );

  res.json(
    new ApiResponse(200, {
      token,
      user: user,
      roles: ["admin"],
      permissions: ["admin"],
    }),
  );
});
