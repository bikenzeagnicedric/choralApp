export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Category {
  id: string;
  name: string;
  slug: string;
  order_index: number;
  created_at: string;
}

export type LyricsPartType = "chorus" | "verse";

export interface LyricsPart {
  type: LyricsPartType;
  label?: string; // e.g. "1", "2", "Coda"
  content: string;
}

export interface Song {
  id: string;
  title: string;
  lyrics: string | null; // Legacy plain text
  lyrics_structure: LyricsPart[] | null; // Structured content
  audio_url: string | null;
  video_url: string | null;
  key: string | null;
  duration: number | null;
  category_id: string | null;
  created_by: string | null;
  created_at: string;
  // Joins
  category?: Category;
}

export interface Mass {
  id: string;
  name: string;
  date: string;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
}

export interface MassSong {
  id: string;
  mass_id: string;
  song_id: string;
  position: number;
  liturgical_moment: string | null;
  selected_parts: number[] | null; // Array of indices from song.lyrics_structure
  // Joins
  song?: Song;
}
