"use client";

import { FarewellMessage, Reaction, ReactionCount } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { ReactionBar } from "./ReactionBar";
import { MessageModal } from "./MessageModal";
import { motion, AnimatePresence } from "framer-motion";

function isoToNice(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const moodGlow: Record<string, string> = {
  funny: "from-sky-400/20 via-white/5 to-pink-400/15",
  emotional: "from-pink-400/20 via-white/5 to-violet-400/15",
  advice: "from-emerald-400/18 via-white/5 to-sky-400/15",
  memory: "from-amber-400/18 via-white/5 to-pink-400/15",
  short: "from-violet-400/20 via-white/5 to-sky-400/15",
};

function emptyCounts(): ReactionCount {
  return { heart: 0, laugh: 0, tears: 0, star: 0, clap: 0 };
}

export function MessageCard({
  msg,
  reactionCounts,
}: {
  msg: FarewellMessage;
  reactionCounts: ReactionCount;
}) {
  const [open, setOpen] = useState(false);
  const [localCounts, setLocalCounts] = useState<ReactionCount>(
    reactionCounts ?? emptyCounts()
  );

  // sincronizar si llegan updates por realtime
  useEffect(() => {
    setLocalCounts(reactionCounts ?? emptyCounts());
  }, [reactionCounts]);

  const bump = (r: Reaction) => {
    setLocalCounts((prev) => ({ ...prev, [r]: (prev[r] ?? 0) + 1 }));
  };

  const bg = useMemo(() => {
    const key = msg.mood ?? "short";
    return moodGlow[key] ?? moodGlow.short;
  }, [msg.mood]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="glass rounded-3xl p-4 glow relative overflow-hidden cursor-pointer
                   hover:brightness-[1.03] transition"
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen(true);
        }}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${bg}`} />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold">{msg.name}</div>
              <div className="text-xs text-white/55">
                {isoToNice(msg.created_at)}
              </div>
            </div>

            {msg.mood && (
              <div className="px-2 py-1 rounded-full text-xs border border-white/12 bg-white/8">
                {msg.mood}
              </div>
            )}
          </div>

          {msg.photo_url && (
            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={msg.photo_url}
                alt="Farewell photo"
                className="w-full max-h-[320px] object-cover"
                loading="lazy"
              />
            </div>
          )}

          {msg.message && (
            <p className="mt-3 text-white/90 leading-relaxed whitespace-pre-wrap line-clamp-3">
              {msg.message}
            </p>
          )}

          {/* ReactionBar NO debe abrir modal */}
          <div
            className="mt-4"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <ReactionBar
              messageId={msg.id}
              counts={localCounts}
              onLocalBump={bump}
            />
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MessageModal
              msg={msg}
              counts={localCounts}
              onClose={() => setOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
