import type { Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthRequest } from "../types/index.js";
import bcrypt from "bcryptjs";

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const { nome, telefone, descricao } = req.body;
    const userId = req.user!.userId;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { nome, telefone, descricao },
      select: {
        id: true,
        nome: true,
        email: true,
        telefone: true,
        descricao: true,
        avatarUrl: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function updatePassword(req: AuthRequest, res: Response) {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const userId = req.user!.userId;

    if (!novaSenha || novaSenha.length < 6) {
      res.status(400).json({ error: "Nova senha deve ter no mínimo 6 caracteres" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    const senhaValida = await bcrypt.compare(senhaAtual, user.senha);
    if (!senhaValida) {
      res.status(401).json({ error: "Senha atual incorreta" });
      return;
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { senha: senhaHash },
    });

    res.json({ message: "Senha atualizada com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        role: true,
        avatarUrl: true,
        descricao: true,
        createdAt: true,
        servicos: {
          where: { disponivel: true },
          select: {
            id: true,
            titulo: true,
            descricao: true,
            preco: true,
            categoria: true,
            fotos: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: "Usuário não encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function deleteAccount(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    await prisma.user.delete({ where: { id: userId } });
    res.clearCookie("token");
    res.json({ message: "Conta excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}