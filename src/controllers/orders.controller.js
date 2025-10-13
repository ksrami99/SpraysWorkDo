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

export const getOrders = asyncHandler(async (req, res) => {
  // Fetch orders with joined order items and user role
  const [rows] = await pool.query(
    `SELECT 
        o.id AS order_id,
        o.total_amount,
        o.status,
        o.address,
        o.payment_method,
        o.created_at AS order_created_at,
        o.updated_at AS order_updated_at,
        
        u.id AS user_id,
        u.fullname AS customer_name,
        u.email AS customer_email,
        (
            SELECT GROUP_CONCAT(r.role_name)
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = u.id
            LIMIT 1
        ) AS user_roles, 
        
        oi.id AS order_item_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,
        p.title AS product_title

      FROM orders o
      JOIN users u ON o.user_id = u.id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      ORDER BY o.created_at DESC`,
  );

  // Group order items by order
  const ordersMap = {};
  rows.forEach((row) => {
    if (!ordersMap[row.order_id]) {
      ordersMap[row.order_id] = {
        order_id: row.order_id,
        total_amount: row.total_amount,
        status: row.status,
        address: row.address,
        payment_method: row.payment_method,
        created_at: row.order_created_at,
        updated_at: row.order_updated_at,
        user: {
          id: row.user_id,
          name: row.customer_name,
          email: row.customer_email,
          role: row.user_roles ? row.user_roles.split(",")[0] : "guest",
        },
        items: [],
      };
    }
    ordersMap[row.order_id].items.push({
      order_item_id: row.order_item_id,
      product_id: row.product_id,
      title: row.product_title,
      quantity: row.quantity,
      price_at_purchase: row.price_at_purchase,
    });
  });

  const groupedOrders = Object.values(ordersMap);
  res.status(200).json(
    new ApiResponse(200, {
      count: groupedOrders.length,
      orders: groupedOrders,
    }),
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // order info
  const [orderRows] = await pool.query(
    `SELECT 
        o.id AS order_id,
        o.total_amount,
        o.status,
        o.address,
        o.payment_method,
        o.created_at AS order_created_at,
        o.updated_at AS order_updated_at,
        
        u.id AS user_id,
        u.fullname AS customer_name,
        u.email AS customer_email,
        (
            SELECT GROUP_CONCAT(r.role_name)
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = u.id
            LIMIT 1
        ) AS user_roles
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?`,
    [id],
  );

  if (!orderRows.length) {
    throw new ApiError(404, "Order not found");
  }

  const order = orderRows[0];

  // order items
  const [items] = await pool.query(
    `SELECT oi.id AS order_item_id, oi.product_id, oi.quantity, oi.price_at_purchase, p.title AS product_title
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
    [id],
  );

  res.status(200).json(
    new ApiResponse(200, {
      order: {
        order_id: order.order_id,
        total_amount: order.total_amount,
        status: order.status,
        address: order.address,
        payment_method: order.payment_method,
        created_at: order.order_created_at,
        updated_at: order.order_updated_at,
        user: {
          id: order.user_id,
          name: order.customer_name,
          email: order.customer_email,
          role: order.user_roles ? order.user_roles.split(",")[0] : "guest",
        },
        items,
      },
    }),
  );
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

  // Update status
  await pool.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);

  res
    .status(200)
    .json(new ApiResponse(200, `Order status updated to ${status}`));
});
