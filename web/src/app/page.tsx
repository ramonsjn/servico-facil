"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Hero } from "@/components/shared/hero";
import { Categories } from "@/components/shared/categories";
import { ServiceGrid } from "@/components/shared/service-grid";

function HomeContent() {
  const searchParams = useSearchParams();
  const busca = searchParams.get("busca") || "";
  const categoria = searchParams.get("categoria") || "";

  return (
    <div className="flex flex-col">
      <Hero />
      <Categories />
      <ServiceGrid busca={busca} categoria={categoria} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex flex-col"><div className="h-[500px]" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
