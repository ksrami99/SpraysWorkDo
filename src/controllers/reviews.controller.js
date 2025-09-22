import { pool } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;
  const userId = req.user.id; // assuming auth middleware sets req.user

  if (!rating || rating < 1 || rating > 5) {
    return res
      .status(400)
      .json({ success: false, message: "Rating must be between 1 and 5" });
  }

  const [result] = await pool.query(
    `INSERT INTO reviews (user_id, product_id, rating, title, comment)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, productId, rating, title, comment],
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        id: result.insertId,
        user_id: userId,
        product_id: productId,
        rating,
        title,
        comment,
      },
      "Review added successfully",
    ),
  );
});

export const getReviewsByProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.title, r.comment, r.created_at,
            u.fullname AS user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.product_id = ? 
     ORDER BY r.created_at DESC`,
    [productId],
  );

  res
    .status(200)
    .json(new ApiResponse(200, { count: rows.length, reviews: rows }));
});

export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment } = req.body || {};
  const userId = req.user.id;

  // Check ownership
  const [check] = await pool.query("SELECT * FROM reviews WHERE id = ?", [id]);
  if (!check.length) {
    throw new ApiError(404, "Review not found");
  }
  if (check[0].user_id !== userId) {
    throw new ApiError(403, "Not authorized to update this review");
  }

  await pool.query(
    `UPDATE reviews SET rating = ?, title = ?, comment = ? WHERE id = ?`,
    [
      rating || check[0].rating,
      title || check[0].title,
      comment || check[0].comment,
      id,
    ],
  );

  res.status(200).json(new ApiResponse(200, req.body, "Review updated successfully"));
});

export const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const [rows] = await pool.query(
    `SELECT r.id, r.rating, r.title, r.comment, r.created_at,
            u.fullname AS user_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     WHERE r.id = ?`,
    [id],
  );

  if (!rows.length) {
    throw new ApiError(404, "Review not found");
  }

  res.status(200).json(new ApiResponse(200, { review: rows[0] }));
});
