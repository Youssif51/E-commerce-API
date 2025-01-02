import { Router } from "express";

import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "../controllers/ProductController";
import { upload } from "../middleware/uploadMuddleware";
import authenticateJWT from "../middleware/authMiddleware";
import { checkAdminOrSuperAdmin } from "../middleware/add_to_product";

const router = Router();

router.post(
  "/create",
  authenticateJWT,
  checkAdminOrSuperAdmin,
  upload.single("image"),
  createProduct
);
router.put(
  "/:id",
  authenticateJWT,
  checkAdminOrSuperAdmin,
  upload.single("image"),
  updateProduct
);
router.delete("/:id", authenticateJWT, checkAdminOrSuperAdmin, deleteProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);

export default router;
