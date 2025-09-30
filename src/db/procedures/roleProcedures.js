import {pool} from "../dbConnection.js"; // adjust to your setup

export const getAllRoles = async () => {
  const [rows] = await pool.query("SELECT * FROM roles");
  return rows;
};

export const createRole = async (role_name, description) => {
  const [result] = await pool.query(
    "INSERT INTO roles (role_name, description) VALUES (?, ?)",
    [role_name, description]
  );
  return { id: result.insertId, role_name, description };
};

export const updateRole = async (id, role_name, description) => {
  await pool.query(
    "UPDATE roles SET role_name = ?, description = ? WHERE id = ?",
    [role_name, description, id]
  );
  return { id, role_name, description };
};

export const deleteRole = async (id) => {
  await pool.query("DELETE FROM roles WHERE id = ?", [id]);
  return { id };
};
