export type Mood = "funny" | "emotional" | "advice" | "memory" | "short";

export type FarewellMessage = {
  id: string;
  name: string;
  message: string | null;
  mood: Mood | null;
  photo_url: string | null;
  created_at: string;
  is_hidden: boolean;
};

export type Reaction = "heart" | "laugh" | "tears" | "star" | "clap";

export type ReactionCount = Record<Reaction, number>;
