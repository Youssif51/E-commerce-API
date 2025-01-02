import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// إنشاء تصنيف رئيسي
export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, description } = req.body;

  try {
    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
      },
    });

    res
      .status(201)
      .json({ message: "Category created", category: newCategory });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating category", error: error.message });
  }
};

// جلب كل التصنيفات الرئيسية
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: { subcategories: true }, // تضمين التصنيفات الفرعية
    });

    res.json({ categories });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

// جلب تصنيف رئيسي معين
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { subcategories: true },
    });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json({ category });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching category", error: error.message });
  }
};

// تحديث تصنيف رئيسي
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
      },
    });

    res.json({ message: "Category updated", category: updatedCategory });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating category", error: error.message });
  }
};

// حذف تصنيف رئيسي
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.category.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Category deleted" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: error.message });
  }
};
