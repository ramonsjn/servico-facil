import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Service } from "@/types";

interface ServiceCardProps {
  service: Service;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");

export function ServiceCard({ service }: ServiceCardProps) {
  const initial = service.prestador.nome.charAt(0).toUpperCase();

  return (
    <Link href={`/servico/${service.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
        <div className="aspect-video bg-muted flex items-center justify-center">
          {service.fotos.length > 0 ? (
            <img
              src={`${API_BASE}/uploads/${service.fotos[0]}`}
              alt={service.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-sm">Sem foto</div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{service.titulo}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {service.descricao}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0">
              R$ {service.preco.toFixed(2)}
            </Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground flex-1">{service.prestador.nome}</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{service._count.reviews}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
