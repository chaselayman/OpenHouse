/**
 * Session Management Service
 * Handles concurrent session detection and enforcement
 */

import { createClient } from "@/lib/supabase/client";

// Generate a unique session ID
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

// Get or create session ID from localStorage
export function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem("openhouse_session_id");
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem("openhouse_session_id", sessionId);
  }
  return sessionId;
}

// Get basic device info for session tracking
export function getDeviceInfo(): string {
  if (typeof window === "undefined") return "unknown";

  const ua = navigator.userAgent;
  const platform = navigator.platform;

  // Simple device fingerprint
  return `${platform} | ${ua.substring(0, 100)}`;
}

/**
 * Register a new session for the current user
 * This will deactivate any existing sessions (enforced by DB trigger)
 */
export async function registerSession(userId: string): Promise<{
  success: boolean;
  sessionId: string;
  error?: string;
}> {
  const supabase = createClient();
  const sessionId = getSessionId();
  const deviceInfo = getDeviceInfo();

  try {
    const { error } = await supabase.from("user_sessions").insert({
      user_id: userId,
      session_id: sessionId,
      device_info: deviceInfo,
      is_active: true,
    });

    if (error) throw error;

    return { success: true, sessionId };
  } catch (error) {
    console.error("Failed to register session:", error);
    return {
      success: false,
      sessionId,
      error: error instanceof Error ? error.message : "Failed to register session",
    };
  }
}

/**
 * Validate that the current session is still active
 * Returns false if another session has taken over
 */
export async function validateCurrentSession(userId: string): Promise<{
  isValid: boolean;
  wasKicked: boolean;
}> {
  const supabase = createClient();
  const sessionId = getSessionId();

  try {
    // Check if our session is still the active one
    const { data: profile } = await supabase
      .from("profiles")
      .select("last_session_id")
      .eq("id", userId)
      .single();

    if (!profile) {
      return { isValid: false, wasKicked: false };
    }

    const isValid = profile.last_session_id === sessionId;

    return {
      isValid,
      wasKicked: !isValid && profile.last_session_id !== null,
    };
  } catch (error) {
    console.error("Failed to validate session:", error);
    return { isValid: false, wasKicked: false };
  }
}

/**
 * Update session last active timestamp
 */
export async function updateSessionActivity(userId: string): Promise<void> {
  const supabase = createClient();
  const sessionId = getSessionId();

  try {
    await supabase
      .from("user_sessions")
      .update({ last_active_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .eq("is_active", true);
  } catch (error) {
    console.error("Failed to update session activity:", error);
  }
}

/**
 * Clear session on logout
 */
export async function clearSession(userId: string): Promise<void> {
  const supabase = createClient();
  const sessionId = getSessionId();

  try {
    await supabase
      .from("user_sessions")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("session_id", sessionId);

    // Clear local session ID
    localStorage.removeItem("openhouse_session_id");
  } catch (error) {
    console.error("Failed to clear session:", error);
  }
}

/**
 * Get all sessions for a user (for settings page display)
 */
export async function getUserSessions(userId: string): Promise<{
  sessions: Array<{
    id: string;
    session_id: string;
    device_info: string;
    created_at: string;
    last_active_at: string;
    is_active: boolean;
    is_current: boolean;
  }>;
}> {
  const supabase = createClient();
  const currentSessionId = getSessionId();

  try {
    const { data: sessions } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      sessions: (sessions || []).map((s: {
        id: string;
        session_id: string;
        device_info: string;
        created_at: string;
        last_active_at: string;
        is_active: boolean;
      }) => ({
        ...s,
        is_current: s.session_id === currentSessionId,
      })),
    };
  } catch (error) {
    console.error("Failed to get user sessions:", error);
    return { sessions: [] };
  }
}
