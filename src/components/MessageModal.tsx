"use client";

import { useEffect } from "react";
import { FarewellMessage, ReactionCount } from "@/lib/types";

export function MessageModal({
  msg,
  counts, // listo por si luego quieres mostrar reacciones dentro del modal
  onClose,
}: {
  msg: FarewellMessage;
  counts: ReactionCount;
  onClose: () => void;
}) {
  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center"
      onMouseDown={onClose}
    >
      {/* Caja */}
      <div
        className="glass glow rounded-3xl w-full max-w-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header fijo */}
        <div className="relative border-b border-white/10 px-6 py-4 md:px-8 bg-black/10">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-10 h-10 rounded-xl
                       border border-white/12 bg-white/8 hover:bg-white/12
                       transition text-white/80 hover:text-white"
            aria-label="Close"
            type="button"
          >
            ✕
          </button>

          <div className="pr-12">
            <h3 className="text-xl md:text-2xl font-semibold">{msg.name}</h3>
            <p className="text-xs text-white/55 mt-1">
              {new Date(msg.created_at).toLocaleString()}
            </p>
          </div>

          {msg.mood && (
            <div className="mt-3 inline-flex px-2.5 py-1 rounded-full text-xs border border-white/12 bg-white/8">
              {msg.mood}
            </div>
          )}
        </div>

        {/* Contenido con scroll */}
        <div className="max-h-[78vh] overflow-y-auto px-6 py-5 md:px-8 md:py-6">
          {msg.message && (
            <p className="text-white/95 whitespace-pre-wrap leading-relaxed break-words">
              {msg.message}
            </p>
          )}

          {msg.photo_url && (
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={msg.photo_url}
                alt="Farewell photo"
                className="w-full max-h-[520px] object-contain"
                loading="lazy"
              />
            </div>
          )}

          {/* counts listo para reacciones dentro del modal */}
        </div>
      </div>
    </div>
  );
}
