import { pool } from "../index.js";

export const getAllUsers = async () => {
  const [rows] = await pool.query("CALL getAllUsers()");
  return rows[0];
};

export const getUserById = async (id) => {
  const [rows] = await pool.query("CALL getUserById(?)", [id]);
  return rows[0];
};

export const getUserByEmail = async (email) => {
  const [rows] = await pool.query("CALL getUserByEmail(?)", [email]);
  return rows[0];
};

export const getUserPassword = async (id) => {
  const [rows] = await pool.query("CALL getUserPassword(?)", [id]);
  return rows[0];
};

export const userUpdate = async (id, userData) => {
  const [rows] = await pool.query("CALL updateUser(?, ?, ?, ?)", [
    id,
    userData.email,
    userData.fullname,
    userData.password,
  ]);

  return rows;
};

export const getUserByIdWithRoles = async (userId) => {
  // Fetch basic user info
  const [userRows] = await pool.query(
    "SELECT id, fullname, email, created_at, updated_at FROM users WHERE id = ?",
    [userId],
  );

  if (!userRows.length) return null;
  const user = userRows[0];

  // Fetch roles
  const [roleRows] = await pool.query(
    `SELECT r.id, r.role_name 
     FROM roles r
     JOIN user_roles ur ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [userId],
  );
  const roles = roleRows.map((r) => r.role_name);

  // Fetch permissions (through role → role_permissions → permissions)
  const [permRows] = await pool.query(
    `SELECT DISTINCT p.permission_name
     FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = ?`,
    [userId],
  );
  const permissions = permRows.map((p) => p.permission_name);

  return { ...user, roles, permissions };
};

export const getUserByEmailWithRoles = async (email) => {
  const [userRows] = await pool.query(
    "SELECT id, fullname, email, password, created_at, updated_at FROM users WHERE email = ?",
    [email],
  );

  if (!userRows.length) return null;
  const user = userRows[0];

  const withRoles = await getUserByIdWithRoles(user.id);
  return withRoles
    ? { ...user, roles: withRoles.roles, permissions: withRoles.permissions }
    : null;
};

// get all users with roles/permissions
export const getAllUsersWithRoles = async () => {
  const [rows] = await pool.query(
    "SELECT id, fullname, email, created_at, updated_at FROM users",
  );

  const users = await Promise.all(
    rows.map(async (u) => await getUserByIdWithRoles(u.id)),
  );

  return users;
};

// update user info
export const updateUserById = async (id, fullname, email) => {
  const [result] = await pool.query(
    "UPDATE users SET fullname = ?, email = ? WHERE id = ?",
    [fullname, email, id],
  );
  return result.affectedRows > 0 ? await getUserByIdWithRoles(id) : null;
};

// delete user
export const deleteUserById = async (id) => {
  const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};
