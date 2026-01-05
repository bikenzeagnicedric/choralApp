"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Mass, MassSong, Song, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Plus, GripVertical, Trash2, FileDown, Music } from "lucide-react";
import Link from "next/link";
import { exportToPDF } from "@/lib/export-pdf";
import { exportToDOCX } from "@/lib/export-docx";

export default function MassDetailPage() {
  const params = useParams();
  const supabase = createClient();

  const [mass, setMass] = useState<Mass | null>(null);
  const [massSongs, setMassSongs] = useState<MassSong[]>([]);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSongId, setSelectedSongId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedParts, setSelectedParts] = useState<number[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    // Fetch mass
    const { data: massData } = await supabase.from("masses").select("*").eq("id", params.id).single();
    if (massData) setMass(massData);

    // Fetch mass songs
    const { data: massSongsData } = await supabase.from("mass_songs").select("*, song:songs(*, category:categories(*))").eq("mass_id", params.id).order("position");
    if (massSongsData) setMassSongs(massSongsData);

    // Fetch all songs
    const { data: songsData } = await supabase.from("songs").select("*, category:categories(*)").order("title");
    if (songsData) setAllSongs(songsData);

    // Fetch categories
    const { data: categoriesData } = await supabase.from("categories").select("*").order("order_index");
    if (categoriesData) setCategories(categoriesData);

    setLoading(false);
  }

  async function handleAddSong() {
    if (!selectedSongId) return;

    const position = massSongs.length + 1;
    const song = allSongs.find((s) => s.id === selectedSongId);

    const { error } = await supabase.from("mass_songs").insert({
      mass_id: params.id,
      song_id: selectedSongId,
      position,
      liturgical_moment: song?.category?.name || null,
      selected_parts: selectedParts.length > 0 ? selectedParts : null,
    });

    if (!error) {
      fetchData();
      setIsAddDialogOpen(false);
      setSelectedSongId("");
      setSelectedParts([]);
      setCurrentSong(null);
    }
  }

  async function handleRemoveSong(massSongId: string) {
    const { error } = await supabase.from("mass_songs").delete().eq("id", massSongId);

    if (!error) fetchData();
  }

  function handleSongSelection(songId: string) {
    setSelectedSongId(songId);
    const song = allSongs.find((s) => s.id === songId);
    setCurrentSong(song || null);

    // Pre-select all parts by default
    if (song?.lyrics_structure) {
      setSelectedParts(song.lyrics_structure.map((_, i) => i));
    }
  }

  function togglePart(index: number) {
    setSelectedParts((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index].sort((a, b) => a - b)));
  }

  async function handleExportPDF() {
    if (mass) {
      await exportToPDF(mass, massSongs);
    }
  }

  async function handleExportDOCX() {
    if (mass) {
      await exportToDOCX(mass, massSongs);
    }
  }

  const filteredSongs = selectedCategory && selectedCategory !== "all" ? allSongs.filter((s) => s.category_id === selectedCategory) : allSongs;

  if (loading) {
    return <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!mass) {
    return <div className="container mx-auto py-8 min-h-screen flex items-center justify-center">Messe introuvable</div>;
  }

  return (
    <div className="min-h-screen relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-5xl">
        <Link href="/masses" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour aux messes
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">{mass.name}</h1>
              <p className="text-white/80 mt-1">{new Date(mass.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <FileDown className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={handleExportDOCX}>
                <FileDown className="mr-2 h-4 w-4" />
                Export DOCX
              </Button>
            </div>
          </div>
        </div>

        {/* Program */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Programme</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter un Chant
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Ajouter un Chant</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Filtrer par catégorie</Label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les catégories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Chant *</Label>
                      <Select value={selectedSongId} onValueChange={handleSongSelection}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un chant" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredSongs.map((song) => (
                            <SelectItem key={song.id} value={song.id}>
                              {song.title} {song.category && `(${song.category.name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {currentSong?.lyrics_structure && currentSong.lyrics_structure.length > 0 && (
                      <div className="border rounded-lg p-4 space-y-3">
                        <Label>Parties à chanter</Label>
                        {currentSong.lyrics_structure.map((part, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <Checkbox id={`part-${index}`} checked={selectedParts.includes(index)} onCheckedChange={() => togglePart(index)} />
                            <div className="flex-1">
                              <label htmlFor={`part-${index}`} className="text-sm font-medium cursor-pointer">
                                {part.type === "chorus" ? "Refrain" : `Couplet ${part.label}`}
                              </label>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{part.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleAddSong} disabled={!selectedSongId}>
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {massSongs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                Aucun chant ajouté. Commencez à construire votre programme !
              </div>
            ) : (
              <div className="space-y-2">
                {massSongs.map((massSong, index) => (
                  <div key={massSong.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{index + 1}.</span>
                        <span className="font-medium">{massSong.song?.title}</span>
                        {massSong.liturgical_moment && (
                          <Badge variant="secondary" className="text-xs">
                            {massSong.liturgical_moment}
                          </Badge>
                        )}
                      </div>
                      {massSong.selected_parts && massSong.song?.lyrics_structure && (
                        <div className="text-xs text-muted-foreground flex gap-1 flex-wrap">
                          {massSong.selected_parts.map((partIndex) => {
                            const part = massSong.song?.lyrics_structure?.[partIndex];
                            return part ? (
                              <Badge key={partIndex} variant="outline" className="text-xs">
                                {part.type === "chorus" ? "Refrain" : `C${part.label}`}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveSong(massSong.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
