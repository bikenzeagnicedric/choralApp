"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function NewMassPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase
      .from("masses")
      .insert({
        name,
        date,
        is_published: false,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      alert("Erreur : " + error.message);
    } else if (data) {
      router.push(`/masses/${data.id}`);
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-2xl">
        <Link href="/masses" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour aux messes
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Nouvelle Messe</h1>
        <p className="text-white/80 mb-8">Créez un nouveau programme de messe.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">
                  Nom de la messe *
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: 3ème Dimanche de l'Avent" required className="bg-white/10 border-white/20 text-white placeholder:text-white/50" />
              </div>
              <div>
                <Label htmlFor="date" className="text-white">
                  Date *
                </Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="bg-white/10 border-white/20 text-white" />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || !name || !date}>
              {loading ? "Création..." : "Créer la Messe"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
