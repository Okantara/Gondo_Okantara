import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  User,
  Session,
} from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;

  signUp: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;

  signIn: (
    username: string,
    password: string
  ) => Promise<void>;

  signOut: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [session, setSession] =
    useState<Session | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // REGISTER
  const signUp = async (
    username: string,
    email: string,
    password: string
  ) => {

    // register auth
    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("User gagal dibuat");
    }

    // simpan profile
    const { error: profileError } =
      await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          username:
            username.toLowerCase(),
          email,
        });

    if (profileError) {
      throw profileError;
    }
  };

  // LOGIN USERNAME
  const signIn = async (
    username: string,
    password: string
  ) => {
    if (!username || !password) {
      throw new Error("Username dan password harus diisi");
    }

    try {
      // Cari user berdasarkan username
      const { data: profiles, error: profileError } =
        await supabase
          .from("profiles")
          .select("id, email, username")
          .eq("username", username.toLowerCase())
          .limit(1);

      console.log("Query profiles:", { username: username.toLowerCase(), profiles, profileError });

      if (profileError) {
        console.error("Profile lookup error:", profileError);
        throw new Error("Terjadi kesalahan saat mencari user");
      }

      if (!profiles || profiles.length === 0) {
        console.warn("Username tidak ditemukan:", username.toLowerCase());
        throw new Error("Username tidak ditemukan");
      }

      const profile = profiles[0];
      console.log("Profile ditemukan:", profile);

      if (!profile.email) {
        throw new Error("Email tidak ditemukan di profile");
      }

      // Login menggunakan email
      const { error } =
        await supabase.auth.signInWithPassword({
          email: profile.email,
          password,
        });

      if (error) {
        console.error("Sign in error:", error);
        if (
          error.message.includes("Invalid login credentials") ||
          error.message.includes("invalid_grant")
        ) {
          throw new Error("Username atau password salah");
        }
        throw new Error(error.message || "Gagal login");
      }
    } catch (err) {
      console.error("SignIn error:", err);
      throw err;
    }
  };

  // LOGOUT
  const signOut = async () => {
    const { error } =
      await supabase.auth.signOut();

    if (error) throw error;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}