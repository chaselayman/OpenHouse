"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  getSessionId,
  generateSessionId,
  getDeviceInfo,
} from "@/lib/services/session";

interface SessionState {
  isValid: boolean;
  wasKicked: boolean;
  isChecking: boolean;
}

/**
 * Hook to manage session state and detect when user is kicked
 * from another device login
 */
export function useSession() {
  const router = useRouter();
  const supabase = createClient();
  const [sessionState, setSessionState] = useState<SessionState>({
    isValid: true,
    wasKicked: false,
    isChecking: false,
  });

  // Register session on mount
  const registerSession = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const sessionId = getSessionId();
      const deviceInfo = getDeviceInfo();

      // Register via API
      await fetch("/api/session/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, deviceInfo }),
      });
    } catch (error) {
      console.error("Failed to register session:", error);
    }
  }, [supabase]);

  // Validate session periodically
  const validateSession = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setSessionState({ isValid: false, wasKicked: false, isChecking: false });
        return;
      }

      setSessionState((prev) => ({ ...prev, isChecking: true }));

      const sessionId = getSessionId();
      const response = await fetch("/api/session/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (data.kicked) {
        setSessionState({ isValid: false, wasKicked: true, isChecking: false });
      } else {
        setSessionState({ isValid: true, wasKicked: false, isChecking: false });
      }
    } catch (error) {
      console.error("Session validation error:", error);
      setSessionState((prev) => ({ ...prev, isChecking: false }));
    }
  }, [supabase]);

  // Handle being kicked - sign out and redirect
  const handleKicked = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login?kicked=true");
  }, [supabase, router]);

  // Register session on mount and auth state change
  useEffect(() => {
    registerSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === "SIGNED_IN") {
        registerSession();
      }
    });

    return () => subscription.unsubscribe();
  }, [registerSession, supabase]);

  // Validate session periodically (every 30 seconds)
  useEffect(() => {
    validateSession();

    const interval = setInterval(validateSession, 30000);
    return () => clearInterval(interval);
  }, [validateSession]);

  return {
    ...sessionState,
    handleKicked,
    validateSession,
  };
}
