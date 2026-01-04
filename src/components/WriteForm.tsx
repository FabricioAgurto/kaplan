"use client";

import { useMemo, useRef, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Lang, t } from "@/lib/i18n";
import { Mood } from "@/lib/types";
import { MoodChips } from "./MoodChips";
import { motion } from "framer-motion";
import { Upload, Sparkles } from "lucide-react";

const MAX_MB = 4;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function detectLangHint(text: string | null): "es" | "en" | "mix" | null {
  if (!text) return null;
  const hasÑ = /[ñáéíóúü¡¿]/i.test(text);
  const hasEN = /\b(the|and|you|your|thanks|good|best|wish)\b/i.test(text);
  if (hasÑ && hasEN) return "mix";
  if (hasÑ) return "es";
  if (hasEN) return "en";
  return null;
}

export function WriteForm({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: () => void;
}) {
  const copy = t(lang);

  const supabase = getSupabaseClient(); // ✅ aquí

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [mood, setMood] = useState<Mood | null>("memory");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // cooldown anti-spam
  const lastSentRef = useRef<number>(0);

  const canSend = useMemo(() => {
    return name.trim().length > 0 && (message.trim().length > 0 || !!file);
  }, [name, message, file]);

  const onPickFile = (f: File | null) => {
    setError(null);
    setFile(null);
    setPreview(null);
    if (!f) return;

    if (!ALLOWED.includes(f.type)) {
      setError("Only JPG/PNG/WEBP.");
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`Max ${MAX_MB}MB.`);
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const uploadPhotoIfAny = async (): Promise<{
    photo_path: string | null;
    photo_url: string | null;
  }> => {
    if (!file) return { photo_path: null, photo_url: null };

    if (!supabase) {
      throw new Error(
        lang === "es"
          ? "Falta configurar Supabase (env vars)."
          : "Supabase not configured (env vars)."
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}.${safeExt}`;
    const path = `public/${filename}`;

    const { error: upErr } = await supabase.storage
      .from("farewell-photos")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (upErr) throw upErr;

    const { data } = supabase.storage.from("farewell-photos").getPublicUrl(path);
    return { photo_path: path, photo_url: data.publicUrl };
  };

  const submit = async () => {
    setError(null);

    const now = Date.now();
    if (now - lastSentRef.current < 20_000) {
      setError(copy.tooFast);
      return;
    }

    if (!name.trim()) {
      setError(copy.nameGuard);
      return;
    }
    if (!message.trim() && !file) {
      setError(copy.emptyGuard);
      return;
    }

    if (!supabase) {
      setError(
        lang === "es"
          ? "Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
          : "Supabase not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)."
      );
      return;
    }

    setLoading(true);
    try {
      const { photo_path, photo_url } = await uploadPhotoIfAny();

      const langHint = detectLangHint(message.trim() || null);

      const { error: insErr } = await supabase.from("farewell_messages").insert({
        name: name.trim(),
        message: message.trim() || null,
        mood,
        photo_path,
        photo_url,
        language_hint: langHint,
      });

      if (insErr) throw insErr;

      lastSentRef.current = Date.now();
      setName("");
      setMessage("");
      setMood("memory");
      setFile(null);
      setPreview(null);

      onDone();
    } catch (e: any) {
      setError(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ opcional: deshabilita envío si no hay supabase
  const disabledByConfig = !supabase;

  return (
    <div className="space-y-4">
      {error && (
        <div className="glass rounded-2xl p-3 border border-rose-400/20 bg-rose-500/10">
          <div className="text-sm text-rose-100/90">{error}</div>
        </div>
      )}

      {disabledByConfig && (
        <div className="glass rounded-2xl p-3 border border-white/10 bg-white/5">
          <div className="text-sm text-white/80">
            {lang === "es"
              ? "Supabase no está configurado en el hosting."
              : "Supabase is not configured on the hosting."}
          </div>
          <div className="text-xs text-white/60 mt-1">
            {lang === "es"
              ? "Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Environment Variables."
              : "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Environment Variables."}
          </div>
        </div>
      )}

      <div>
        <div className="label mb-2">{copy.name}</div>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={lang === "es" ? "Ej: Ana, Lucas, Maria..." : "e.g., Ana, Lucas, Maria..."}
          maxLength={40}
        />
      </div>

      <div>
        <div className="label mb-2">{copy.mood}</div>
        <MoodChips lang={lang} value={mood} onChange={setMood} />
      </div>

      <div>
        <div className="label mb-2">{copy.message}</div>
        <textarea
          className="input min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            lang === "es"
              ? "Un recuerdo, un consejo, una broma... lo que sea 💫"
              : "A memory, advice, a joke... anything 💫"
          }
          maxLength={600}
        />
        <div className="mt-1 text-xs text-white/45">{message.length}/600</div>
      </div>

      <div>
        <div className="label mb-2">{copy.photo}</div>
        <div className="flex items-center gap-3">
          <label className="btn cursor-pointer">
            <Upload size={16} />
            <span>{lang === "es" ? "Subir foto" : "Upload photo"}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </label>
          {file && (
            <button className="btn" onClick={() => onPickFile(null)} type="button">
              {lang === "es" ? "Quitar" : "Remove"}
            </button>
          )}
          <div className="text-xs text-white/55">JPG/PNG/WEBP • {MAX_MB}MB</div>
        </div>

        {preview && (
          <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" className="w-full max-h-[320px] object-cover" />
          </div>
        )}
      </div>

      <motion.button
        className={`btn btn-primary w-full py-3 text-base ${
          !canSend || loading || disabledByConfig ? "opacity-60" : ""
        }`}
        onClick={submit}
        disabled={!canSend || loading || disabledByConfig}
        whileTap={{ scale: 0.99 }}
        type="button"
        title={disabledByConfig ? "Supabase not configured" : undefined}
      >
        <Sparkles size={16} />
        {loading ? copy.sending : copy.send}
      </motion.button>
    </div>
  );
}
