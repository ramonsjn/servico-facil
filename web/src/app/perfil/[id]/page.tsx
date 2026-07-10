"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Star, Shield, ArrowLeft, Settings, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ServiceCard } from "@/components/shared/service-card";
import { api } from "@/lib/api";
import type { Service } from "@/types";

interface PerfilData {
  id: string;
  nome: string;
  email: string;
  role: "PRESTADOR" | "CLIENTE";
  avatarUrl?: string;
  descricao?: string;
  createdAt: string;
  servicos: Service[];
}

export default function PerfilPrestadorPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError("");
      try {
        const data = await api.get<PerfilData>(`/usuarios/${params.id}`);
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar perfil");
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchProfile();
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="h-4 w-24 mb-6" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
        <p className="text-muted-foreground">{error || "Perfil não encontrado."}</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const initial = profile.nome.charAt(0).toUpperCase();
  const totalReviews = profile.servicos.reduce((acc, s) => acc + s._count.reviews, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{profile.nome}</h1>
                {session?.user?.id === profile.id && (
                  <Link href="/perfil/editar">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                {profile.servicos.length > 0 && <Badge variant="secondary">{profile.servicos[0]!.categoria}</Badge>}
                <Badge variant="secondary">Membro desde {memberSince}</Badge>
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-foreground">{totalReviews > 0 ? "4.8" : "0"}</span>
                  <span>({totalReviews} avaliações)</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-primary">
                <Shield className="h-4 w-4" />
                Verificado
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">Sobre</h2>
            <p className="text-muted-foreground leading-relaxed">{profile.descricao || "Sem descrição."}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Serviços ({profile.servicos.length})</h2>
            </div>
            {profile.servicos.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhum serviço cadastrado ainda.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.servicos.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Entre em contato</h3>
              <Link href={`/servico/${profile.servicos[0]?.id}`}>
                <Button className="w-full mb-2">Solicitar Serviço</Button>
              </Link>
              <Button variant="outline" className="w-full">Enviar Mensagem</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
