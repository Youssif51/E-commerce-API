import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types/express.d";

const prisma = new PrismaClient();

// إنشاء تصنيف فرعي
export const createSubcategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { name, description, categoryId } = req.body;
  const userID: number = req.user.id;
  try {
    const newSubcategory = await prisma.subcategory.create({
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
        whoCreated: "youssef right now (will update later)",
      },
    });

    res
      .status(201)
      .json({ message: "Subcategory created", subcategory: newSubcategory });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating subcategory", error: error.message });
  }
};

// جلب كل التصنيفات الفرعية
export const getAllSubcategories = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const subcategories = await prisma.subcategory.findMany({
      include: { category: true }, // تضمين التصنيف الرئيسي
    });

    res.json({ subcategories });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching subcategories", error: error.message });
  }
};

// جلب تصنيف فرعي معين
export const getSubcategoryById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!subcategory) {
      res.status(404).json({ message: "Subcategory not found" });
      return;
    }

    res.json({ subcategory });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching subcategory", error: error.message });
  }
};

// تحديث تصنيف فرعي
export const updateSubcategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, description, categoryId } = req.body;

  try {
    const updatedSubcategory = await prisma.subcategory.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        categoryId: parseInt(categoryId),
      },
    });

    res.json({
      message: "Subcategory updated",
      subcategory: updatedSubcategory,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating subcategory", error: error.message });
  }
};

// حذف تصنيف فرعي
export const deleteSubcategory = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.subcategory.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Subcategory deleted" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting subcategory", error: error.message });
  }
};
