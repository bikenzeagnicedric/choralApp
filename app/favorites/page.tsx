"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Play, ChevronLeft, Music } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useAudioStore } from "@/stores/useAudioStore";
import { useProfile } from "@/hooks/useProfile";
import { FavoriteButton } from "@/components/songs/FavoriteButton";

export default function FavoritesPage() {
  const supabase = createClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useProfile();
  const { currentSong, isPlaying, setCurrentSong } = useAudioStore();

  useEffect(() => {
    async function fetchFavorites() {
      if (!user) return;

      const { data } = await supabase.from("user_favorites").select("song_id, songs:song_id(*, category:categories(*))").eq("user_id", user.id);

      if (data) {
        // Flatten structure
        const favSongs = data.map((item: any) => item.songs) as Song[];
        setSongs(favSongs);
      }
      setLoading(false);
    }
    fetchFavorites();
  }, [user, supabase]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      useAudioStore.getState().setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
    }
  };

  if (!user && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <Heart className="h-16 w-16 mx-auto mb-4 text-white/20" />
          <h1 className="text-2xl font-bold mb-2">Connectez-vous</h1>
          <p className="text-white/60 mb-6">Vous devez être connecté pour voir vos favoris.</p>
          <Link href="/login">
            <Button>Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-24">
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="fill-red-500 text-red-500" />
            Mes Favoris
          </h1>
          <p className="text-white/70">Retrouvez tous vos chants préférés ici.</p>
        </div>

        <div className="grid gap-4">
          {songs.length === 0 && !loading ? (
            <div className="text-center py-12 text-white/60 bg-white/5 rounded-lg border border-white/10">
              <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun favori pour l'instant.</p>
              <p className="text-sm mt-1">Cliquez sur le cœur à côté d'un chant pour l'ajouter.</p>
              <Link href="/songs" className="inline-block mt-4">
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                  Parcourir la bibliothèque
                </Button>
              </Link>
            </div>
          ) : (
            songs.map((song) => (
              <Card key={song.id} className={`bg-white/10 backdrop-blur-md border-white/20 transition-all hover:bg-white/15 cursor-pointer ${currentSong?.id === song.id ? "border-white/50 bg-white/20" : ""}`} onClick={() => handlePlay(song)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${currentSong?.id === song.id ? "bg-white text-black border-white" : "border-white/30 text-white"}`}>{currentSong?.id === song.id && isPlaying ? <Play className="h-4 w-4" /> : <Music className="h-4 w-4" />}</div>
                    <div>
                      <h3 className={`font-semibold ${currentSong?.id === song.id ? "text-white" : "text-white/90"}`}>{song.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-white/10 text-white/70 hover:bg-white/20 border-0 text-xs h-5">
                          {song.category?.name || "Divers"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FavoriteButton songId={song.id} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
