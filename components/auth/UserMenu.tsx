"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, LogIn, Heart } from "lucide-react";
import Link from "next/link";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    }
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload(); // Refresh to clear state/redirect if needed
  };

  if (loading) return null;

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="ghost" className="text-white hover:bg-white/10">
          <LogIn className="mr-2 h-4 w-4" />
          Connexion
        </Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.email || ""} />
            <AvatarFallback className="bg-primary/20 text-white cursor-pointer">{user.email?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-md border-white/20 text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata.full_name || "Utilisateur"}</p>
            <p className="text-xs leading-none text-white/50">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        <Link href="/profile">
          <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/favorites">
          <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
            <Heart className="mr-2 h-4 w-4" />
            <span>Mes Favoris</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={handleSignOut} className="focus:bg-white/10 cursor-pointer text-red-400 focus:text-red-300">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
