"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Mass } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { fr } from "date-fns/locale";

export default function CalendarPage() {
  const supabase = createClient();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [masses, setMasses] = useState<Mass[]>([]);
  const [selectedDayMasses, setSelectedDayMasses] = useState<Mass[]>([]);

  useEffect(() => {
    fetchMasses();
  }, []);

  useEffect(() => {
    if (date) {
      const dayMasses = masses.filter((m) => {
        const d = new Date(m.date);
        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
      setSelectedDayMasses(dayMasses);
    }
  }, [date, masses]);

  async function fetchMasses() {
    const { data } = await supabase.from("masses").select("*").order("date", { ascending: true });
    if (data) setMasses(data);
  }

  // Highlight days with masses
  const modifiers = {
    hasMass: (date: Date) => {
      return masses.some((m) => {
        const d = new Date(m.date);
        return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });
    },
  };

  const modifiersStyles = {
    hasMass: {
      fontWeight: "bold",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      borderRadius: "4px",
    },
  };

  return (
    <div className="min-h-screen relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-5xl">
        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Calendrier Liturgique</h1>
            <p className="text-white/70">Visualisez et planifiez vos célébrations.</p>
          </div>
          <Link href="/masses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Messe
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-[1fr_350px] gap-8">
          {/* Calendar */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6 flex justify-center">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md" locale={fr} modifiers={modifiers} modifiersStyles={modifiersStyles} />
            </CardContent>
          </Card>

          {/* Events for selected day */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">{date ? date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Sélectionnez une date"}</h2>

            {selectedDayMasses.length > 0 ? (
              selectedDayMasses.map((mass) => (
                <Link key={mass.id} href={`/masses/${mass.id}`}>
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15 transition-all cursor-pointer">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-lg">{mass.name}</CardTitle>
                          <Badge variant={mass.is_published ? "default" : "secondary"} className={`mt-2 ${mass.is_published ? "bg-green-600" : "bg-white/20"}`}>
                            {mass.is_published ? "Publiée" : "Brouillon"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-white/50 text-center py-8 border border-dashed border-white/20 rounded-lg">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune messe prévue ce jour.</p>
                {date && (
                  <Link href="/masses/new">
                    <Button variant="link" className="text-white mt-2">
                      Créer une messe
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
