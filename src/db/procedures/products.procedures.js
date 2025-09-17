import { pool } from "../index.js";

export const getAllProducts = async () => {
  const [rows] = await pool.query("CALL getAllProducts()");
  return rows[0];
};
