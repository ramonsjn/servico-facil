"use client";

import { useEffect, useState } from "react";
import { ServiceCard } from "./service-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Service } from "@/types";

interface ServiceGridProps {
  busca?: string;
  categoria?: string;
}

export function ServiceGrid({ busca = "", categoria = "" }: ServiceGridProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchServices() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (categoria) params.set("categoria", categoria);
      const query = params.toString();
      const data = await api.get<{ data: Service[] }>(`/servicos${query ? `?${query}` : ""}`);
      setServices(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar serviços");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, [busca, categoria]);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8 h-8 w-48" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive/50" />
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={fetchServices} className="gap-2">
            <RotateCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </section>
    );
  }

  const title = busca
    ? `Resultados para "${busca}"`
    : categoria
    ? `Serviços de ${categoria.charAt(0).toUpperCase() + categoria.slice(1)}`
    : "Serviços em destaque";

  return (
    <section className="py-16 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{title}</h2>
          {services.length > 0 && (
            <span className="text-sm text-muted-foreground">{services.length} serviços</span>
          )}
        </div>
        {services.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum serviço encontrado.</p>
            <p className="text-sm text-muted-foreground mt-2">Tente alterar os filtros ou buscar por outro termo.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
