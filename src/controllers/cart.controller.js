import { pool } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  console.log(userId);
  
  let [[cart]] = await pool.query("SELECT * FROM carts WHERE user_id = ?", [
    userId,
  ]);
  if (!cart) {
    const [result] = await pool.query(
      "INSERT INTO carts (user_id) VALUES (?)",
      [userId],
    );
    cart = { id: result.insertId, user_id: userId };
  }

  const [items] = await pool.query(
    `SELECT ci.product_id, p.title, p.price, ci.quantity,
            (p.price * ci.quantity) AS subtotal,
            (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cart.id],
  );

  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.subtotal),
    0,
  );

  res.status(200).json(
    new ApiResponse(200, {
      cartId: cart.id,
      userId,
      items,
      totalAmount,
    }),
  );
});

export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId || !quantity || quantity <= 0) {
    throw new ApiError(400, "Product ID and valid quantity required");
  }

  let [[cart]] = await pool.query("SELECT * FROM carts WHERE user_id = ?", [
    userId,
  ]);
  if (!cart) {
    const [result] = await pool.query(
      "INSERT INTO carts (user_id) VALUES (?)",
      [userId],
    );
    cart = { id: result.insertId, user_id: userId };
  }

  await pool.query(
    `INSERT INTO cart_items (cart_id, product_id, quantity)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
    [cart.id, productId, quantity],
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        cartId: cart.id,
        productId,
      },
      "Item added to cart",
    ),
  );
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || quantity < 0) {
    throw new ApiError(400, "Valid quantity required");
  }

  const [[cart]] = await pool.query("SELECT * FROM carts WHERE user_id = ?", [
    userId,
  ]);
  if (!cart) throw new ApiError(404, "Cart not found");

  if (quantity === 0) {
    await pool.query(
      "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cart.id, productId],
    );
    return res.json({ message: "Item removed from cart", productId });
  }

  await pool.query(
    "UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?",
    [quantity, cart.id, productId],
  );

  res
    .status(200)
    .json(new ApiResponse(200, { productId, quantity }, "Cart item updated"));
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  const [[cart]] = await pool.query("SELECT * FROM carts WHERE user_id = ?", [
    userId,
  ]);
  if (!cart) throw new ApiError(404, "Cart not found");

  await pool.query(
    "DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?",
    [cart.id, productId],
  );
  res
    .status(200)
    .json(new ApiResponse(200, productId, "Item removed from cart"));
});
