import { pool } from "../db/index.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { address, payment_method } = req.body;

  // 1. Fetch cart items
  const [cart] = await pool.query("SELECT id FROM carts WHERE user_id = ?", [
    userId,
  ]);
  if (!cart.length) {
    throw new ApiError(400, "Cart not found");
  }

  const cartId = cart[0].id;
  const [items] = await pool.query(
    `SELECT ci.product_id, ci.quantity, p.price
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.cart_id = ?`,
    [cartId],
  );

  if (!items.length) {
    throw new ApiError(400, "Cart is empty");
  }

  // 2. Calculate total
  const totalAmount = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  // 3. Create order
  const [orderResult] = await pool.query(
    `INSERT INTO orders (user_id, total_amount, address, payment_method)
     VALUES (?, ?, ?, ?)`,
    [userId, totalAmount, address, payment_method],
  );

  const orderId = orderResult.insertId;

  // 4. Insert order items and reduce product stock value
  for (let item of items) {
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
       VALUES (?, ?, ?, ?)`,
      [orderId, item.product_id, item.quantity, item.price],
    );

    // reduce stock
    await pool.query(`UPDATE products SET stock = stock - ? WHERE id = ?`, [
      item.quantity,
      item.product_id,
    ]);
  }

  // 5. Clear cart
  await pool.query(`DELETE FROM cart_items WHERE cart_id = ?`, [cartId]);

  res
    .status(201)
    .json(new ApiResponse(201, orderId, "Order placed successfully"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [orders] = await pool.query(
    `SELECT id, total_amount, status, address, payment_method, created_at
     FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
  );

  res.status(200).json(new ApiResponse(200, { count: orders.length, orders }));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // order info
  const [orderRows] = await pool.query(
    `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  if (!orderRows.length) {
    throw new ApiError(404, "Order not found");
  }

  // order items
  const [items] = await pool.query(
    `SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase, p.title
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [id],
  );

  res
    .status(200)
    .json(new ApiResponse(200, { order: { ...orderRows[0], items } }));
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // check order
  const [rows] = await pool.query(
    `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
    [id, userId],
  );
  if (!rows.length) {
    throw new ApiError(404, "Order not found");
  }

  const order = rows[0];
  if (order.status !== "pending") {
    throw new ApiError(400, "Only pending orders can be canceled");
  }

  // cancel order
  await pool.query(`UPDATE orders SET status = 'canceled' WHERE id = ?`, [id]);

  // restore stock
  const [items] = await pool.query(
    `SELECT * FROM order_items WHERE order_id = ?`,
    [id],
  );
  for (let item of items) {
    await pool.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [
      item.quantity,
      item.product_id,
    ]);
  }

  res.status(200).json(new ApiResponse(200, "Order canceled successfully"));
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "delivered", "canceled"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  await pool.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

  res.status(200).json({ success: true, message: "Order status updated" });
});
