"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");

interface PhotoGalleryProps {
  fotos: string[];
  titulo: string;
}

export function PhotoGallery({ fotos, titulo }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (fotos.length === 0) {
    return (
      <div className="aspect-video rounded-xl bg-muted flex items-center justify-center">
        <div className="text-muted-foreground">Nenhuma foto</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="aspect-video rounded-xl bg-muted overflow-hidden w-full block"
        >
          <img
            src={`${API_BASE}/uploads/${fotos[selectedIndex]}`}
            alt={`${titulo} - Foto ${selectedIndex + 1}`}
            className="h-full w-full object-cover transition-opacity hover:opacity-90"
          />
        </button>

        {fotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {fotos.map((foto, index) => (
              <button
                key={foto}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === selectedIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                }`}
              >
                <img
                  src={`${API_BASE}/uploads/${foto}`}
                  alt={`${titulo} - Foto ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <X className="h-8 w-8" />
          </button>

          {fotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
                }}
                className="absolute left-4 text-white/70 hover:text-white"
              >
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 text-white/70 hover:text-white"
              >
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}

          <img
            src={`${API_BASE}/uploads/${fotos[selectedIndex]}`}
            alt={`${titulo} - Foto ${selectedIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {fotos.length > 1 && (
            <div className="absolute bottom-4 text-white/60 text-sm">
              {selectedIndex + 1} / {fotos.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
