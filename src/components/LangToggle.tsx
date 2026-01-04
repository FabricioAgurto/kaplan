"use client";

import { Lang } from "@/lib/i18n";

export function LangToggle({
  lang,
  setLang,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
}) {
  return (
    <div className="flex items-center gap-2 glass rounded-2xl p-1 glow">
      <button
        className={`px-3 py-1.5 rounded-xl text-sm transition ${
          lang === "es" ? "bg-white/14 border border-white/16" : "opacity-70 hover:opacity-100"
        }`}
        onClick={() => setLang("es")}
      >
        ES
      </button>
      <button
        className={`px-3 py-1.5 rounded-xl text-sm transition ${
          lang === "en" ? "bg-white/14 border border-white/16" : "opacity-70 hover:opacity-100"
        }`}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </div>
  );
}
