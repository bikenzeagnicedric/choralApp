"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Song, Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Music, Mic, Video } from "lucide-react";
import Link from "next/link";
import { FavoriteButton } from "@/components/songs/FavoriteButton";
import { useProfile } from "@/hooks/useProfile";

interface SongsListProps {
  initialSongs: Song[];
  categories: Category[];
}

export default function SongsList({ initialSongs, categories }: SongsListProps) {
  // Use initialSongs directly
  const [songs, setSongs] = useState<Song[]>(initialSongs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { isAdmin } = useProfile();

  const supabase = createClient();

  // No fetch logic needed anymore!

  const filteredSongs = songs.filter((song) => {
    const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? song.category_id === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
          <Input placeholder="Rechercher un chant..." className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* Add Button */}
        {isAdmin && (
          <Link href="/songs/new">
            <Button className="bg-white text-black hover:bg-white/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Chant
            </Button>
          </Link>
        )}
      </div>

      {/* Categories Filter (Chips) */}
      <div className="flex flex-wrap gap-2 pb-2">
        <Badge variant={selectedCategory === null ? "default" : "outline"} className={`cursor-pointer transition-all ${selectedCategory === null ? "bg-white text-black hover:bg-white/90" : "border-white/30 text-white/80 hover:bg-white/10"}`} onClick={() => setSelectedCategory(null)}>
          Tout
        </Badge>
        {categories.map((cat) => (
          <Badge key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} className={`cursor-pointer transition-all ${selectedCategory === cat.id ? "bg-white text-black hover:bg-white/90" : "border-white/30 text-white/80 hover:bg-white/10"}`} onClick={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}>
            {cat.name}
          </Badge>
        ))}
      </div>

      {/* Grid */}
      {filteredSongs.length === 0 ? (
        <div className="text-center py-12 text-white/80 bg-white/5 rounded-lg border border-white/20 border-dashed">Aucun chant trouvé.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <Link key={song.id} href={`/songs/${song.id}`}>
              <Card className="h-full hover:shadow-xl transition-all cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="mb-2 text-xs bg-white/20 text-white border-white/30">
                      {song.category?.name || "Divers"}
                    </Badge>
                    {song.key && <span className="text-xs text-white/80 font-mono bg-white/20 px-1.5 py-0.5 rounded">{song.key}</span>}
                  </div>
                  <div className="flex justify-between items-start">
                    <CardTitle className="leading-snug text-white group-hover:text-primary transition-colors pr-2">{song.title}</CardTitle>
                    <div onClick={(e) => e.preventDefault()}>
                      <FavoriteButton songId={song.id} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 text-white/60 text-sm mt-2">
                    {song.lyrics || song.lyrics_structure ? <Mic className="h-4 w-4 text-emerald-400" /> : <Mic className="h-4 w-4 opacity-20" />}
                    {song.audio_url ? <Music className="h-4 w-4 text-blue-400" /> : <Music className="h-4 w-4 opacity-20" />}
                    {song.video_url ? <Video className="h-4 w-4 text-red-400" /> : <Video className="h-4 w-4 opacity-20" />}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
