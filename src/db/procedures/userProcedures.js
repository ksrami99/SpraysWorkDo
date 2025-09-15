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
