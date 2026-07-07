"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Hero() {
  const [busca, setBusca] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (busca.trim()) {
      router.push(`/?busca=${encodeURIComponent(busca.trim())}`);
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Encontre o{" "}
          <span className="text-primary">profissional ideal</span>
          {" "}para seu serviço
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          De reformas a consultorias, conectamos você aos melhores prestadores perto da sua região.
        </p>

        <form onSubmit={handleSearch} className="mt-8 mx-auto max-w-2xl flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="O que você precisa? Ex: pedreiro, pintor, eletricista..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8">
            Buscar
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-muted-foreground">
          <span>Populares:</span>
          {["Reforma", "Elétrica", "Limpeza", "Fotografia", "TI"].map((cat) => (
            <button
              key={cat}
              onClick={() => router.push(`/?categoria=${cat.toLowerCase()}`)}
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
