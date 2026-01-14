"use client";

import { useState, useEffect, useCallback } from "react";
import type { Showing, Client, Property } from "@/lib/types/database";

export type ShowingWithRelations = Showing & {
  client: Pick<Client, "id" | "full_name" | "email" | "phone">;
  property: Pick<Property, "id" | "address" | "city" | "state" | "zip" | "price" | "beds" | "baths">;
};

export function useShowings(startDate?: string, endDate?: string) {
  const [showings, setShowings] = useState<ShowingWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShowings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const url = `/api/showings${params.toString() ? `?${params}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch showings");
      }
      const data = await response.json();
      setShowings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchShowings();
  }, [fetchShowings]);

  const createShowing = async (showingData: Partial<Showing>) => {
    const response = await fetch("/api/showings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(showingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create showing");
    }

    const newShowing = await response.json();
    setShowings((prev) => [...prev, newShowing].sort((a, b) => {
      const dateCompare = a.scheduled_date.localeCompare(b.scheduled_date);
      if (dateCompare !== 0) return dateCompare;
      return a.scheduled_time.localeCompare(b.scheduled_time);
    }));
    return newShowing;
  };

  const updateShowing = async (id: string, showingData: Partial<Showing>) => {
    const response = await fetch(`/api/showings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(showingData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update showing");
    }

    const updatedShowing = await response.json();
    setShowings((prev) =>
      prev.map((s) => (s.id === id ? updatedShowing : s))
    );
    return updatedShowing;
  };

  const deleteShowing = async (id: string) => {
    const response = await fetch(`/api/showings/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete showing");
    }

    setShowings((prev) => prev.filter((s) => s.id !== id));
  };

  return {
    showings,
    isLoading,
    error,
    refetch: fetchShowings,
    createShowing,
    updateShowing,
    deleteShowing,
  };
}
