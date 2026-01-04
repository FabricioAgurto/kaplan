"use client";

import { getSupabaseClient } from "@/lib/supabaseClient";
import { Reaction, ReactionCount } from "@/lib/types";
import { motion } from "framer-motion";

const reactions: { key: Reaction; label: string }[] = [
  { key: "heart", label: "❤️" },
  { key: "laugh", label: "😂" },
  { key: "tears", label: "🥹" },
  { key: "star", label: "⭐" },
  { key: "clap", label: "👏" },
];

export function ReactionBar({
  messageId,
  counts,
  onLocalBump,
}: {
  messageId: string;
  counts: ReactionCount;
  onLocalBump: (r: Reaction) => void;
}) {
  const addReaction = async (r: Reaction) => {
    // instant UI bump
    onLocalBump(r);

    // store reaction
    await supabase.from("farewell_reactions").insert({
      message_id: messageId,
      reaction: r,
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {reactions.map((r) => (
        <motion.button
          key={r.key}
          className="chip flex items-center gap-2"
          whileTap={{ scale: 0.98 }}
          onClick={() => addReaction(r.key)}
          type="button"
        >
          <span className="text-base">{r.label}</span>
          <span className="text-xs text-white/70">{counts[r.key] ?? 0}</span>
        </motion.button>
      ))}
    </div>
  );
}
