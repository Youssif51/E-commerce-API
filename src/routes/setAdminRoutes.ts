import express from "express";
import { setAdmin } from "../services/setAdmin";
import authenticateJWT from "../middleware/authMiddleware";
import { checkSuperAdmin } from "../middleware/isAdminMiddleware";
const router = express.Router();

router.patch("/:id", authenticateJWT, checkSuperAdmin, setAdmin);

export default router;
