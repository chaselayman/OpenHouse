"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Home,
  Calendar,
  Mail,
  Phone,
  ArrowUpDown,
} from "lucide-react";

// Mock data
const clients = [
  {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah.jenkins@email.com",
    phone: "(512) 555-0123",
    initials: "SJ",
    gradient: "from-pink-500 to-rose-500",
    status: "active",
    criteria: "3 bed, 2 bath • South Austin • Under $650k",
    properties: 12,
    showings: 3,
    lastActive: "2 hours ago",
    createdAt: "Jan 5, 2025",
  },
  {
    id: 2,
    name: "Mike Kogan",
    email: "mike.kogan@email.com",
    phone: "(512) 555-0456",
    initials: "MK",
    gradient: "from-sky-500 to-blue-500",
    status: "searching",
    criteria: "4 bed, 3 bath • North Austin • Under $800k",
    properties: 8,
    showings: 0,
    lastActive: "1 day ago",
    createdAt: "Jan 8, 2025",
  },
  {
    id: 3,
    name: "Lisa Chen",
    email: "lisa.chen@email.com",
    phone: "(512) 555-0789",
    initials: "LC",
    gradient: "from-emerald-500 to-green-500",
    status: "active",
    criteria: "2 bed, 2 bath • Downtown • Under $500k",
    properties: 15,
    showings: 2,
    lastActive: "5 hours ago",
    createdAt: "Dec 28, 2024",
  },
  {
    id: 4,
    name: "David Park",
    email: "david.park@email.com",
    phone: "(512) 555-0321",
    initials: "DP",
    gradient: "from-violet-500 to-purple-500",
    status: "paused",
    criteria: "5 bed, 4 bath • Westlake • Under $1.2M",
    properties: 6,
    showings: 1,
    lastActive: "1 week ago",
    createdAt: "Dec 15, 2024",
  },
];

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm"
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
            <option value="searching">Searching</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Client List */}
      <div className="glass-card rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="col-span-4 flex items-center gap-1 cursor-pointer hover:text-white">
            Client <ArrowUpDown className="w-3 h-3" />
          </div>
          <div className="col-span-3">Search Criteria</div>
          <div className="col-span-2 text-center">Properties</div>
          <div className="col-span-2 text-center">Status</div>
          <div className="col-span-1"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-white/5">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors"
            >
              {/* Client Info */}
              <div className="col-span-4 flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${client.gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg shrink-0`}
                >
                  {client.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">{client.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{client.email}</span>
                  </div>
                </div>
              </div>

              {/* Search Criteria */}
              <div className="col-span-3">
                <div className="text-sm text-slate-300 truncate">{client.criteria}</div>
                <div className="text-xs text-slate-500">Added {client.createdAt}</div>
              </div>

              {/* Properties */}
              <div className="col-span-2 text-center">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="text-sm font-medium text-white flex items-center gap-1 justify-center">
                      <Home className="w-3 h-3 text-slate-500" />
                      {client.properties}
                    </div>
                    <div className="text-[10px] text-slate-500">properties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-white flex items-center gap-1 justify-center">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {client.showings}
                    </div>
                    <div className="text-[10px] text-slate-500">showings</div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="col-span-2 text-center">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                    client.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : client.status === "searching"
                      ? "bg-sky-500/10 text-sky-400"
                      : "bg-slate-500/10 text-slate-400"
                  }`}
                >
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">{client.lastActive}</div>
              </div>

              {/* Actions */}
              <div className="col-span-1 text-right">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle menu
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-slate-500 mb-4">No clients found</div>
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
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            {clients.filter((c) => c.status === "searching").length} searching
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            {clients.filter((c) => c.status === "paused").length} paused
          </span>
        </div>
      </div>
    </div>
  );
}
