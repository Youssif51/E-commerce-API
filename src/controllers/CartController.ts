import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../types/express.d";
const prisma = new PrismaClient();

// إضافة منتج إلى السلة
export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { productId, quantity } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    // Find the product to validate its existence and stock quantity
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    if (product.quantityInStock < quantity) {
      res.status(400).json({
        message: `Enter a quantity around ${product.quantityInStock}`,
      });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ message: "Quantity must be greater than 0" });
      return;
    }

    // Find or create the user's cart
    const cart = await prisma.cart.upsert({
      where: { userId: parseInt(userId) },
      update: {}, // No update needed if the cart exists
      create: { userId: parseInt(userId) }, // Create a new cart if it doesn't exist
    });

    // Now that we have the cart, proceed with adding the item to the cart
    const cartItem = await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id, // Use the cartId from the upserted Cart model
          productId: parseInt(productId),
        },
      },
      update: { quantity: { increment: parseInt(quantity) } }, // Update quantity if item already exists
      create: {
        cartId: cart.id, // Referencing the CartId of the user's cart
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        price: product.price, // Store the product price when adding to the cart
      },
    });

    res.status(200).json({ message: "Product added to cart", cartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// تحديث كمية المنتج في السلة
export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ message: "Quantity must be greater than 0" });
      return;
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: parseInt(id, 10) },
      data: { quantity: parseInt(quantity) },
    });

    res.status(200).json({ message: "Cart item updated", updatedCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// إزالة منتج من السلة
export const removeFromCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;

  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const deletedCartItem = await prisma.cartItem.delete({
      where: { id: parseInt(id, 10) },
    });

    res.status(200).json({ message: "Cart item removed", deletedCartItem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// عرض جميع المنتجات في السلة
export const getCartItems = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;

  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: parseInt(userId) },
      include: { product: true },
    });

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
