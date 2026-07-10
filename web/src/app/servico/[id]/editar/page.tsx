"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Save, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const API_BASE = API_URL.replace("/api", "");

const CATEGORIAS = [
  "reforma", "eletrica", "pintura", "fotografia", "ti", "limpeza", "mudanca", "beleza",
];

interface ServicoData {
  id: string;
  titulo: string;
  descricao: string;
  preco: number;
  categoria: string;
  fotos: string[];
  disponivel: boolean;
}

export default function EditarServicoPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [disponivel, setDisponivel] = useState(true);

  const [fotosExistentes, setFotosExistentes] = useState<string[]>([]);
  const [fotosParaRemover, setFotosParaRemover] = useState<Set<string>>(new Set());
  const [novasFotos, setNovasFotos] = useState<File[]>([]);
  const [novasFotosPreview, setNovasFotosPreview] = useState<string[]>([]);

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_URL}/servicos/${params.id}`, { credentials: "include" });
        if (!res.ok) throw new Error("Erro ao carregar serviço");
        const data: ServicoData = await res.json();

        setTitulo(data.titulo);
        setDescricao(data.descricao);
        setPreco(data.preco.toString());
        setCategoria(data.categoria);
        setDisponivel(data.disponivel);
        setFotosExistentes(data.fotos);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar serviço");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchService();
  }, [params.id]);

  function handleNovasFotosSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newFiles = [...novasFotos, ...files].slice(0, 10 - fotosExistentes.length + fotosParaRemover.size);
    setNovasFotos(newFiles);
    setNovasFotosPreview(newFiles.map((f) => URL.createObjectURL(f)));
  }

  function removerNovaFoto(index: number) {
    setNovasFotos(novasFotos.filter((_, i) => i !== index));
    setNovasFotosPreview(novasFotosPreview.filter((_, i) => i !== index));
  }

  function toggleFotoExistente(foto: string) {
    setFotosParaRemover((prev) => {
      const next = new Set(prev);
      if (next.has(foto)) next.delete(foto);
      else next.add(foto);
      return next;
    });
  }

  const fotosQueFicam = fotosExistentes.filter((f) => !fotosParaRemover.has(f));
  const limiteAtingido = fotosQueFicam.length + novasFotos.length >= 10;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoria) {
      toast.error("Selecione uma categoria");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descricao", descricao);
      formData.append("preco", preco);
      formData.append("categoria", categoria);
      formData.append("disponivel", String(disponivel));
      formData.append("fotosParaManter", JSON.stringify(fotosQueFicam));
      novasFotos.forEach((foto) => formData.append("fotos", foto));

      const res = await fetch(`${API_URL}/servicos/${params.id}`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro ao atualizar serviço" }));
        throw new Error(err.error || "Erro ao atualizar serviço");
      }

      toast.success("Serviço atualizado com sucesso!");
      router.push(`/servico/${params.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao atualizar serviço");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="space-y-6">
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
        <p className="text-muted-foreground">{error}</p>
        <Link href="/dashboard/prestador">
          <Button variant="outline" className="mt-4">Voltar</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/servico/${params.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao serviço
      </Link>

      <h1 className="text-3xl font-bold mb-8">Editar Serviço</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Serviço</CardTitle>
          <CardDescription>Atualize as informações do seu serviço</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do serviço</Label>
              <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIAS.map((cat) => (
                  <Badge
                    key={cat}
                    variant={categoria === cat ? "default" : "outline"}
                    className="cursor-pointer text-sm px-4 py-1.5"
                    onClick={() => setCategoria(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input id="preco" type="number" step="0.01" min="0" value={preco} onChange={(e) => setPreco(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Disponível</Label>
                <div className="flex gap-2 pt-1">
                  <Badge
                    variant={disponivel ? "default" : "outline"}
                    className="cursor-pointer px-4 py-1.5"
                    onClick={() => setDisponivel(true)}
                  >
                    Sim
                  </Badge>
                  <Badge
                    variant={!disponivel ? "default" : "outline"}
                    className="cursor-pointer px-4 py-1.5"
                    onClick={() => setDisponivel(false)}
                  >
                    Não
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição detalhada</Label>
              <Textarea id="descricao" rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Fotos (máx 10)</Label>

              {fotosExistentes.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Fotos atuais (clique para remover)</p>
                  <div className="flex flex-wrap gap-3">
                    {fotosExistentes.map((foto) => {
                      const marcada = fotosParaRemover.has(foto);
                      return (
                        <button
                          key={foto}
                          type="button"
                          onClick={() => toggleFotoExistente(foto)}
                          className={`relative h-24 w-24 rounded-lg overflow-hidden border-2 transition-all ${
                            marcada ? "border-destructive opacity-50" : "border-border hover:border-muted-foreground/30"
                          }`}
                        >
                          <img src={`${API_BASE}/uploads/${foto}`} alt="" className="h-full w-full object-cover" />
                          {marcada && (
                            <div className="absolute inset-0 flex items-center justify-center bg-destructive/20">
                              <X className="h-6 w-6 text-destructive" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {novasFotosPreview.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-2">Novas fotos</p>
                  <div className="flex flex-wrap gap-3">
                    {novasFotosPreview.map((preview, index) => (
                      <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border">
                        <img src={preview} alt={`Nova foto ${index + 1}`} className="h-full w-full object-cover" />
                        <button type="button" onClick={() => removerNovaFoto(index)} className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!limiteAtingido && (
                <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="h-6 w-6" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleNovasFotosSelect}
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP. Máx 5MB cada. Máximo 10 fotos no total.</p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 h-11 gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Link href={`/servico/${params.id}`}>
                <Button type="button" variant="outline" className="h-11">Cancelar</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
