"use client";

import { useState, useEffect, useCallback } from "react";
import type { Profile } from "@/lib/types/database";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        if (response.status === 401) {
          setProfile(null);
          return;
        }
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (profileData: Partial<Profile>) => {
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update profile");
    }

    const updatedProfile = await response.json();
    setProfile(updatedProfile);
    return updatedProfile;
  };

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}
