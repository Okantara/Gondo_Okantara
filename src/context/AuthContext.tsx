import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
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
  profile: Profile | null;
  loading: boolean;

  signUp: (username: string, email: string, password: string) => Promise<void>;
  signIn: (username: string, password: string) => Promise<Profile>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileCacheRef = useRef<Map<string, Profile>>(new Map());
  const isInitializedRef = useRef(false);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Cek cache dulu
      const cachedProfile = profileCacheRef.current.get(userId);
      if (cachedProfile) {
        setProfile(cachedProfile);
        return cachedProfile;
      }

      // Fetch dari database dengan timeout 5 detik
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, role, is_active")
        .eq("id", userId)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error || !data) {
        setProfile(null);
        return null;
      }

      const profileData = data as Profile;
      profileCacheRef.current.set(userId, profileData);
      setProfile(profileData);

      return profileData;
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Timeout 10 detik untuk getSession
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const {
          data: { session },
        } = await supabase.auth.getSession();

        clearTimeout(timeoutId);

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (isMounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          isInitializedRef.current = true;
        }
      }
    };

    initializeAuth();

    // Setup listener SETELAH initialization selesai
    const setupListener = async () => {
      // Tunggu initialization selesai
      while (!isInitializedRef.current) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (!isMounted) return;

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        async (_event: AuthChangeEvent, session: Session | null) => {
          if (!isMounted) return;

          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        },
      );

      return subscription;
    };

    let subscription: any;
    setupListener().then((sub) => {
      subscription = sub;
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (
    username: string,
    email: string,
    password: string,
  ): Promise<void> => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("User gagal dibuat");

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      role: "kasir",
      is_active: true,
    });

    if (profileError) throw profileError;
  };

  const signIn = async (
    username: string,
    password: string,
  ): Promise<Profile> => {
    const cleanUsername = username.trim().toLowerCase();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, username, email, role, is_active")
      .ilike("username", cleanUsername)
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

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password,
    });

    if (loginError) {
      throw new Error("Username atau password salah");
    }

    setSession(data.session);
    setUser(data.user);
    setProfile(profile as Profile);

    profileCacheRef.current.set(profile.id, profile as Profile);

    return profile as Profile;
  };

  const signOut = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    setUser(null);
    setSession(null);
    setProfile(null);
    profileCacheRef.current.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
