import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types/express.d";

const prisma = new PrismaClient();

export const checkAdminOrSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized: No user found" });
    return;
  }

  const userID = req.user.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userID },
    });

    if (!user || (user.isAdmin !== "SUPERADMIN" && user.isAdmin !== "ADMIN")) {
      res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
      return;
    }

    next();
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error checking user role", error: error.message });
  }
};
