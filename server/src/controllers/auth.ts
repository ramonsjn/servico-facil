import type { Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import type { AuthRequest } from "../types/index.js";

export const registerSchema = z.object({
  nome: z.string().min(2, "Nome precisa ter no mínimo 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z.string().optional(),
  senha: z.string().min(6, "Senha precisa ter no mínimo 6 caracteres"),
  role: z.enum(["PRESTADOR", "CLIENTE"]).default("CLIENTE"),
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

function parseExpiresIn(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const num = parseInt(match[1]!, 10);
  switch (match[2]) {
    case "s": return num;
    case "m": return num * 60;
    case "h": return num * 3600;
    case "d": return num * 86400;
    default: return 900;
  }
}

function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, env.jwtSecret, {
    expiresIn: parseExpiresIn(env.jwtExpiresIn),
  });
  const refreshToken = jwt.sign({ userId, role }, env.jwtRefreshSecret, {
    expiresIn: parseExpiresIn(env.jwtRefreshExpiresIn),
  });
  return { accessToken, refreshToken };
}

export async function register(req: AuthRequest, res: Response) {
  try {
    const { nome, email, telefone, senha, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: "Email já cadastrado" });
      return;
    }

    const senhaHash = await bcrypt.hash(senha, 12);
    const user = await prisma.user.create({
      data: { nome, email, telefone, senha: senhaHash, role },
      select: { id: true, nome: true, email: true, role: true, createdAt: true },
    });

    const tokens = generateTokens(user.id, user.role);

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      maxAge: parseExpiresIn(env.jwtExpiresIn) * 1000,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: parseExpiresIn(env.jwtRefreshExpiresIn) * 1000,
    });

    res.status(201).json({ user, accessToken: tokens.accessToken });
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const { email, senha } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Email ou senha inválidos" });
      return;
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      res.status(401).json({ error: "Email ou senha inválidos" });
      return;
    }

    const tokens = generateTokens(user.id, user.role);

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      maxAge: parseExpiresIn(env.jwtExpiresIn) * 1000,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: parseExpiresIn(env.jwtRefreshExpiresIn) * 1000,
    });

    res.json({
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function refresh(req: AuthRequest, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: "Refresh token não fornecido" });
      return;
    }

    const decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as { userId: string; role: string };
    const tokens = generateTokens(decoded.userId, decoded.role);

    res.cookie("token", tokens.accessToken, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      maxAge: parseExpiresIn(env.jwtExpiresIn) * 1000,
    });
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: env.nodeEnv === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: parseExpiresIn(env.jwtRefreshExpiresIn) * 1000,
    });

    res.json({ accessToken: tokens.accessToken });
  } catch {
    res.status(401).json({ error: "Refresh token inválido ou expirado" });
  }
}

export async function logout(_req: AuthRequest, res: Response) {
  res.clearCookie("token");
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ message: "Logout realizado com sucesso" });
}

export async function me(req: AuthRequest, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        role: true,
        avatarUrl: true,
        descricao: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}