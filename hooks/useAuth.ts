"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

/**
 * Hook for accessing the current auth state in client components.
 * For server components, use createClient() from lib/supabase/server directly.
 */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        fetchProfile(user);
      } else {
        setState({ user: null, profile: null, loading: false });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchProfile(session.user);
        } else {
          setState({ user: null, profile: null, loading: false });
        }
      },
    );

    async function fetchProfile(user: User) {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setState({
        user,
        profile: profile as Profile | null,
        loading: false,
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  return state;
}

/**
 * Hook that redirects to /login if not authenticated.
 */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace("/login");
    }
  }, [auth.loading, auth.user, router]);

  return auth;
}

/**
 * Sign out helper.
 */
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
}
