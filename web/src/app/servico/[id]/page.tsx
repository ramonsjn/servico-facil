"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star, ArrowLeft, Send, AlertCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { PhotoGallery } from "@/components/shared/photo-gallery";

interface ServicoData {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: string;
  fotos: string[];
  prestador: { id: string; nome: string; avatarUrl?: string; descricao: string };
  reviews: {
    id: string;
    nota: number;
    comentario?: string;
    fotos: string[];
    createdAt: string;
    cliente: { id: string; nome: string; avatarUrl?: string };
  }[];
  mediaNotas: number;
}

export default function ServicoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [data, setData] = useState<ServicoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [solicitarOpen, setSolicitarOpen] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const service = await api.get<ServicoData>(`/servicos/${params.id}`);
        setData(service);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar servico");
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchData();
  }, [params.id]);

  async function handleSolicitar() {
    if (!session) {
      router.push("/login");
      return;
    }
    setEnviando(true);
    try {
      await api.post(`/contratos/servico/${params.id}`, { mensagem });
      setSolicitarOpen(false);
      setMensagem("");
      toast.success("Solicitacao enviada!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao solicitar");
    } finally {
      setEnviando(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Skeleton className="h-4 w-32 mb-6" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
        <p className="text-muted-foreground">{error || "Servico nao encontrado."}</p>
        <Link href="/">
          <Button variant="outline" className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar para resultados
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <PhotoGallery fotos={data.fotos} titulo={data.titulo} />

          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{data.titulo}</h1>
              </div>
              <Badge className="text-lg px-4 py-1.5">R$ {data.preco.toFixed(2)}</Badge>
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground">{data.mediaNotas.toFixed(1)}</span>
                <span>({data.reviews.length} avaliacoes)</span>
              </div>
              <span>&bull;</span>
              <span>{data.categoria}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">Descricao</h2>
            <p className="text-muted-foreground leading-relaxed">{data.descricao}</p>
          </div>

          <Separator />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Avaliacoes</h2>
              <Badge variant="outline">{data.reviews.length} avaliacoes</Badge>
            </div>
            {data.reviews.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Nenhuma avaliacao ainda.</p>
            ) : (
              <div className="space-y-4">
                {data.reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{review.cliente.nome.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.cliente.nome}</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < review.nota ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                              ))}
                            </div>
                          </div>
                          {review.comentario && <p className="text-sm text-muted-foreground mt-1">{review.comentario}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Link href={`/perfil/${data.prestador.id}`} className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{data.prestador.nome.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{data.prestador.nome}</p>
                  <p className="text-sm text-muted-foreground">Prestador</p>
                </div>
              </Link>
              <Separator className="mb-4" />
              <p className="text-sm text-muted-foreground">{data.prestador.descricao}</p>
            </CardContent>
          </Card>

          {session?.user?.id === data.prestador.id ? (
            <Link href={`/servico/${data.id}/editar`}>
              <Button variant="outline" className="w-full h-12 text-base gap-2">
                <Pencil className="h-4 w-4" />
                Editar Servico
              </Button>
            </Link>
          ) : (
            <Dialog open={solicitarOpen} onOpenChange={setSolicitarOpen}>
              <DialogTrigger render={<Button className="w-full h-12 text-base gap-2">
                <Send className="h-4 w-4" />
                Solicitar Servico
              </Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Servico</DialogTitle>
                  <DialogDescription>Descreva o que voce precisa para o prestador</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{data.prestador.nome.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{data.prestador.nome}</p>
                      <p className="text-sm text-muted-foreground">{data.titulo}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mensagem">Mensagem</Label>
                    <Textarea id="mensagem" placeholder="Descreva o servico que precisa, endereco, data desejada..." rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={handleSolicitar} disabled={enviando}>
                    {enviando ? "Enviando..." : "Enviar Solicitacao"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
