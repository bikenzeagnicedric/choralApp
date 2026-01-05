"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function NewSongPage() {
  const router = useRouter();
  const supabase = createClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [key, setKey] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [lyricsStructure, setLyricsStructure] = useState<LyricsPart[]>([{ type: "chorus", content: "" }]);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*").order("order_index");
    if (data) setCategories(data);
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
    setLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();

      const songData = {
        title,
        category_id: categoryId && categoryId !== "none" ? categoryId : null,
        key: key || null,
        audio_url: audioUrl || null,
        video_url: videoUrl || null,
        lyrics_structure: lyricsStructure.filter((p) => p.content.trim() !== ""),
        created_by: userData?.user?.id || null,
      };

      console.log("Tentative d'insertion:", songData);

      const { data, error } = await supabase.from("songs").insert(songData).select();

      setLoading(false);

      if (error) {
        console.error("Erreur Supabase:", error);
        alert("Erreur lors de l'ajout : " + error.message);
      } else {
        console.log("Chant créé avec succès:", data);
        router.push("/songs");
      }
    } catch (err) {
      setLoading(false);
      console.error("Erreur inattendue:", err);
      alert("Erreur inattendue : " + (err as Error).message);
    }
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

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Nouveau Chant</h1>
        <p className="text-white/80 mb-8">Ajoutez un chant à votre répertoire liturgique.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Alléluia, louez le Seigneur" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie Liturgique</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
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
                  <Label htmlFor="key">Tonalité</Label>
                  <Input id="key" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Ex: Do Majeur, Ré mineur" />
                </div>
              </div>

              <div>
                <Label htmlFor="audio">Lien Audio (URL)</Label>
                <Input id="audio" type="url" value={audioUrl} onChange={(e) => setAudioUrl(e.target.value)} placeholder="https://..." />
              </div>

              <div>
                <Label htmlFor="video">Lien Vidéo (URL)</Label>
                <Input id="video" type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
              </div>
            </CardContent>
          </Card>

          {/* Structure des Paroles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music2 className="h-5 w-5" />
                Structure des Paroles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lyricsStructure.map((part, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-2 bg-card/50">
                  <div className="flex justify-between items-center">
                    <Badge variant={part.type === "chorus" ? "default" : "secondary"}>{part.type === "chorus" ? "Refrain" : `Couplet ${part.label}`}</Badge>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removePart(index)} disabled={lyricsStructure.length === 1}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Textarea value={part.content} onChange={(e) => updatePart(index, e.target.value)} placeholder="Saisissez les paroles..." rows={4} className="font-serif" />
                </div>
              ))}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => addPart("chorus")} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Refrain
                </Button>
                <Button type="button" variant="outline" onClick={() => addPart("verse")} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un Couplet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !title}>
              {loading ? "Enregistrement..." : "Enregistrer le Chant"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
