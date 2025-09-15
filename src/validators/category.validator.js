import { body } from "express-validator";

export const createCategoryValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("slug").trim().notEmpty().withMessage("Slug is required"),
  ];
};

export const updateCategoryValidator = () => {
  return [
    body("name").trim().optional(), 
    body("slug").trim().optional()
  ];
};
