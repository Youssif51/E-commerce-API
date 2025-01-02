import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
const fs = require("fs");
// إعدادات التخزين
const storage: StorageEngine = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    const filePath = path.join(__dirname, "..", "..", "uploads");

    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(filePath, { recursive: true });
    }

    // تحديد الوجهة للتخزين
    cb(null, filePath);
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // تعيين اسم الملف بناءً على الوقت الأصلي واسم الملف
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// تصفية الملفات المقبولة
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // قبول الملف
  } else {
    cb(new Error("Invalid file type. Only JPEG and PNG are allowed.")); // رفض الملف
  }
};

// تصدير الـ middleware
export const upload = multer({ storage, fileFilter });
