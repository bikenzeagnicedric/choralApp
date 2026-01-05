"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Category, LyricsPart } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Music2, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function EditSongPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [key, setKey] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [lyricsStructure, setLyricsStructure] = useState<LyricsPart[]>([{ type: "chorus", content: "" }]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch categories
    const { data: categoriesData } = await supabase.from("categories").select("*").order("order_index");
    if (categoriesData) setCategories(categoriesData);

    // Fetch song
    const { data: songData } = await supabase.from("songs").select("*").eq("id", params.id).single();

    if (songData) {
      setTitle(songData.title);
      setCategoryId(songData.category_id || "none");
      setKey(songData.key || "");
      setAudioUrl(songData.audio_url || "");
      setVideoUrl(songData.video_url || "");

      if (songData.lyrics_structure && songData.lyrics_structure.length > 0) {
        setLyricsStructure(songData.lyrics_structure);
      } else if (songData.lyrics) {
        setLyricsStructure([{ type: "chorus", content: songData.lyrics }]);
      }
    }

    setLoading(false);
  }

  function addPart(type: "chorus" | "verse") {
    const newPart: LyricsPart = {
      type,
      label: type === "verse" ? String(lyricsStructure.filter((p) => p.type === "verse").length + 1) : undefined,
      content: "",
    };
    setLyricsStructure([...lyricsStructure, newPart]);
  }

  function removePart(index: number) {
    setLyricsStructure(lyricsStructure.filter((_, i) => i !== index));
  }

  function updatePart(index: number, content: string) {
    const updated = [...lyricsStructure];
    updated[index].content = content;
    setLyricsStructure(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const updateData = {
        title,
        category_id: categoryId && categoryId !== "none" ? categoryId : null,
        key: key || null,
        audio_url: audioUrl || null,
        video_url: videoUrl || null,
        lyrics_structure: lyricsStructure.filter((p) => p.content.trim() !== ""),
      };

      console.log("Tentative de mise à jour:", updateData);

      const { data, error } = await supabase.from("songs").update(updateData).eq("id", params.id).select();

      setSaving(false);

      if (error) {
        console.error("Erreur Supabase:", error);
        alert("Erreur lors de la modification : " + error.message);
      } else {
        console.log("Chant modifié avec succès:", data);
        router.push(`/songs/${params.id}`);
      }
    } catch (err) {
      setSaving(false);
      console.error("Erreur inattendue:", err);
      alert("Erreur inattendue : " + (err as Error).message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative z-10 text-white/80">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-4xl">
        <Link href={`/songs/${params.id}`} className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour au chant
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Modifier le Chant</h1>
        <p className="text-white/80 mb-8">Modifiez les informations de ce chant.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white">
                  Titre *
                </Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Alléluia, louez le Seigneur" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category" className="text-white">
                    Catégorie Liturgique
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Sélectionner..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune catégorie</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="key" className="text-white">
                    Tonalité
                  </Label>
                  <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Ex: Do Majeur, Ré mineur" className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>
              </div>

              <div>
                <Label htmlFor="audio" className="text-white">
                  Lien Audio (URL)
                </Label>
                <Input id="audio" type="url" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://..." className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>

              <div>
                <Label htmlFor="video" className="text-white">
                  Lien Vidéo (URL)
                </Label>
                <Input id="video" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>
            </CardContent>
          </Card>

          {/* Structure des Paroles */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Music2 className="h-5 w-5" />
                Structure des Paroles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lyricsStructure.map((part, index) => (
                <div key={index} className="border border-white/20 rounded-lg p-4 space-y-2 bg-white/5">
                  <div className="flex justify-between items-center">
                    <Badge variant={part.type === "chorus" ? "default" : "secondary"} className="bg-white/20 text-white">
                      {part.type === "chorus" ? "Refrain" : `Couplet ${part.label}`}
                    </Badge>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePart(index)} disabled={lyricsStructure.length === 1} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea value={part.content} onChange={(e) => updatePart(index, e.target.value)} placeholder="Saisissez les paroles..." rows={4} className="font-serif bg-white/10 border-white/20 text-white placeholder:text-white/50" />
                </div>
              ))}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => addPart("chorus")} className="flex-1 border-white/30 text-white hover:bg-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Refrain
                </Button>
                <Button type="button" variant="outline" onClick={() => addPart("verse")} className="flex-1 border-white/30 text-white hover:bg-white/10">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Couplet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()} className="border-white/30 text-white hover:bg-white/10">
              Annuler
            </Button>
            <Button type="submit" disabled={saving || !title} className="bg-green-600 text-white hover:bg-green-700 border-green-600/30 hover:border-green-600/50">
              {saving ? "Enregistrement..." : "Enregistrer les Modifications"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
