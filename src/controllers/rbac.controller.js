import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { pool } from "../db/index.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/* ===================== ROLES ===================== */

export const listRoles = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM roles");
  res.status(200).json(new ApiResponse(200, rows));
});

export const addRole = asyncHandler(async (req, res) => {
  const { role_name, description } = req.body;
  if (!role_name) throw new ApiError(400, "Role name required");

  const [result] = await pool.query(
    "INSERT INTO roles (role_name, description) VALUES (?, ?)",
    [role_name, description || ""],
  );

  res
    .status(201)
    .json(
      new ApiResponse(201, { id: result.insertId, role_name, description }),
    );
});

export const editRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role_name, description } = req.body;
  if (!role_name) throw new ApiError(400, "Role name required");

  await pool.query(
    "UPDATE roles SET role_name = ?, description = ? WHERE id = ?",
    [role_name, description || "", id],
  );

  res.status(200).json(new ApiResponse(200, { id, role_name, description }));
});

export const deleteRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM roles WHERE id = ?", [id]);
  res.json(new ApiResponse(200, {}, "Role deleted"));
});

/* ===================== PERMISSIONS ===================== */

export const listPermissions = asyncHandler(async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM permissions");
  res.json(new ApiError(200, rows));
});

export const addPermission = asyncHandler(async (req, res) => {
  const { permission_name, description } = req.body;
  if (!permission_name) throw new ApiError(400, "Permission name required");

  const [result] = await pool.query(
    "INSERT INTO permissions (permission_name, description) VALUES (?, ?)",
    [permission_name, description || ""],
  );

  res
    .status(201)
    .json(
      new ApiError(201, { id: result.insertId, permission_name, description }),
    );
});

export const deletePermission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM permissions WHERE id = ?", [id]);
  res.json(new ApiError(200, {}, "Permission deleted"));
});

/* ===================== ASSIGN ROLES ===================== */

export const assignRoleToUser = asyncHandler(async (req, res) => {
  const { userId, roleId } = req.body;
  if (!userId || !roleId) throw new ApiError(400, "userId and roleId required");

  await pool.query(
    "INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
    [userId, roleId],
  );

  res.json(new ApiResponse(200, {}, "Role assigned to user"));
});

export const removeRoleFromUser = asyncHandler(async (req, res) => {
  const { userId, roleId } = req.body;
  if (!userId || !roleId) throw new ApiError(400, "userId and roleId required");

  await pool.query("DELETE FROM user_roles WHERE user_id = ? AND role_id = ?", [
    userId,
    roleId,
  ]);

  res.json(new ApiResponse(200, {}, "Role removed from user"));
});

// Grant/revoke permission to role
export const grantPermissionToRole = asyncHandler(async (req, res) => {
  const { roleId, permissionId } = req.body;
  if (!roleId || !permissionId)
    throw new ApiError(400, "roleId and permissionId required");

  await pool.query(
    "INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
    [roleId, permissionId],
  );

  res.json(new ApiResponse(200, {}, "Permission assigned to role"));
});

export const revokePermissionFromRole = asyncHandler(async (req, res) => {
  const { roleId, permissionId } = req.body;
  if (!roleId || !permissionId)
    throw new ApiError(400, "roleId and permissionId required");

  await pool.query(
    "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?",
    [roleId, permissionId],
  );

  res.json(new ApiResponse(200, "Permission removed from role"));
});
