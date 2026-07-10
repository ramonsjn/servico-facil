"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const UPLOADS_URL = API_URL.replace("/api", "");

export default function EditarPerfilPage() {
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAvatar, setLoadingAvatar] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      try {
        const user = await api.get<{ nome: string; telefone?: string; descricao?: string; avatarUrl?: string }>(`/usuarios/${session.user.id}`);
        setNome(user.nome);
        setTelefone(user.telefone || "");
        setDescricao(user.descricao || "");
        if (user.avatarUrl) {
          setAvatarPreview(`${UPLOADS_URL}/uploads/${user.avatarUrl}`);
        }
      } catch {
        toast.error("Erro ao carregar perfil");
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, [session]);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleAvatarUpload() {
    if (!avatarFile) return;
    setLoadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await fetch(`${API_URL}/usuarios/avatar`, {
        method: "PUT",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Erro ao enviar avatar");
      const data = await res.json();
      setAvatarPreview(`${UPLOADS_URL}/uploads/${data.avatarUrl}`);
      setAvatarFile(null);
      toast.success("Avatar atualizado!");
      updateSession();
    } catch {
      toast.error("Erro ao atualizar avatar");
    } finally {
      setLoadingAvatar(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/usuarios/profile", { nome, telefone, descricao });
      toast.success("Perfil atualizado!");
      router.push(`/perfil/${session?.user?.id}`);
      router.refresh();
    } catch {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setLoading(false);
    }
  }

  if (loadingProfile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Link href={`/perfil/${session?.user.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao perfil
      </Link>

      <h1 className="text-3xl font-bold mb-8">Editar Perfil</h1>

      <div className="flex items-center gap-6 mb-8 p-6 rounded-xl border">
        <div className="relative group">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarPreview || ""} />
            <AvatarFallback className="text-lg">{nome?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <Camera className="h-6 w-6 text-white" />
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarSelect} />
          </label>
        </div>
        <div>
          <p className="font-medium">Foto do perfil</p>
          <p className="text-sm text-muted-foreground">JPEG, PNG ou WebP. Máx 5MB.</p>
          {avatarFile && (
            <Button size="sm" variant="outline" className="mt-2 gap-1" onClick={handleAvatarUpload} disabled={loadingAvatar}>
              {loadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              {loadingAvatar ? "Enviando..." : "Salvar foto"}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seus dados de perfil</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input id="telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            {session?.user?.role === "PRESTADOR" && (
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Fale sobre seu trabalho..." rows={4} />
              </div>
            )}
            <Separator />
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}