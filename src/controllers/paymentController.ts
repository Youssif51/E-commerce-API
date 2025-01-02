import { Request, Response } from "express";
import { AuthRequest } from "../types/express.d";
import { PrismaClient, Order } from "@prisma/client";
import { createOrder, capturePayment } from "../services/paypalService";
import sendEmail from "../services/sendEmail";
const prisma = new PrismaClient();

// إنشاء طلب دفع
export const initiatePayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const user = req.user?.id;

  if (!user) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const order = await prisma.order.findFirst({
      where: { userId: user },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const paypalOrder = await createOrder(order.totalAmount);

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        paymentMethod: "PAYPAL",
        transactionId: paypalOrder.id,
        amount: order.totalAmount,
        status: "PENDING",
      },
    });

    res.status(200).json({ approvalLink: paypalOrder.links[1].href, payment });
  } catch (error) {
    //console.error(error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// تأكيد الدفع وتسجيله في جدول Payment
export const confirmPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  console.log(userId);
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  try {
    const order = await prisma.order.findFirst({
      where: { userId: userId, paymentStatus: "Pending" },
      include: { Payments: true, items: true },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found or already paid" });
      return;
    }
    const payments = order.Payments[0];
    const captureData = await capturePayment(payments?.transactionId);

    if (
      !captureData.purchase_units ||
      captureData.purchase_units.length === 0
    ) {
      res.status(400).json({ message: "Invalid capture data" });
      return;
    }

    if (captureData.status !== "COMPLETED") {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: "Failed" },
      });

      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { quantityInStock: { increment: item.quantity } },
        });
      }

      res.status(400).json({ message: "Payment failed, stock restored" });
      return;
    }

    const payment = await prisma.payment.update({
      where: { id: payments.id },
      data: {
        amount: parseFloat(captureData.purchase_units[0].amount.value),
        status: captureData.status,
        transactionId: captureData.id,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: "Paid" },
    });

    for (const item of order.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product || item.quantity <= product.threshold) {
        const admins = await prisma.user.findMany({
          where: {
            isAdmin: { in: ["USER", "SUPERADMIN"] },
          },
        });
        try {
          const emailPromises = admins.map((admin) =>
            sendEmail({
              to: admin.email,
              subject: "الححححححق المخزن",
              text: `The stock of product ${product?.name} has decreased to ${product?.quantityInStock}. Please take necessary action.`,
            })
          );
          await Promise.all(emailPromises);
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
    }
    res.status(200).json({ message: "Payment successful", payment });
  } catch (error) {
    console.error("Error in confirmPayment:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};
