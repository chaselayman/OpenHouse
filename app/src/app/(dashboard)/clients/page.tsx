"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  Calendar,
  Mail,
  ArrowUpDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types/database";

const gradients = [
  "from-pink-500 to-rose-500",
  "from-sky-500 to-blue-500",
  "from-emerald-500 to-green-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
];

function getInitials(name: string) {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatCriteria(client: Client) {
  const parts = [];
  if (client.min_beds || client.max_beds) {
    parts.push(`${client.min_beds || "?"}${client.max_beds ? `-${client.max_beds}` : "+"} bed`);
  }
  if (client.min_baths || client.max_baths) {
    parts.push(`${client.min_baths || "?"}${client.max_baths ? `-${client.max_baths}` : "+"} bath`);
  }
  if (client.locations && client.locations.length > 0) {
    parts.push(client.locations.slice(0, 2).join(", "));
  }
  if (client.max_price) {
    parts.push(`Under $${(client.max_price / 1000).toFixed(0)}k`);
  }
  return parts.join(" • ") || "No criteria set";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

export default function ClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("clients")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false });

      setClients(data || []);
      setIsLoading(false);
    }

    fetchClients();
  }, [supabase]);

  const handleDeleteClient = async (clientId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this client?")) return;

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);

    if (!error) {
      setClients(clients.filter((c) => c.id !== clientId));
    }
    setMenuOpen(null);
  };

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Clients</h1>
          <p className="text-slate-400">Manage your buyer clients and their property searches.</p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Client List */}
      <div className="glass-card rounded-xl overflow-visible">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-white">
            Client <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-4">Search Criteria</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-2 text-center">Added</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {filteredClients.map((client, index) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors relative"
            >
              {/* Client Info */}
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0`}
                >
                  {getInitials(client.full_name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{client.full_name}</div>
                  {client.email && (
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Criteria */}
              <div className="col-span-4">
                <div className="text-sm text-slate-300 truncate">{formatCriteria(client)}</div>
                {client.locations && client.locations.length > 2 && (
                  <div className="text-xs text-slate-500">+{client.locations.length - 2} more areas</div>
                )}
              </div>

              {/* Status */}
              <div className="col-span-2 text-center">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    client.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : client.status === "inactive"
                      ? "bg-slate-500/10 text-slate-400"
                      : "bg-sky-500/10 text-sky-400"
                  }`}
                >
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
              </div>

              {/* Added Date & Actions */}
              <div className="col-span-2 flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xs text-slate-400">{formatDate(client.created_at)}</div>
                  <div className="text-[10px] text-slate-500">{getTimeAgo(client.updated_at)}</div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(menuOpen === client.id ? null : client.id);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {menuOpen === client.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-[#1a1a1f] border border-white/10 rounded-lg shadow-xl z-10">
                      <button
                        onClick={(e) => handleDeleteClient(client.id, e)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Client
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-slate-500 mb-4">
              {clients.length === 0 ? "No clients yet" : "No clients found"}
            </div>
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300"
            >
              <Plus className="w-4 h-4" />
              Add your first client
            </Link>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
        <div>
          Showing {filteredClients.length} of {clients.length} clients
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {clients.filter((c) => c.status === "active").length} active
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            {clients.filter((c) => c.status === "inactive").length} inactive
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            {clients.filter((c) => c.status === "closed").length} closed
          </span>
        </div>
      </div>
    </div>
  );
}
