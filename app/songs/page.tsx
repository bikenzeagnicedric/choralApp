import SongsList from "./components/SongsList";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Song, Category } from "@/types";

export default async function SongsPage() {
  const supabase = await createClient();

  // Parallel fetching for performance
  const [songsResult, categoriesResult] = await Promise.all([supabase.from("songs").select("*, category:categories(*)").order("title"), supabase.from("categories").select("*").order("order_index")]);

  const songs = (songsResult.data || []) as Song[];
  const categories = (categoriesResult.data || []) as Category[];

  return (
    <div className="min-h-screen relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-4">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white">Bibliothèque de Chants</h1>
          <p className="text-white/80 mt-1">Gérez votre répertoire musical liturgique.</p>
        </div>

        <SongsList initialSongs={songs} categories={categories} />
      </div>
    </div>
  );
}
