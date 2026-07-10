import type { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import type { AuthRequest } from "../types/index.js";

export const createServiceSchema = z.object({
  titulo: z.string().min(3, "Título precisa ter no mínimo 3 caracteres"),
  descricao: z.string().min(10, "Descrição precisa ter no mínimo 10 caracteres"),
  preco: z.number().positive("Preço deve ser positivo"),
  categoria: z.string().min(2, "Categoria é obrigatória"),
});

export const updateServiceSchema = z.object({
  titulo: z.string().min(3, "Título precisa ter no mínimo 3 caracteres").optional(),
  descricao: z.string().min(10, "Descrição precisa ter no mínimo 10 caracteres").optional(),
  preco: z.number().positive("Preço deve ser positivo").optional(),
  categoria: z.string().min(2, "Categoria é obrigatória").optional(),
  disponivel: z.boolean().optional(),
});

export async function create(req: AuthRequest, res: Response) {
  try {
    const { titulo, descricao, preco, categoria } = req.body;
    const prestadorId = req.user!.userId;

    const fotos = req.files
      ? (req.files as Express.Multer.File[]).map((f) => f.filename)
      : [];

    const service = await prisma.service.create({
      data: { titulo, descricao, preco, categoria, fotos, prestadorId },
    });

    res.status(201).json(service);
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function list(req: AuthRequest, res: Response) {
  try {
    const { categoria, minPreco, maxPreco, busca, prestadorId, pagina, limite } = req.query;

    const page = Math.max(1, Number(pagina) || 1);
    const limit = Math.min(50, Math.max(1, Number(limite) || 12));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { disponivel: true };

    if (categoria) where.categoria = categoria;
    if (prestadorId) where.prestadorId = prestadorId;
    if (busca) {
      where.OR = [
        { titulo: { contains: busca, mode: "insensitive" } },
        { descricao: { contains: busca, mode: "insensitive" } },
      ];
    }
    if (minPreco || maxPreco) {
      where.preco = {};
      if (minPreco) (where.preco as Record<string, unknown>).gte = Number(minPreco);
      if (maxPreco) (where.preco as Record<string, unknown>).lte = Number(maxPreco);
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          prestador: {
            select: { id: true, nome: true, avatarUrl: true },
          },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao listar serviços:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function getById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        prestador: {
          select: { id: true, nome: true, avatarUrl: true, descricao: true },
        },
        reviews: {
          include: {
            cliente: {
              select: { id: true, nome: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!service) {
      res.status(404).json({ error: "Serviço não encontrado" });
      return;
    }

    const mediaNotas = service.reviews.length
      ? service.reviews.reduce((acc, r) => acc + r.nota, 0) / service.reviews.length
      : 0;

    res.json({ ...service, mediaNotas });
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function update(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      res.status(404).json({ error: "Serviço não encontrado" });
      return;
    }
    if (service.prestadorId !== userId) {
      res.status(403).json({ error: "Você não é o dono deste serviço" });
      return;
    }

    const { titulo, descricao, preco, categoria, disponivel, fotosParaManter } = req.body;
    const novasFotos = req.files
      ? (req.files as Express.Multer.File[]).map((f) => f.filename)
      : [];

    let fotos: string[] | undefined;
    if (novasFotos.length > 0 || fotosParaManter !== undefined) {
      const mantidas: string[] = fotosParaManter
        ? (Array.isArray(fotosParaManter) ? fotosParaManter : JSON.parse(fotosParaManter))
        : service.fotos;
      fotos = [...mantidas, ...novasFotos];
    }

    const updated = await prisma.service.update({
      where: { id },
      data: { titulo, descricao, preco, categoria, disponivel, ...(fotos !== undefined && { fotos }) },
    });

    res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function remove(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;

    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      res.status(404).json({ error: "Serviço não encontrado" });
      return;
    }
    if (service.prestadorId !== userId) {
      res.status(403).json({ error: "Você não é o dono deste serviço" });
      return;
    }

    await prisma.service.delete({ where: { id } });
    res.json({ message: "Serviço removido com sucesso" });
  } catch (error) {
    console.error("Erro ao remover serviço:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

export async function listMyServices(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;
    const services = await prisma.service.findMany({
      where: { prestadorId: userId },
      include: {
        _count: { select: { reviews: true, contratos: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(services);
  } catch (error) {
    console.error("Erro ao listar meus serviços:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}