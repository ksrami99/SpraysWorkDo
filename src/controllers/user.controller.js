import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { pool } from "../db/index.js";
import { getUserByIdWithRoles } from "../db/procedures/userProcedures.js";

/* ===================== Get All Users ===================== */
export const getUsers = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, fullname, email, created_at, updated_at FROM users",
  );

  // fetch roles for each user
  const users = await Promise.all(
    rows.map(async (u) => {
      const user = await getUserByIdWithRoles(u.id);
      return user;
    }),
  );

  res.json(new ApiResponse(200, users));
});

/* ===================== Get Single User ===================== */
export const getUserDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await getUserByIdWithRoles(id);

  if (!user) throw new ApiError(404, "User not found");

  res.json({ success: true, data: user });
});

/* ===================== Update User (profile info only) ===================== */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullname, email } = req.body;

  const [result] = await pool.query(
    "UPDATE users SET fullname = ?, email = ? WHERE id = ?",
    [fullname, email, id],
  );

  if (result.affectedRows === 0) throw new ApiError(404, "User not found");

  const updatedUser = await getUserByIdWithRoles(id);
  res.json({ success: true, data: updatedUser });
});

/* ===================== Delete User ===================== */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);

  if (result.affectedRows === 0) throw new ApiError(404, "User not found");

  res.json({ success: true, message: "User deleted" });
});
