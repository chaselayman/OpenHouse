"use client";

import { useState, useEffect, useCallback } from "react";
import type { Client } from "@/lib/types/database";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/clients");
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (clientData: Partial<Client>) => {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create client");
    }

    const newClient = await response.json();
    setClients((prev) => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const response = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update client");
    }

    const updatedClient = await response.json();
    setClients((prev) =>
      prev.map((c) => (c.id === id ? updatedClient : c))
    );
    return updatedClient;
  };

  const deleteClient = async (id: string) => {
    const response = await fetch(`/api/clients/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete client");
    }

    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return {
    clients,
    isLoading,
    error,
    refetch: fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}

export function useClient(id: string) {
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch client");
        }
        const data = await response.json();
        setClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id]);

  return { client, isLoading, error };
}
