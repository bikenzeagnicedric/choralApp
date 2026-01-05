"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertCircle, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim();

    try {
      const { error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setError(null);
        alert("Inscription réussie ! Vérifiez vos emails pour confirmer votre compte.");
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-sm text-white/80 hover:text-white mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour à l'accueil
        </Link>
        <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white text-center">Bienvenue</CardTitle>
            <CardDescription className="text-white/60 text-center">Connectez-vous pour gérer les chants et les messes</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-500/20 border-red-500/50 text-white">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="w-full">
              <h3 className="text-lg font-medium text-white mb-4">Connexion</h3>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-login" className="text-white">
                    Email
                  </Label>
                  <Input id="email-login" type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-login" className="text-white">
                    Mot de passe
                  </Label>
                  <Input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10" />
                </div>
                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Se connecter
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
