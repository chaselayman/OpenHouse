"use client";

import { useState, useEffect, useCallback } from "react";
import type { Property } from "@/lib/types/database";

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/properties");
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const createProperty = async (propertyData: Partial<Property>) => {
    const response = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create property");
    }

    const newProperty = await response.json();
    setProperties((prev) => [newProperty, ...prev]);
    return newProperty;
  };

  const updateProperty = async (id: string, propertyData: Partial<Property>) => {
    const response = await fetch(`/api/properties/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(propertyData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update property");
    }

    const updatedProperty = await response.json();
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? updatedProperty : p))
    );
    return updatedProperty;
  };

  const deleteProperty = async (id: string) => {
    const response = await fetch(`/api/properties/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete property");
    }

    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  return {
    properties,
    isLoading,
    error,
    refetch: fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}

export function useProperty(id: string) {
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/properties/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch property");
        }
        const data = await response.json();
        setProperty(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  return { property, isLoading, error };
}
