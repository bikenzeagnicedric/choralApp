"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Song } from "@/types";
import { useAudioStore } from "@/stores/useAudioStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, ChevronLeft, Music } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function RehearsalPage() {
  const supabase = createClient();
  const [songs, setSongs] = useState<Song[]>([]);
  const { currentSong, isPlaying, setCurrentSong, addToQueue, queue } = useAudioStore();

  useEffect(() => {
    async function fetchSongs() {
      const { data } = await supabase
        .from("songs")
        .select("*, category:categories(*)")
        .not("audio_url", "is", null) // Fetch only songs with audio
        .order("title");

      if (data) setSongs(data);
    }
    fetchSongs();
  }, []);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      // Toggle play/pause if same song
      useAudioStore.getState().setIsPlaying(!isPlaying);
    } else {
      // Set new song
      setCurrentSong(song);
      // Auto-populate queue with remaining songs if empty
      if (queue.length === 0) {
        // Add this song and subsequent songs to queue
        const index = songs.findIndex((s) => s.id === song.id);
        const newQueue = songs.slice(index);
        newQueue.forEach((s) => addToQueue(s));
      }
    }
  };

  return (
    <div className="min-h-screen relative pb-24">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mode Répétition</h1>
          <p className="text-white/70">Travaillez vos chants avec le lecteur audio intégré.</p>
        </div>

        <div className="grid gap-4">
          {songs.length === 0 ? (
            <div className="text-center py-12 text-white/60 bg-white/5 rounded-lg border border-white/10">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun chant avec audio disponible.</p>
              <p className="text-sm mt-1">Ajoutez des fichiers audio à vos chants pour les voir ici.</p>
            </div>
          ) : (
            songs.map((song) => (
              <Card key={song.id} className={`bg-white/10 backdrop-blur-md border-white/20 transition-all hover:bg-white/15 cursor-pointer ${currentSong?.id === song.id ? "border-white/50 bg-white/20" : ""}`} onClick={() => handlePlay(song)}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center border ${currentSong?.id === song.id ? "bg-white text-black border-white" : "border-white/30 text-white"}`}>{currentSong?.id === song.id && isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}</div>
                    <div>
                      <h3 className={`font-semibold ${currentSong?.id === song.id ? "text-white" : "text-white/90"}`}>{song.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-white/10 text-white/70 hover:bg-white/20 border-0 text-xs h-5">
                          {song.category?.name || "Divers"}
                        </Badge>
                        {song.key && <span className="text-xs text-white/50 font-mono">{song.key}</span>}
                      </div>
                    </div>
                  </div>
                  {currentSong?.id === song.id && (
                    <div className="hidden sm:block">
                      <div className="flex gap-1 items-end h-4">
                        <span className="w-1 bg-white/80 animate-[bounce_1s_infinite] h-2"></span>
                        <span className="w-1 bg-white/80 animate-[bounce_1.2s_infinite] h-4"></span>
                        <span className="w-1 bg-white/80 animate-[bounce_0.8s_infinite] h-3"></span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
