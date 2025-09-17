
// validators/productValidator.js
import { body } from "express-validator";

// Product Validator
export const productValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title should not exceed 255 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .isSlug()
    .withMessage("Slug must be URL-friendly"),

  body("description")
    .optional()
    .isString()
    .withMessage("Description must be text"),

  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isDecimal()
    .withMessage("Price must be a decimal value"),

  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a non-negative integer"),

  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required")
    .isLength({ max: 100 })
    .withMessage("SKU should not exceed 100 characters"),

  body("category_id")
    .notEmpty()
    .withMessage("Category ID is required")
    .isInt()
    .withMessage("Category ID must be an integer"),

  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be true or false"),
];
