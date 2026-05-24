import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface Profile {
  id: string;
  username: string;
  email: string;
  role: "admin" | "kasir";
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signUp: (username: string, email: string, password: string) => Promise<void>;

  signIn: (username: string, password: string) => Promise<Profile>;

  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // REGISTER
  const signUp = async (username: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("User gagal dibuat");

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: username.toLowerCase(),
      email,
      role: "kasir",
    });

    if (profileError) throw profileError;
  };

  // LOGIN (USERNAME)
  const signIn = async (
    username: string,
    password: string,
  ): Promise<Profile> => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, username, email, role, is_active")
      .ilike("username", username.trim())
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!profile) {
      throw new Error("Username tidak ditemukan");
    }

    if (!profile.is_active) {
      throw new Error("Akun tidak aktif");
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (loginError) {
      throw new Error("Username atau password salah");
    }

    return profile;
  };

  // LOGOUT
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
