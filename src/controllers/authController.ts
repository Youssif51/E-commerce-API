// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
//import { authenticate } from "passport";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import passport from "../config/passportConfig";
const prisma = new PrismaClient();

//sinup
export const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash: hashedPassword,
      },
    });
    res
      .status(201)
      .json({ message: "User created successfully ", user: newUser });
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error: (error as Error).message,
    });
  }
};

//login
export const login = (req: Request, res: Response, next: Function) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: unknown, user: any, info: any) => {
      if (err || !user) {
        console.error(err);
        return res.status(400).json({ message: "Authentication failed", info });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );
      res.json({ message: "Logged in successfully", token });
    }
  )(req, res, next);
};
