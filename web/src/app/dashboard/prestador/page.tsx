"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, MessageSquare, Star, Plus, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const UPLOADS_URL = API_URL.replace("/api", "");

interface ServicoCompleto {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: string;
  fotos: string[];
  disponivel: boolean;
  createdAt: string;
  _count: { reviews: number; contratos: number };
}

interface ContratoCompleto {
  id: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO" | "CANCELADO";
  mensagem?: string;
  createdAt: string;
  servico: { id: string; titulo: string; preco: number };
  cliente: { id: string; nome: string; avatarUrl?: string };
}

export default function PrestadorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [servicos, setServicos] = useState<ServicoCompleto[]>([]);
  const [contratos, setContratos] = useState<ContratoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/prestador");
      return;
    }
    if (status !== "authenticated") return;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [servicosData, contratosData] = await Promise.all([
          api.get<ServicoCompleto[]>("/servicos/meus"),
          api.get<ContratoCompleto[]>("/contratos"),
        ]);
        setServicos(servicosData);
        setContratos(contratosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [status, router]);

  const servicosAtivos = servicos.filter((s) => s.disponivel).length;
  const solicitacoesPendentes = contratos.filter((c) => c.status === "PENDENTE").length;
  const totalAvaliacoes = servicos.reduce((acc, s) => acc + s._count.reviews, 0);

  if (status === "loading" || loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-64 mb-8" />
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel do Prestador</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus serviços e solicitações</p>
        </div>
        <Link href="/servico/novo">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Serviço
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{servicosAtivos}</div>
            <p className="text-xs text-muted-foreground">{servicos.length} no total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Solicitações Pendentes</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{solicitacoesPendentes}</div>
            <p className="text-xs text-muted-foreground">{contratos.length} contratações</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avaliações</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAvaliacoes}</div>
            <p className="text-xs text-muted-foreground">em {servicos.length} serviços</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {servicos.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Você ainda não cadastrou nenhum serviço.</p>
              <Link href="/servico/novo">
                <Button variant="outline" className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeiro serviço
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {servicos.map((servico) => (
                <Link key={servico.id} href={`/servico/${servico.id}`}>
                  <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <div className="h-14 w-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                      {servico.fotos[0] ? (
                        <img src={`${UPLOADS_URL}/uploads/${servico.fotos[0]}`} alt={servico.titulo} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">Foto</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{servico.titulo}</p>
                        {!servico.disponivel && <Badge variant="secondary">Indisponível</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{servico.categoria}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">R$ {servico.preco.toFixed(2)}</p>
                      <p className="text-muted-foreground">{servico._count.contratos} contratos</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}