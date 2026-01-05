"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, ChevronLeft, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { profile, loading: profileLoading } = useProfile();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState(""); // Not strictly used for auth but good for display
  const [avatarUrl, setAvatarUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.email?.split("@")[0] || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setUpdating(true);
    setMessage(null);

    const updates = {
      id: profile.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      setMessage("Erreur lors de la mise à jour.");
      console.error(error);
    } else {
      setMessage("Profil mis à jour avec succès !");
      // Refresh logic if needed, but simple state update might be enough
      // window.location.reload();
    }
    setUpdating(false);
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Connectez-vous pour voir votre profil.</div>;
  }

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 container mx-auto py-8 max-w-2xl">
        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>

        <div className="mb-8 flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-white/20">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-primary/20 text-white text-2xl">{fullName?.charAt(0) || profile.email?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">{fullName || "Utilisateur"}</h1>
            <div className="flex items-center gap-2">
              <p className="text-white/60">{profile.email}</p>
              <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                {profile.role === "admin" ? "Administrateur" : "Choriste"}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Modifier mon profil</CardTitle>
            <CardDescription className="text-white/60">Mettez à jour vos informations personnelles.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullname" className="text-white">
                  Nom complet
                </Label>
                <Input id="fullname" value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white/5 border-white/20 text-white placeholder:text-white/30" placeholder="Jean Dupont" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-white">
                  URL de l'avatar (Image)
                </Label>
                <Input id="avatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} className="bg-white/5 border-white/20 text-white placeholder:text-white/30" placeholder="https://example.com/avatar.jpg" />
                <p className="text-xs text-white/40">Pour l'instant, collez une URL d'image directe.</p>
              </div>

              {message && <div className={`p-3 rounded text-sm ${message.includes("Erreur") ? "bg-red-500/20 text-red-200" : "bg-green-500/20 text-green-200"}`}>{message}</div>}

              <div className="flex justify-end">
                <Button type="submit" disabled={updating}>
                  {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Enregistrer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
