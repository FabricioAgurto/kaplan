"use client";

import { useMemo, useState } from "react";
import { LangToggle } from "@/components/LangToggle";
import { MessageModal } from "@/components/MessageModal";
import { Modal } from "@/components/Modal";
import { WriteForm } from "@/components/WriteForm";
import { Wall } from "@/components/Wall";
import { Lang, t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("es");
  const copy = useMemo(() => t(lang), [lang]);

  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const done = () => {
    setOpen(false);
    setToast(copy.thanksTitle);
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div className="relative min-h-screen">
      <div className="grid-bg" />

      {/* blobs */}
      <div className="pointer-events-none absolute -top-20 left-10 h-56 w-56 rounded-full blob bg-sky-400/40" />
      <div className="pointer-events-none absolute top-24 right-10 h-64 w-64 rounded-full blob bg-pink-400/35" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-72 w-72 rounded-full blob bg-violet-400/35" />

      <div className="relative mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="flex items-center justify-between gap-4">
          <div className="glass rounded-2xl px-4 py-2 glow">
            <div className="text-sm text-white/70">{copy.appName}</div>
          </div>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} setLang={setLang} />

          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="glass rounded-3xl p-6 md:p-8 glow relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-sky-400/10" />
            <div className="relative">
              <motion.h1
                className="text-3xl md:text-4xl font-semibold tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
              >
                {lang === "es"
                  ? "Mi última semana en Kaplan 🇨🇦"
                  : "My last week at Kaplan 🇨🇦"}
              </motion.h1>

              <p className="mt-3 text-white/75 leading-relaxed">
                {copy.subtitle}{" "}
                {lang === "es"
                  ? "Esto es como un mural en vivo: deja tu nombre, escribe algo (o sube una foto) y aparecerá al instante."
                  : "This is a live wall: add your name, write something (or upload a photo) and it shows instantly."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <motion.button
                  className="btn btn-primary px-5 py-3 text-base"
                  onClick={() => setOpen(true)}
                  whileTap={{ scale: 0.99 }}
                  type="button"
                >
                  <Sparkles size={18} />
                  {copy.write}
                </motion.button>

                <div className="text-sm text-white/55 flex items-center">
                  {lang === "es"
                    ? "Tip: comparte este link o pon un QR en clase."
                    : "Tip: share this link or put a QR in class."}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="glass rounded-2xl p-3 border border-white/10">
                  <div className="text-xs text-white/55">
                    {lang === "es" ? "Para ti" : "For you"}
                  </div>
                  <div className="font-semibold">
                    {lang === "es" ? "Deja tu recuerdo" : "Leave your message"}
                  </div>
                </div>

                <div className="glass rounded-2xl p-3 border border-white/10">
                  <div className="text-xs text-white/55">
                    {lang === "es" ? "En vivo" : "Live"}
                  </div>
                  <div className="font-semibold">
                    {lang === "es" ? "Mensajes en tiempo real" : "Real-time messages"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-3xl p-4 md:p-5 glow">
            <Wall lang={lang} />
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-4 py-2 glow">
            <div className="text-sm">{toast} ✨</div>
          </div>
        )}

        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title={lang === "es" ? "Deja tu mensaje" : "Leave your message"}
        >
          <WriteForm lang={lang} onDone={done} />
          <div className="mt-3 text-xs text-white/50">
            {lang === "es"
              ? "Tu nombre es obligatorio. El mensaje o la foto son opcionales (pero necesitas al menos uno)."
              : "Name is required. Message or photo is optional (but you need at least one)."}
          </div>
        </Modal>
      </div>
    </div>
  );
}
