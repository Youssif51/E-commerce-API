import { AuthRequest } from "../types/express.d";
import { PrismaClient } from "@prisma/client";
import { Response } from "express";

const prisma = new PrismaClient();

export const setAdmin = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // التحقق من وجود id وصلاحيته
    if (!id || isNaN(Number(id))) {
      res.status(400).json({ message: "Invalid or missing ID parameter" });
    }

    const userId = parseInt(id);

    // التحقق من وجود المستخدم
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // التحقق من أن المستخدم ليس بالفعل مشرفًا
    if (user?.isAdmin === "ADMIN") {
      res.status(400).json({ message: "User is already an admin" });
      return;
    }

    // تحديث المستخدم إلى مشرف
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: "ADMIN" },
    });

    // الاستجابة بالنجاح
    res.status(200).json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Error updating user to admin:", error);

    // الاستجابة بخطأ داخلي
    res.status(500).json({
      message: "An error occurred while updating the user to admin",
    });
  }
};
