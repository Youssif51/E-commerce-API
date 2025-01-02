import { Request, Response } from "express";
import { PrismaClient, Order } from "@prisma/client";
import { AuthRequest } from "../types/express.d";
import { Item } from "../types/types";
const prisma = new PrismaClient();

export const createOrderFromCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const cartItems = await prisma.cartItem.findMany({
        where: { cart: { userId } },
        include: { product: true },
      });
      console.log(cartItems);
      if (!cartItems || cartItems.length === 0) {
        res.status(400).json({ message: "Cart is empty" });
        return;
      }

      for (const item of cartItems) {
        if (!item.product || item.product.quantityInStock < item.quantity) {
          res.status(400).json({
            message: `Product ${item.productId} is not available in sufficient quantity`,
          });
          return;
        }
      }

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      );

      const order = await prisma.order.create({
        data: {
          userId,
          totalAmount,
          status: "Pending",
          paymentStatus: "Pending",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      for (const item of cartItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { decrement: item.quantity } },
        });
      }
      return order;
    });
    res.status(201).json({ message: "Order created successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrderById = async (
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

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id, 10) },
      include: { items: true },
    });

    if (!order || order.userId !== userId) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json({ order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// PATCH /orders/:id - لتحديث حالة الطلب
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });

    res.status(200).json({ message: "Order status updated", updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE /orders/:id - لإلغاء الطلب
export const cancelOrder = async (
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

    const canceledOrder = await prisma.order.update({
      where: { id: parseInt(id, 10) },
      data: { status: "Canceled" },
    });

    res.status(200).json({ message: "Order canceled", canceledOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
