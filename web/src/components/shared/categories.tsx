"use client";

import { useRouter } from "next/navigation";
import { Wrench, Zap, PaintBucket, Camera, Laptop, Sparkles, Truck, Scissors } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const categorias: { icon: LucideIcon; label: string; slug: string }[] = [
  { icon: Wrench, label: "Reforma", slug: "reforma" },
  { icon: Zap, label: "Elétrica", slug: "eletrica" },
  { icon: PaintBucket, label: "Pintura", slug: "pintura" },
  { icon: Camera, label: "Fotografia", slug: "fotografia" },
  { icon: Laptop, label: "TI", slug: "ti" },
  { icon: Sparkles, label: "Limpeza", slug: "limpeza" },
  { icon: Truck, label: "Mudança", slug: "mudanca" },
  { icon: Scissors, label: "Beleza", slug: "beleza" },
];

export function Categories() {
  const router = useRouter();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-center mb-8">Categorias</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categorias.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.slug}
                onClick={() => router.push(`/?categoria=${cat.slug}`)}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-all hover:border-primary hover:shadow-md hover:-translate-y-1"
              >
                <Icon className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
