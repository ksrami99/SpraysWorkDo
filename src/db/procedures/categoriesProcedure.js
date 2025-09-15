import { pool } from "../index.js";

export const getCategoriesById = async (id) => {
  const [rows] = await pool.query("CALL getCategoriesById(?)", [id]);
  return rows[0];
};

export const getCategories = async () => {
  const [rows] = await pool.query("CALL getAllCategories()");
  return rows[0];
};
