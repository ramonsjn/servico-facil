import type { Request } from "express";

export interface AuthPayload {
  userId: string;
  role: "PRESTADOR" | "CLIENTE";
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

