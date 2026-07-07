import type { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { AuthRequest } from "../types/index.js";

export const createContractSchema = z.object({
  mensagem: z.string().max(1000, "Mensagem deve ter no máximo 1000 caracteres").optional(),
});

export async function create(req: AuthRequest, res: Response) {
  try {
    const servicoId = req.params.servicoId as string;
    const { mensagem } = req.body;
    const clienteId = req.user!.userId;

    const servico = await prisma.service.findUnique({ where: { id: servicoId } });
    if (!servico) {
      res.status(404).json({ error: "Serviço não encontrado" });
      return;
    }

    if (servico.prestadorId === clienteId) {
      res.status(403).json({ error: "Você não pode contratar seu próprio serviço" });
      return;
    }

    const existing = await prisma.contract.findFirst({
      where: { servicoId, clienteId, status: { not: "CANCELADO" } },
    });
    if (existing) {
      res.status(409).json({ error: "Você já tem uma solicitação pendente para este serviço" });
      return;
    }

    const contract = await prisma.contract.create({
      data: {
        mensagem,
        servicoId,
        clienteId,
        prestadorId: servico.prestadorId,
      },
      include: {
        servico: { select: { id: true, titulo: true } },
        cliente: { select: { id: true, nome: true } },
      },
    });

    res.status(201).json(contract);
  } catch (error) {
    console.error("Erro ao criar contratação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const userId = req.user!.userId;

    const validStatuses = ["EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: "Status inválido" });
      return;
    }

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) {
      res.status(404).json({ error: "Contratação não encontrada" });
      return;
    }

    if (contract.prestadorId !== userId) {
      res.status(403).json({ error: "Sem permissão" });
      return;
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar contratação:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function listMyContracts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const contracts = await prisma.contract.findMany({
      where: role === "PRESTADOR" ? { prestadorId: userId } : { clienteId: userId },
      include: {
        servico: {
          select: { id: true, titulo: true, preco: true },
        },
        cliente: {
          select: { id: true, nome: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(contracts);
  } catch (error) {
    console.error("Erro ao listar contratações:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}