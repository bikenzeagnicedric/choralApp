"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  songId: string;
  className?: string;
}

export function FavoriteButton({ songId, className }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useProfile();
  const supabase = createClient();

  useEffect(() => {
    async function checkFavorite() {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase.from("user_favorites").select("*").eq("user_id", user.id).eq("song_id", songId).single();

      setIsFavorite(!!data);
      setLoading(false);
    }
    checkFavorite();
  }, [user, songId, supabase]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Optionnel : Rediriger vers login ou afficher toast
      alert("Connectez-vous pour ajouter aux favoris");
      return;
    }

    // Optimistic update
    const previousState = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      if (previousState) {
        // Remove
        await supabase.from("user_favorites").delete().eq("user_id", user.id).eq("song_id", songId);
      } else {
        // Add
        await supabase.from("user_favorites").insert({ user_id: user.id, song_id: songId });
      }
    } catch (err) {
      // Revert on error
      console.error(err);
      setIsFavorite(previousState);
    }
  };

  if (loading) return null; // Or skeleton

  return (
    <Button variant="ghost" size="icon" className={cn("hover:bg-transparent hover:scale-110 transition-all active:scale-95", className)} onClick={toggleFavorite}>
      <Heart className={cn("h-5 w-5 transition-colors", isFavorite ? "fill-red-500 text-red-500" : "text-white/50 hover:text-white")} />
    </Button>
  );
}
