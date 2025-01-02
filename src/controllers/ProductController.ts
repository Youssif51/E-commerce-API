import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    name,
    description,
    price,
    stock,
    imageUrl,
    categoryId,
    subcategoryId,
  } = req.body;

  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });

    if (!category) {
      res.status(400).json({ message: "Invalid category ID" });
      return;
    }

    const subcategory = await prisma.subcategory.findUnique({
      where: { id: parseInt(subcategoryId) },
    });

    if (!subcategory || subcategory.categoryId !== parseInt(categoryId)) {
      res
        .status(400)
        .json({ message: "Invalid subcategory for the given category" });
      return;
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        quantityInStock: parseInt(stock),
        imageUrl: req.file?.path || imageUrl,
        categoryId: parseInt(categoryId),
        subcategoryId: parseInt(subcategoryId),
      },
    });

    res.status(201).json({ message: "Product created", product: newProduct });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const { name, description, price, stock, imageUrl, categoryId } = req.body;

  try {
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        quantityInStock: parseInt(stock),
        imageUrl,
        categoryId: parseInt(categoryId),
      },
    });

    res.json({ message: "Product updated", product: updatedProduct });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error updating product", error: error.message });
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Product deleted" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error deleting product", error: error.message });
  }
};

export const getAllProducts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true }, // Include category details
    });
    res.json({ products });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: error.message });
  }
};

export const getProductById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { category: true },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    res.json({ product });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error fetching product", error: error.message });
  }
};
