import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve("uploads"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Formato de imagem inválido. Use JPEG, PNG ou WebP."));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.uploadMaxSize },
});

