"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { FarewellMessage, ReactionCount, Reaction } from "@/lib/types";
import { MessageCard } from "./MessageCard";
import { Lang, t } from "@/lib/i18n";

type SortMode = "newest" | "top";

const PAGE_SIZE = 40;

const emptyCounts = (): ReactionCount => ({
  heart: 0,
  laugh: 0,
  tears: 0,
  star: 0,
  clap: 0,
});

function sumCounts(c: ReactionCount) {
  return Object.values(c).reduce((x, y) => x + (y ?? 0), 0);
}

export function Wall({ lang }: { lang: Lang }) {
  const copy = t(lang);

  const supabase = getSupabaseClient(); // ✅ aquí

  const [messages, setMessages] = useState<FarewellMessage[]>([]);
  const [countsMap, setCountsMap] = useState<Record<string, ReactionCount>>({});
  const [sort, setSort] = useState<SortMode>("newest");
  const [q, setQ] = useState("");

  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReactionsForMessageIds = async (ids: string[]) => {
    if (!supabase) return; // ✅
    if (ids.length === 0) return;

    const { data: reacts, error } = await supabase
      .from("farewell_reactions")
      .select("message_id,reaction")
      .in("message_id", ids);

    if (error) return;

    const map: Record<string, ReactionCount> = {};
    (reacts ?? []).forEach((r: any) => {
      const id = r.message_id as string;
      const rxn = r.reaction as Reaction;
      if (!map[id]) map[id] = emptyCounts();
      map[id][rxn] = (map[id][rxn] ?? 0) + 1;
    });

    setCountsMap((prev) => ({ ...prev, ...map }));
  };

  const loadPage = async (nextPage: number, mode: "replace" | "append") => {
    if (!supabase) return; // ✅

    setLoading(true);

    const from = nextPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: msgs, error } = await supabase
      .from("farewell_messages")
      .select("id,name,message,mood,photo_url,created_at,is_hidden")
      .order("created_at", { ascending: false })
      .range(from, to);

    setLoading(false);

    if (error) return;

    const newMsgs = (msgs ?? []) as FarewellMessage[];

    if (mode === "replace") {
      setMessages(newMsgs);
      setPage(nextPage);
    } else {
      setMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        for (const m of newMsgs) {
          if (!seen.has(m.id)) merged.push(m);
        }
        return merged;
      });
      setPage(nextPage);
    }

    setHasMore(newMsgs.length === PAGE_SIZE);

    await fetchReactionsForMessageIds(newMsgs.map((m) => m.id));
  };

  useEffect(() => {
    if (!supabase) return; // ✅ evita crash en build / envs vacías

    // carga inicial
    loadPage(0, "replace");

    const ch1 = supabase
      .channel("farewell_messages_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "farewell_messages" },
        (payload) => {
          const row = payload.new as FarewellMessage;

          setMessages((prev) => {
            if (prev.some((m) => m.id === row.id)) return prev;
            return [row, ...prev];
          });

          setCountsMap((prev) => {
            if (prev[row.id]) return prev;
            return { ...prev, [row.id]: emptyCounts() };
          });
        }
      )
      .subscribe();

    const ch2 = supabase
      .channel("farewell_reactions_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "farewell_reactions" },
        (payload) => {
          const row = payload.new as any;
          const id = row.message_id as string;
          const rxn = row.reaction as Reaction;

          setCountsMap((prev) => {
            const next = { ...prev };
            const base = next[id] ? { ...next[id] } : emptyCounts();
            base[rxn] = (base[rxn] ?? 0) + 1;
            next[id] = base;
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return messages;

    return messages.filter((m) => {
      const a = (m.name ?? "").toLowerCase();
      const b = (m.message ?? "").toLowerCase();
      return a.includes(needle) || b.includes(needle);
    });
  }, [messages, q]);

  const sorted = useMemo(() => {
    if (sort === "newest") return filtered;

    return [...filtered].sort((a, b) => {
      const ca = countsMap[a.id] ?? emptyCounts();
      const cb = countsMap[b.id] ?? emptyCounts();
      const sa = sumCounts(ca);
      const sb = sumCounts(cb);

      if (sb !== sa) return sb - sa;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filtered, sort, countsMap]);

  // ✅ Si falta config, muestra UI bonita en vez de romper
  if (!supabase) {
    return (
      <div className="glass rounded-2xl p-4 border border-white/10">
        <div className="text-sm text-white/80 font-semibold">
          {lang === "es" ? "Falta configurar Supabase" : "Supabase not configured"}
        </div>
        <div className="text-xs text-white/60 mt-1">
          {lang === "es"
            ? "Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en las Environment Variables de tu hosting."
            : "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your hosting environment variables."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <button
            className={`btn ${sort === "newest" ? "btn-primary" : ""}`}
            onClick={() => setSort("newest")}
            type="button"
          >
            {copy.newest}
          </button>
          <button
            className={`btn ${sort === "top" ? "btn-primary" : ""}`}
            onClick={() => setSort("top")}
            type="button"
          >
            {copy.top}
          </button>
        </div>

        <input
          className="input soft-ring md:max-w-sm"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={copy.search}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((m) => (
          <MessageCard
            key={m.id}
            msg={m}
            reactionCounts={countsMap[m.id] ?? emptyCounts()}
          />
        ))}
      </div>

      <div className="flex items-center justify-center pt-2">
        {hasMore && !q.trim() && sort === "newest" && (
          <button
            className={`btn ${loading ? "opacity-60" : ""}`}
            onClick={() => loadPage(page + 1, "append")}
            disabled={loading}
            type="button"
          >
            {loading
              ? lang === "es"
                ? "Cargando..."
                : "Loading..."
              : lang === "es"
                ? "Cargar más"
                : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}
