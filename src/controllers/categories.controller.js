import { pool } from "../db/index.js";
import {
  getCategories,
  getCategoriesById,
} from "../db/procedures/categoriesProcedure.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await getCategories();
  res
    .status(200)
    .json(new ApiResponse(200, categories, "Data Fetched Successfully"));
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body || {};

  const nameQuery = "SELECT * FROM categories WHERE name=? OR slug=?";

  const [isExist] = await pool.query(nameQuery, [name, slug]);

  if (isExist.length >= 1) {
    throw new ApiError(400, "Category Already Exist");
  }

  if (!name || !slug) {
    throw new ApiError(400, "All fields are required");
  }

  const query = "INSERT INTO categories(name, slug) VALUES (?, ?)";

  const [rows] = await pool.query(query, [name, slug]);
  if (rows.affectedRows < 1) {
    throw new ApiError("Something want wrong while creating Category");
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, { name, slug }, "Category Created Successfully"),
    );
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug } = req.body || {};

  const id = req.params.id;

  const nameQuery = "SELECT * FROM categories WHERE name=? OR slug=?";

  const [isExist] = await pool.query(nameQuery, [name, slug]);

  if (isExist.length >= 1) {
    throw new ApiError(400, "Category Already Exist");
  }
  if (name == undefined) name = null;
  if (slug == undefined) slug = null;

  const updateQuery = `UPDATE categories 
    SET     
        name    = IF(? IS NULL, name, ?),
        name    = IF(? IS NULL, slug, ?)
    WHERE id = ?;`;

  const [rows] = await pool.query(updateQuery, [name, name, slug, slug, id]);

  if (rows.affectedRows < 1) {
    throw new ApiError("Something want wrong while creating Category");
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, { name, slug }, "Category updated Successfully"),
    );
});

export const getCategory = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const category = await getCategoriesById(id);

  res
    .status(200)
    .json(new ApiResponse(200, category[0], "Data Fetched Successfully"));
});
