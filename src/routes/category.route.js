import express from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import { checkAdminRole } from "../middlewares/role.middleware.js";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from "../controllers/category.controller.js";

const router = express.Router();
router.use(jwtVerify);

router.route("/create-category").post(checkAdminRole, createCategory);
router.route("/all-categories").get(getAllCategories);
router.route("/:categoryId").get(checkAdminRole, getCategoryById).patch(checkAdminRole, updateCategory).delete(checkAdminRole, deleteCategory);

export {
    router
}