import express from "express";
import {
  initiatePayment,
  confirmPayment,
} from "../controllers/paymentController";
import authenticateJWT from "../middleware/authMiddleware";

const router = express.Router();

router.post("/initiate", authenticateJWT, initiatePayment);
router.post("/confirm", authenticateJWT, confirmPayment);

export default router;
