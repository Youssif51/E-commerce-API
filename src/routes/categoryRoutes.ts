import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";
import { checkAdminOrSuperAdmin } from "../middleware/add_to_product";
import authenticateJWT from "../middleware/authMiddleware";
const router = express.Router();

router.post("/", authenticateJWT, checkAdminOrSuperAdmin, createCategory);
router.get("/", checkAdminOrSuperAdmin, getAllCategories);
router.get("/:id", checkAdminOrSuperAdmin, getCategoryById);
router.put("/:id", authenticateJWT, checkAdminOrSuperAdmin, updateCategory);
router.delete("/:id", authenticateJWT, checkAdminOrSuperAdmin, deleteCategory);

export default router;
