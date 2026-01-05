"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [orderIndex, setOrderIndex] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase.from("categories").select("*").order("order_index");
    if (data) setCategories(data);
    setLoading(false);
  }

  function openDialog(category?: Category) {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setOrderIndex(String(category.order_index));
    } else {
      setEditingCategory(null);
      setName("");
      setSlug("");
      setOrderIndex(String((categories.length + 1) * 10));
    }
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingCategory) {
      // Update
      const { error } = await supabase
        .from("categories")
        .update({
          name,
          slug,
          order_index: parseInt(orderIndex),
        })
        .eq("id", editingCategory.id);

      if (error) {
        alert("Erreur lors de la modification : " + error.message);
      } else {
        fetchCategories();
        setIsDialogOpen(false);
      }
    } else {
      // Create
      const { error } = await supabase.from("categories").insert({
        name,
        slug,
        order_index: parseInt(orderIndex),
      });

      if (error) {
        alert("Erreur lors de la création : " + error.message);
      } else {
        fetchCategories();
        setIsDialogOpen(false);
      }
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (!error) fetchCategories();
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Catégories Liturgiques</h1>
          <p className="text-white/80 mt-1">Gérez les catégories de votre répertoire.</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Liste des Catégories</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => openDialog()} className="bg-white text-black hover:bg-white/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle Catégorie
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingCategory ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="name">Nom *</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Entrée" required />
                    </div>
                    <div>
                      <Label htmlFor="slug">Slug *</Label>
                      <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Ex: entree" required />
                    </div>
                    <div>
                      <Label htmlFor="order">Ordre *</Label>
                      <Input id="order" type="number" value={orderIndex} onChange={(e) => setOrderIndex(e.target.value)} required />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit">{editingCategory ? "Modifier" : "Créer"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-white/80">Chargement...</div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-white/80">Aucune catégorie</div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-white/60 font-mono text-sm w-8">{category.order_index}</span>
                      <div>
                        <div className="font-medium text-white">{category.name}</div>
                        <div className="text-xs text-white/60">{category.slug}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openDialog(category)} className="text-white/80 hover:text-white hover:bg-white/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(category.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
