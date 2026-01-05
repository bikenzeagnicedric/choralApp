"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mass } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";

export default function MassesPage() {
  const supabase = createClient();
  const [masses, setMasses] = useState<Mass[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useProfile();

  useEffect(() => {
    fetchMasses();
  }, []);

  async function fetchMasses() {
    const { data } = await supabase.from("masses").select("*").order("date", { ascending: false });

    if (data) setMasses(data);
    setLoading(false);
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Messes</h1>
              <p className="text-white/80 mt-1">Gérez vos programmes de messe.</p>
            </div>
            {isAdmin && (
              <Link href="/masses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouvelle Messe
                </Button>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/80">Chargement...</div>
        ) : masses.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <CalendarDays className="h-16 w-16 text-white/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Aucune messe programmée</h3>
              <p className="text-white/60 mb-6 text-center max-w-md">Commencez par créer votre première messe pour organiser vos chants liturgiques.</p>
              {isAdmin && (
                <Link href="/masses/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Créer une Messe
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {masses.map((mass) => (
              <Link key={mass.id} href={`/masses/${mass.id}`}>
                <Card className="h-full hover:shadow-xl transition-all cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-white">{mass.name}</CardTitle>
                        <p className="text-sm text-white/60 mt-1">{new Date(mass.date).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                      <Badge variant={mass.is_published ? "default" : "secondary"} className={mass.is_published ? "bg-green-600 text-white" : "bg-white/20 text-white"}>
                        {mass.is_published ? "Publiée" : "Brouillon"}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
