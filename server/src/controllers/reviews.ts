import type { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { AuthRequest } from "../types/index.js";

export const createReviewSchema = z.object({
  nota: z.number().int().min(1, "Nota mínima é 1").max(5, "Nota máxima é 5"),
  comentario: z.string().max(500, "Comentário deve ter no máximo 500 caracteres").optional(),
});

export async function create(req: AuthRequest, res: Response) {
  try {
    const servicoId = req.params.servicoId as string;
    const { nota, comentario } = req.body;
    const clienteId = req.user!.userId;

    const servico = await prisma.service.findUnique({ where: { id: servicoId } });
    if (!servico) {
      res.status(404).json({ error: "Serviço não encontrado" });
      return;
    }

    if (servico.prestadorId === clienteId) {
      res.status(403).json({ error: "Você não pode avaliar seu próprio serviço" });
      return;
    }

    const existing = await prisma.review.findFirst({
      where: { servicoId, clienteId },
    });
    if (existing) {
      res.status(409).json({ error: "Você já avaliou este serviço" });
      return;
    }

    const fotos = req.files
      ? (req.files as Express.Multer.File[]).map((f) => f.filename)
      : [];

    const review = await prisma.review.create({
      data: { nota, comentario, fotos, servicoId, clienteId },
      include: {
        cliente: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function listByService(req: AuthRequest, res: Response) {
  try {
    const servicoId = req.params.servicoId as string;

    const reviews = await prisma.review.findMany({
      where: { servicoId },
      include: {
        cliente: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(reviews);
  } catch (error) {
    console.error("Erro ao listar avaliações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      res.status(404).json({ error: "Avaliação não encontrada" });
      return;
    }
    if (review.clienteId !== userId) {
      res.status(403).json({ error: "Você não pode remover esta avaliação" });
      return;
    }

    await prisma.review.delete({ where: { id } });
    res.json({ message: "Avaliação removida com sucesso" });
  } catch (error) {
    console.error("Erro ao remover avaliação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}