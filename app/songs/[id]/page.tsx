"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Song } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Music, Mic, Video, Edit } from "lucide-react";
import Link from "next/link";

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [song, setSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSong();
  }, [params.id]);

  async function fetchSong() {
    const { data } = await supabase.from("songs").select("*, category:categories(*)").eq("id", params.id).single();

    if (data) setSong(data);
    setLoading(false);
  }

  function getYouTubeEmbedUrl(url: string): string {
    // Extract YouTube video ID from various URL formats
    let videoId = "";

    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(url.split("?")[1]);
      videoId = urlParams.get("v") || "";
    }
    // Format: https://youtu.be/VIDEO_ID
    else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    // Format: https://www.youtube.com/embed/VIDEO_ID
    else if (url.includes("youtube.com/embed/")) {
      return url; // Already in embed format
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Chant introuvable</p>
          <Button onClick={() => router.push("/songs")}>Retour à la bibliothèque</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-4xl">
        <Link href="/songs" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à la bibliothèque
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {song.category?.name || "Divers"}
                </Badge>
                {song.key && (
                  <Badge variant="outline" className="font-mono border-white/30 text-white">
                    {song.key}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-white">{song.title}</h1>
            </div>
            <Link href={`/songs/${params.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="lyrics" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="lyrics" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Paroles
            </TabsTrigger>
            <TabsTrigger value="audio" disabled={!song.audio_url} className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              Audio
            </TabsTrigger>
            <TabsTrigger value="video" disabled={!song.video_url} className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Vidéo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lyrics" className="mt-6">
            <Card>
              <CardContent className="p-8">
                {song.lyrics_structure && song.lyrics_structure.length > 0 ? (
                  <div className="space-y-6 font-serif text-lg leading-relaxed">
                    {song.lyrics_structure.map((part, index) => (
                      <div key={index} className="space-y-2">
                        <div className="font-sans text-sm font-semibold text-primary uppercase tracking-wide">{part.type === "chorus" ? "Refrain" : `Couplet ${part.label}`}</div>
                        <div className="whitespace-pre-wrap pl-4 border-l-2 border-primary/30">{part.content}</div>
                      </div>
                    ))}
                  </div>
                ) : song.lyrics ? (
                  <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed">{song.lyrics}</div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">Aucune parole disponible</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audio" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Lecteur Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                {song.audio_url ? (
                  <audio controls className="w-full">
                    <source src={song.audio_url} type="audio/mpeg" />
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                ) : (
                  <div className="text-center text-muted-foreground py-8">Aucun fichier audio disponible</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Lecteur Vidéo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {song.video_url ? (
                  <div className="aspect-video">
                    <iframe src={getYouTubeEmbedUrl(song.video_url)} className="w-full h-full rounded-lg" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">Aucune vidéo disponible</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
