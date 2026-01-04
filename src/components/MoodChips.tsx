"use client";

import { Lang, moodLabels } from "@/lib/i18n";
import { Mood } from "@/lib/types";

const moods: Mood[] = ["funny", "emotional", "advice", "memory", "short"];

export function MoodChips({
  lang,
  value,
  onChange,
}: {
  lang: Lang;
  value: Mood | null;
  onChange: (m: Mood | null) => void;
}) {
  const labels = moodLabels(lang);
  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((m) => (
        <button
          key={m}
          type="button"
          className={`chip ${value === m ? "chip-active" : ""}`}
          onClick={() => onChange(value === m ? null : m)}
        >
          {labels[m]}
        </button>
      ))}
    </div>
  );
}
