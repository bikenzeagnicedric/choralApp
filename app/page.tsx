"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music, CalendarDays, Library, ArrowRight, Sparkles, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Mass } from "@/types";

export const dynamic = "force-dynamic";

export default function Home() {
  const [nextMass, setNextMass] = useState<Mass | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchNextMass() {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase.from("masses").select("*").gte("date", today).order("date", { ascending: true }).limit(1).single();

      if (data) setNextMass(data);
    }
    fetchNextMass();
  }, []);

  return (
    <main className="min-h-screen relative">
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Bible Verse Header */}
        <div className="pt-8 pb-4 px-4 text-center animate-in fade-in duration-700">
          <p className="text-white/80 text-sm md:text-base italic max-w-3xl mx-auto">« Chantez au Seigneur un chant nouveau, car il a fait des merveilles. »</p>
          <p className="text-white/60 text-xs md:text-sm mt-1">— Psaume 98, 1</p>
        </div>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-5xl w-full text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Sparkles className="h-4 w-4" />
              <span>Gestion de chants liturgiques</span>
            </div>

            {/* Next Mass Widget */}
            {nextMass && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <Link href={`/masses/${nextMass.id}`}>
                  <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">Prochaine Célébration</p>
                      <p className="text-white font-medium">
                        {nextMass.name} • {new Date(nextMass.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-white/40 group-hover:translate-x-1 transition-transform ml-2" />
                  </div>
                </Link>
              </div>
            )}

            {/* Title */}
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight drop-shadow-2xl leading-tight">La Chorale Secours Saint Pierre</h1>
              <p className="text-xl md:text-3xl text-white/90 font-light max-w-3xl mx-auto drop-shadow-lg">Organisez vos chants, préparez vos messes et louez en toute simplicité</p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
              <Link href="/songs">
                <Button size="lg" className="text-lg px-8 py-6 bg-white text-black hover:bg-white/90 shadow-2xl">
                  <Library className="mr-2 h-5 w-5" />
                  Bibliothèque
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/calendar">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl">
                  <CalendarDays className="mr-2 h-5 w-5" />
                  Calendrier
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl">
                  <Music className="mr-2 h-5 w-5" />
                  Catégories
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="pb-20 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            {/* Feature 1 */}
            <div className="group p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl">
              <div className="p-3 rounded-full bg-white/20 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Library className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Répertoire Structuré</h3>
              <p className="text-white/80 leading-relaxed">Organisez vos chants par catégories liturgiques avec refrains et couplets modulables.</p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl">
              <div className="p-3 rounded-full bg-white/20 w-fit mb-4 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Programmes de Messe</h3>
              <p className="text-white/80 leading-relaxed">Créez des programmes personnalisés en sélectionnant les couplets à chanter.</p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl">
              <div className="p-3 rounded-full bg-white/20 w-fit mb-4 group-hover:scale-110 transition-transform">
                <Music className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Export Professionnel</h3>
              <p className="text-white/80 leading-relaxed">Exportez vos feuilles de chants en PDF ou DOCX pour l'impression.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
