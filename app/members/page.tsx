"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Profile, useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MembersPage() {
  const { profile, loading: profileLoading, isAdmin } = useProfile();
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!profileLoading && !isAdmin) {
      // redirect handled by middleware mostly, but good to have client side check
      // router.push('/');
    }
  }, [profileLoading, isAdmin, router]);

  useEffect(() => {
    async function fetchMembers() {
      if (!isAdmin && !profileLoading) return;

      const { data, error } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });

      if (data) setMembers(data as Profile[]);
      setLoading(false);
    }

    if (isAdmin) {
      fetchMembers();
    } else {
      setLoading(false); // Stop loading if not admin
    }
  }, [isAdmin, profileLoading, supabase]);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
        <Shield className="h-16 w-16 mb-4 text-red-500" />
        <h1 className="text-2xl font-bold mb-2">Accès Refusé</h1>
        <p className="text-white/60 mb-6">Vous devez être administrateur pour voir cette page.</p>
        <Link href="/">
          <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Gestion des Membres</h1>
          <Badge variant="outline" className="text-white border-white/30">
            {members.length} membres
          </Badge>
        </div>

        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member.id} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-white/10">
                    <AvatarImage src={member.avatar_url || ""} />
                    <AvatarFallback className="bg-primary/20 text-white">{member.full_name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold">{member.full_name || "Utilisateur sans nom"}</h3>
                    <p className="text-white/60 text-sm">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={member.role === "admin" ? "bg-purple-600 hover:bg-purple-700" : "bg-white/20 hover:bg-white/30"}>{member.role === "admin" ? "Administrateur" : "Choriste"}</Badge>
                  {/* Future: Edit Role Button */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
