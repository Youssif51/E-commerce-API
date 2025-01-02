import {
  createOrderFromCart,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
} from "../controllers/orderController";
import { Router } from "express";
import authenticateJWT from "../middleware/authMiddleware";
const router = Router();

router.post("/create", authenticateJWT, createOrderFromCart);
router.get("/:id", authenticateJWT, getOrderById);
router.put("/:id", authenticateJWT, updateOrderStatus);
router.delete("/:id", authenticateJWT, cancelOrder);

export default router;
