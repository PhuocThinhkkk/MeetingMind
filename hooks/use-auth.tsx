"use client";

import { log } from "@/lib/logger";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Provides authentication state and actions to its descendant components via AuthContext.
 *
 * The provider tracks the current `user`, `session`, and `loading` state, subscribes to
 * authentication state changes, and exposes `signUp`, `signIn`, and `signOut` functions
 * to consumers of the context.
 *
 * @param children - React elements that will have access to the authentication context
 * @returns The AuthContext provider element wrapping `children`
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      log.info("Auth event:", event);
      log.info("Current session:", session);

      if (event === "SIGNED_IN" && session?.user) {
        setTimeout(async () => {
          await createUserProfile(session.user);
        }, 0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user: User) => {
    try {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (existing) {
        return;
      }

      const { error } = await supabase.from("users").insert([
        {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || "",
          settings: {},
        },
      ]);

      if (error) {
        log.error("Error creating user profile:", error);
      }
    } catch (error) {
      log.error("Error creating user profile:", error);
    }
  };

  async function signUp(email: string, password: string, name: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { error };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/home`,
      },
    });
    return { error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
