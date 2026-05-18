import { useAuth } from "@/context/AuthContext";

export function useAuthUser() {
  const { user, session, loading } = useAuth();

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    userId: user?.id,
    email: user?.email,
  };
}
