import express from "express";
import {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController";
import authenticateJWT from "../middleware/authMiddleware";

const router = express.Router();

router.post("/create", authenticateJWT, createSubcategory);
router.get("/", authenticateJWT, getAllSubcategories);
router.get("/:id", authenticateJWT, getSubcategoryById);
router.put("/:id", authenticateJWT, updateSubcategory);
router.delete("/:id", authenticateJWT, deleteSubcategory);

export default router;
