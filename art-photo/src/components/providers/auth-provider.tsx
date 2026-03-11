"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setRole, setLoading, reset } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setRole((user.app_metadata?.user_role as string) ?? "client");
      } else {
        reset();
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setRole((session.user.app_metadata?.user_role as string) ?? "client");
        } else {
          reset();
        }
        setLoading(false);

        if (event === "SIGNED_OUT") {
          router.refresh();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setRole, setLoading, reset, router]);

  return <>{children}</>;
}
