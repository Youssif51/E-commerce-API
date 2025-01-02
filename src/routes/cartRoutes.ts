import { Router } from "express";
import authenticateJWT from "../middleware/authMiddleware";
import {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCartItems,
} from "../controllers/CartController";
const router = Router();

router.post("/", authenticateJWT, addToCart);
router.put("/:id", authenticateJWT, updateCartItem);
router.delete("/:id", authenticateJWT, removeFromCart);
router.get("/", authenticateJWT, getCartItems);

export default router;
