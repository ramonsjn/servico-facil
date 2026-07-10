"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, MessageSquare, Heart, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

const statusColor: Record<string, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  EM_ANDAMENTO: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  CONCLUIDO: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELADO: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  EM_ANDAMENTO: "Em Andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

interface ContratoCompleto {
  id: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
  mensagem?: string;
  createdAt: string;
  servico: { id: string; titulo: string; preco: number };
  cliente: { id: string; nome: string; avatarUrl?: string };
}

export default function ClienteDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contratos, setContratos] = useState<ContratoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/cliente");
      return;
    }
    if (status !== "authenticated") return;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const data = await api.get<ContratoCompleto[]>("/contratos");
        setContratos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [status, router]);

  const contratosAtivos = contratos.filter((c) => c.status !== "CANCELADO" && c.status !== "CONCLUIDO").length;

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meu Painel</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas contratações e pedidos</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contratações</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contratos.length}</div>
            <p className="text-xs text-muted-foreground">{contratosAtivos} ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contratos.filter((c) => c.status === "EM_ANDAMENTO").length}</div>
            <p className="text-xs text-muted-foreground">contratos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contratos.filter((c) => c.status === "CONCLUIDO").length}</div>
            <p className="text-xs text-muted-foreground">serviços realizados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Minhas Contratações</CardTitle>
        </CardHeader>
        <CardContent>
          {contratos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Você ainda não contratou nenhum serviço.</p>
              <p className="text-sm mt-2">Explore os serviços disponíveis e encontre o profissional ideal.</p>
              <Link href="/">
                <Button variant="outline" className="mt-4">Explorar Serviços</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {contratos.map((contrato) => (
                <div key={contrato.id} className="flex items-center gap-4 rounded-lg border p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{contrato.servico.titulo}</p>
                      <Badge className={statusColor[contrato.status]}>{statusLabel[contrato.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Prestador: {contrato.cliente.nome}</p>
                    {contrato.mensagem && <p className="text-sm text-muted-foreground truncate mt-1">"{contrato.mensagem}"</p>}
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium">R$ {contrato.servico.preco.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(contrato.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Link href={`/servico/${contrato.servico.id}`}>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 hover:text-foreground transition-colors" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}