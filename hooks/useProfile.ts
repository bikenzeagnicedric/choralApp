"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "user" | "admin" | "moderator";
}

export function useProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();

          if (data) {
            setProfile(data as Profile);
          } else if (error && error.code !== "PGRST116") {
            console.error("Error fetching profile:", error);
          }
        }
      } catch (e) {
        console.error("Unexpected error:", e);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [supabase]);

  return { user, profile, loading, isAdmin: profile?.role === "admin" };
}
