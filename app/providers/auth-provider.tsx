"use client";

import { useEffect } from "react";

import AuthService from "@/app/services/auth.service";
import { useAuthStore } from "@/app/store/auth-store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hydrated, setAccessToken, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!hydrated) return;

    let mounted = true;

    async function initialize() {
      try {
        // Try to restore the session using the HttpOnly refresh cookie.
        const refreshed = await AuthService.refresh();

        if (!mounted) return;

        const token = refreshed.data.access_token;

        setAccessToken(token);

        // Load the authenticated user using the new access token.
        const me = await AuthService.me();

        if (!mounted) return;

        setUser(me.data);
      } catch {
        if (!mounted) return;

        // Refresh failed or the access token could not be used.
        // Treat the user as unauthenticated.
        setAccessToken(null);
        setUser(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [hydrated, setAccessToken, setUser, setLoading]);

  return <>{children}</>;
}
