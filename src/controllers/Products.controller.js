import { pool } from "../db/index.js";
import { getAllProducts } from "../db/procedures/products.procedures.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/coudinary.js";

export const createProduct = asyncHandler(async (req, res) => {
  let { title, slug, description, price, stock, sku, category_id, is_active } =
    req.body || {};

  if (
    (!title || !slug || !price || !stock || !sku || !category_id, !description)
  ) {
    throw new ApiError(400, "Missing required fields");
  }

  const [slugExist] = await pool.query(
    "SELECT id FROM products WHERE slug = ?",
    [slug],
  );

  if (slugExist.length >= 1) {
    throw new ApiError(400, "Slug name must be unique");
  }

  const [productResult] = await pool.query(
    `INSERT INTO products (title, slug, description, price, stock, sku, category_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, slug, description, price, stock, sku, category_id, is_active],
  );

  const productId = productResult.insertId;

  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = await Promise.all(
      req.files.map(async (file, index) => {
        const result = await uploadOnCloudinary(file.path);
        return [productId, result.secure_url, index === 0];
      }),
    );
  }

  await pool.query(
    `INSERT INTO product_images (product_id, url, is_primary)
         VALUES ?`,
    [uploadedImages.map((img) => [...img])],
  );
  res.status(201).json(
    new ApiResponse(
      201,
      {
        product_id: productId,
        details: req.body,
        images: uploadedImages.map((img) => ({
          url: img[1],
          is_primary: img[2],
        })),
      },
      "Product created successfully",
    ),
  );
});

export const getProducts = asyncHandler(async (req, res) => {
  let {
    q,
    category,
    minPrice,
    maxPrice,
    inStock,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT 
      p.id, p.title, p.slug, p.description, p.price, p.stock,
      c.id AS category_id, c.name AS category_name, c.slug AS category_slug,
      pi.id AS image_id, pi.url AS image_url, pi.is_primary
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON p.id = pi.product_id
    WHERE 1=1
  `;

  const params = [];

  if (q) {
    sql += " AND (p.title LIKE ? OR p.description LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += " AND c.slug = ?";
    params.push(category);
  }
  if (minPrice) {
    sql += " AND p.price >= ?";
    params.push(minPrice);
  }
  if (maxPrice) {
    sql += " AND p.price <= ?";
    params.push(maxPrice);
  }
  if (inStock === "true") {
    sql += " AND p.stock > 0";
  }

  if (sort === "price_asc") sql += " ORDER BY p.price ASC";
  else if (sort === "price_desc") sql += " ORDER BY p.price DESC";
  else sql += " ORDER BY p.created_at DESC";

  sql += " LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const [rows] = await pool.query(sql, params);

  const productsMap = new Map();
  rows.forEach((row) => {
    if (!productsMap.has(row.id)) {
      productsMap.set(row.id, {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        price: row.price,
        stock: row.stock,
        primary_image: null,
        images: [],
        category: {
          id: row.category_id,
          name: row.category_name,
          slug: row.category_slug,
        },
      });
    }

    if (row.image_id) {
      productsMap.get(row.id).images.push({
        id: row.image_id,
        url: row.image_url,
        is_primary: !!row.is_primary,
      });
      if (row.is_primary) {
        productsMap.get(row.id).primary_image = row.image_url;
      }
    }
  });

  const [[{ total }]] = await pool.query(
    "SELECT COUNT(*) AS total FROM products",
  );

  res.status(200).json(
    new ApiResponse(200, {
      page,
      limit,
      total,
      products: Array.from(productsMap.values()),
    }),
  );
});

export const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // --- 1) Get product + category
  const [[product]] = await pool.query(
    `
    SELECT 
      p.id, p.title, p.slug, p.description, p.price, p.stock,
      c.id AS category_id, c.name AS category_name, c.slug AS category_slug
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
    `,
    [id],
  );

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // --- 2) Get images
  const [images] = await pool.query(
    `SELECT id, url, is_primary FROM product_images WHERE product_id = ?`,
    [id],
  );

  // --- 3) Get reviews + user info
  const [reviews] = await pool.query(
    `
    SELECT 
      r.id, r.rating, r.title, r.comment, r.created_at,
      u.id AS user_id, u.fullname AS user_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.product_id = ?
    ORDER BY r.created_at DESC
    `,
    [id],
  );

  // --- 4) Construct response
  const response = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price: product.price,
    stock: product.stock,
    images: images.map((img) => ({
      id: img.id,
      url: img.url,
      is_primary: !!img.is_primary,
    })),
    category: {
      id: product.category_id,
      name: product.category_name,
      slug: product.category_slug,
    },
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      created_at: r.created_at,
      user: {
        id: r.user_id,
        fullname: r.user_name,
      },
    })),
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, response, "Product details fetched successfully"),
    );
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    slug,
    description,
    price,
    stock,
    sku,
    category_id,
    is_active,
  } = req.body || {};

  // Check if product exists
  const [[existing]] = await pool.query("SELECT * FROM products WHERE id = ?", [
    id,
  ]);
  if (!existing) {
    throw new ApiError(404, "Product Not found");
  }

  // Update fields (only those provided)
  const updateFields = [];
  const values = [];

  if (title !== undefined) {
    updateFields.push("title = ?");
    values.push(title);
  }
  if (slug !== undefined) {
    updateFields.push("slug = ?");
    values.push(slug);
  }
  if (description !== undefined) {
    updateFields.push("description = ?");
    values.push(description);
  }
  if (price !== undefined) {
    updateFields.push("price = ?");
    values.push(price);
  }
  if (stock !== undefined) {
    updateFields.push("stock = ?");
    values.push(stock);
  }
  if (sku !== undefined) {
    updateFields.push("sku = ?");
    values.push(sku);
  }
  if (category_id !== undefined) {
    updateFields.push("category_id = ?");
    values.push(category_id);
  }
  if (is_active !== undefined) {
    updateFields.push("is_active = ?");
    values.push(is_active);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  values.push(id);

  const sql = `UPDATE products SET ${updateFields.join(", ")} WHERE id = ?`;
  await pool.query(sql, values);

  // Get updated product
  const [[updated]] = await pool.query("SELECT * FROM products WHERE id = ?", [
    id,
  ]);
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { product: updated },
        "Product updated successfully",
      ),
    );
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if product exists
  const [[existing]] = await pool.query("SELECT * FROM products WHERE id = ?", [
    id,
  ]);
  if (!existing) {
    throw new ApiError(404, "Product not Found");
  }

  await pool.query("DELETE FROM product_images WHERE product_id = ?", [id]);

  await pool.query("DELETE FROM products WHERE id = ?", [id]);

  res
    .status(200)
    .json(new ApiError(200, { productId: id }, "Product deleted successfully"));
});

export const uploadImage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let uploadedImages = [];
  if (req.files && req.files.length > 0) {
    uploadedImages = await Promise.all(
      req.files.map(async (file, index) => {
        const result = await uploadOnCloudinary(file.path);
        return [id, result.secure_url, index ? false : true];
      }),
    );
  }

  await pool.query(
    `INSERT INTO product_images (product_id, url, is_primary)
         VALUES ?`,
    [uploadedImages.map((img) => [...img])],
  );

  res.status(201).json(
    new ApiResponse(
      201,
      {
        product_id: id,
        images: uploadedImages.map((img) => ({
          url: img[1],
          is_primary: img[2],
        })),
      },
      "Images Uploaded successfully",
    ),
  );
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const { id, imageId } = req.params;

  // Check product exists
  const [[product]] = await pool.query("SELECT * FROM products WHERE id = ?", [
    id,
  ]);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Check image exists
  const [[image]] = await pool.query(
    "SELECT * FROM product_images WHERE id = ? AND product_id = ?",
    [imageId, id],
  );
  if (!image) {
    return res.status(404).json({ message: "Image not found" });
  }

  // Delete from Cloudinary
  await deleteOnCloudinary(image.url);

  // Delete from DB
  await pool.query("DELETE FROM product_images WHERE id = ?", [imageId]);

  res.json({
    message: "Product image deleted successfully",
    productId: id,
    imageId: imageId,
  });
});
