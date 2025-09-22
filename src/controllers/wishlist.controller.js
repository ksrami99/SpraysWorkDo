import { pool } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [wishlist] = await pool.query(
    `SELECT w.product_id, p.title, p.price, p.stock,
            (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image,
            w.created_at
     FROM wishlists w
     JOIN products p ON w.product_id = p.id
     WHERE w.user_id = ?`,
    [userId],
  );

  res.status(200).json(
    new ApiResponse(200, {
      userId,
      items: wishlist,
    }),
  );
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body || {};

  if (!productId) {
    throw new ApiError(400, "Product ID required");
  }

  const [exist] = await pool.query(
    "SELECT * FROM wishlists WHERE user_id = ? AND product_id = ?",
    [userId, productId],
  );

  if (exist.length > 0) {
    throw new ApiError(400, "Product already in wishlist");
  }

  await pool.query(
    "INSERT INTO wishlists (user_id, product_id) VALUES (?, ?)",
    [userId, productId],
  );

  res
    .status(201)
    .json(new ApiResponse(200, productId, "Product added to wishlist"));
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  await pool.query(
    "DELETE FROM wishlists WHERE user_id = ? AND product_id = ?",
    [userId, productId],
  );

  res
    .status(200)
    .json(new ApiResponse(200, productId, "Product removed from wishlist"));
});
