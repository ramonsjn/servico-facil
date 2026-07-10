"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const CATEGORIAS = [
  "reforma", "eletrica", "pintura", "fotografia", "ti", "limpeza", "mudanca", "beleza",
];

export default function NovoServicoPage() {
  const router = useRouter();
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  function handleFotosSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newFiles = [...fotos, ...files].slice(0, 10);
    setFotos(newFiles);
    setFotosPreview(newFiles.map((f) => URL.createObjectURL(f)));
  }

  function removeFoto(index: number) {
    setFotos(fotos.filter((_, i) => i !== index));
    setFotosPreview(fotosPreview.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoria) {
      toast.error("Selecione uma categoria");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("titulo", titulo);
      formData.append("descricao", descricao);
      formData.append("preco", preco);
      formData.append("categoria", categoria);
      fotos.forEach((foto) => formData.append("fotos", foto));

      const res = await fetch(`${API_URL}/servicos`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro ao criar serviço" }));
        throw new Error(err.error || err.details?.[0]?.mensagem || "Erro ao criar serviço");
      }

      toast.success("Serviço criado com sucesso!");
      router.push("/dashboard/prestador");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar serviço");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href="/dashboard/prestador" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao painel
      </Link>

      <h1 className="text-3xl font-bold mb-8">Novo Serviço</h1>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Serviço</CardTitle>
          <CardDescription>Preencha as informações do serviço que você oferece</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título do serviço</Label>
              <Input id="titulo" placeholder="Ex: Reforma de banheiro completo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
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

            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input id="preco" type="number" step="0.01" min="0" placeholder="150.00" value={preco} onChange={(e) => setPreco(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição detalhada</Label>
              <Textarea id="descricao" placeholder="Descreva o serviço, materiais inclusos, prazo estimado..." rows={5} value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Fotos (máx 10)</Label>
              <div className="flex flex-wrap gap-3">
                {fotosPreview.map((preview, index) => (
                  <div key={index} className="relative h-24 w-24 rounded-lg overflow-hidden border">
                    <img src={preview} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
                    <button type="button" onClick={() => removeFoto(index)} className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {fotos.length < 10 && (
                  <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="h-6 w-6" />
                  <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleFotosSelect} />
                </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">JPEG, PNG ou WebP. Máx 5MB cada.</p>
            </div>

            <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? "Criando..." : "Criar Serviço"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}