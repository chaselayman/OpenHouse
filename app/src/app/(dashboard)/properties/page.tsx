"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  Trash2,
  ExternalLink,
  ChevronDown,
  Home,
  MapPin,
  Bed,
  Bath,
  Square,
} from "lucide-react";

// Mock data
const properties = [
  {
    id: 1,
    mlsNumber: "MLS #182392",
    address: "2401 Eva St",
    city: "Austin",
    price: 625000,
    beds: 3,
    baths: 2,
    sqft: 2100,
    match: 94,
    status: "approved",
    client: "Sarah Jenkins",
    clientId: 1,
    image: "https://images.unsplash.com/photo-1600596542815-27b88e54e60d?auto=format&fit=crop&q=80&w=800",
    aiNote: "Perfect layout for Sarah's home office requirement. Backyard faces South (good light). Recently updated kitchen matches her preferences.",
    flags: [],
    daysOnMarket: 5,
  },
  {
    id: 2,
    mlsNumber: "MLS #182401",
    address: "1822 Maple Ave",
    city: "Austin",
    price: 595000,
    beds: 3,
    baths: 2,
    sqft: 1950,
    match: 78,
    status: "flagged",
    client: "Sarah Jenkins",
    clientId: 1,
    image: "https://images.unsplash.com/photo-1574872956277-27038e23f044?auto=format&fit=crop&q=80&w=800",
    aiNote: "Price is attractive but concerns detected.",
    flags: ["Water damage on ceiling (Photo 4)", "Foundation crack visible (Exterior)"],
    daysOnMarket: 12,
  },
  {
    id: 3,
    mlsNumber: "MLS #182455",
    address: "504 Riverside Dr",
    city: "Austin",
    price: 699000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    match: 88,
    status: "pending",
    client: "Mike Kogan",
    clientId: 2,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    aiNote: "Great location near Mike's workplace. Large lot size matches his requirements. Pool is a bonus.",
    flags: [],
    daysOnMarket: 3,
  },
  {
    id: 4,
    mlsNumber: "MLS #182467",
    address: "789 Oak Lane",
    city: "Austin",
    price: 475000,
    beds: 2,
    baths: 2,
    sqft: 1400,
    match: 92,
    status: "pending",
    client: "Lisa Chen",
    clientId: 3,
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800",
    aiNote: "Modern downtown condo. Walking distance to Lisa's office. Rooftop access is a unique feature.",
    flags: [],
    daysOnMarket: 1,
  },
  {
    id: 5,
    mlsNumber: "MLS #182489",
    address: "321 Cedar Blvd",
    city: "Round Rock",
    price: 549000,
    beds: 4,
    baths: 2.5,
    sqft: 2400,
    match: 71,
    status: "flagged",
    client: "Mike Kogan",
    clientId: 2,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=800",
    aiNote: "Good value but location is outside preferred area.",
    flags: ["Outdated HVAC system (visible in photos)", "Roof appears to be 15+ years old"],
    daysOnMarket: 28,
  },
  {
    id: 6,
    mlsNumber: "MLS #182501",
    address: "156 Sunset View",
    city: "Westlake",
    price: 825000,
    beds: 4,
    baths: 3.5,
    sqft: 3200,
    match: 85,
    status: "sent",
    client: "Sarah Jenkins",
    clientId: 1,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=800",
    aiNote: "Premium location with excellent schools. Slightly over budget but worth considering.",
    flags: [],
    daysOnMarket: 7,
  },
];

const clients = [
  { id: 0, name: "All Clients" },
  { id: 1, name: "Sarah Jenkins" },
  { id: 2, name: "Mike Kogan" },
  { id: 3, name: "Lisa Chen" },
];

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<number>(0);
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.mlsNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    const matchesClient = clientFilter === 0 || property.clientId === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
            <AlertTriangle className="w-3 h-3" /> Flagged
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400">
            <Send className="w-3 h-3" /> Sent
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Properties</h1>
          <p className="text-slate-400">AI-analyzed properties matched to your clients.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">
            <Sparkles className="w-4 h-4 inline mr-1 text-sky-400" />
            AI analyzed {properties.length} properties
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by address or MLS #..."
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
            className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer pr-8"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="sent">Sent to Client</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(Number(e.target.value))}
          className="px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-none cursor-pointer pr-8"
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Properties Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <div
            key={property.id}
            className={`rounded-xl border overflow-hidden transition-all hover:border-white/20 ${
              property.status === "flagged"
                ? "border-red-500/20 bg-red-500/[0.02]"
                : "border-white/10 bg-white/[0.02]"
            }`}
          >
            {/* Image */}
            <div className="h-48 relative overflow-hidden group">
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 ${
                  property.status === "flagged" ? "opacity-60 grayscale-[30%]" : "opacity-80"
                }`}
                style={{ backgroundImage: `url(${property.image})` }}
              />
              {property.status === "flagged" && (
                <div className="absolute inset-0 bg-red-500/10" />
              )}

              {/* Top badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white font-medium border border-white/10">
                  {property.mlsNumber}
                </span>
                <span className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-slate-300 border border-white/10">
                  {property.daysOnMarket}d on market
                </span>
              </div>

              {/* Match score */}
              <div
                className={`absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-lg ${
                  property.match >= 90
                    ? "bg-emerald-500 text-black"
                    : property.match >= 80
                    ? "bg-sky-500 text-black"
                    : "bg-slate-600 text-white"
                }`}
              >
                <Sparkles className="w-3 h-3" /> {property.match}% Match
              </div>

              {/* Flagged indicator */}
              {property.status === "flagged" && (
                <div className="absolute top-12 left-3 right-3">
                  <div className="p-2 rounded bg-red-500/20 border border-red-500/30 backdrop-blur">
                    <div className="flex items-center gap-1 text-xs font-semibold text-red-400 mb-1">
                      <AlertTriangle className="w-3 h-3" /> AI Flags Detected
                    </div>
                    {property.flags.slice(0, 2).map((flag, i) => (
                      <p key={i} className="text-[10px] text-red-300/80">
                        {flag}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-white">{property.address}</h3>
                  <p className="text-xs text-slate-500">{property.city}</p>
                </div>
                <span className="text-sm font-mono text-white">
                  ${property.price.toLocaleString()}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                <span className="flex items-center gap-1">
                  <Bed className="w-3 h-3" /> {property.beds} bed
                </span>
                <span className="flex items-center gap-1">
                  <Bath className="w-3 h-3" /> {property.baths} bath
                </span>
                <span className="flex items-center gap-1">
                  <Square className="w-3 h-3" /> {property.sqft.toLocaleString()} sqft
                </span>
              </div>

              {/* AI Note */}
              <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                <span className="text-sky-300 font-medium">AI:</span> {property.aiNote}
              </p>

              {/* Client & Status */}
              <div className="flex items-center justify-between mb-3">
                <Link
                  href={`/clients/${property.clientId}`}
                  className="text-xs text-slate-500 hover:text-white transition-colors"
                >
                  For {property.client}
                </Link>
                {getStatusBadge(property.status)}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {property.status === "pending" && (
                  <>
                    <button className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                      <Send className="w-3 h-3" /> Approve & Send
                    </button>
                    <button className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                {property.status === "approved" && (
                  <button className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/30 transition-colors flex items-center justify-center gap-1">
                    <Send className="w-3 h-3" /> Send to Client
                  </button>
                )}
                {property.status === "sent" && (
                  <button className="flex-1 py-2 rounded-lg bg-white/5 text-slate-400 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" /> View Client Response
                  </button>
                )}
                {property.status === "flagged" && (
                  <>
                    <button className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 text-xs font-medium hover:bg-white/5 transition-colors">
                      Review Anyway
                    </button>
                    <button className="px-3 py-2 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                <button className="px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-16">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No properties found</h3>
          <p className="text-slate-400">Try adjusting your filters or wait for AI to find new matches.</p>
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
        <div>Showing {filteredProperties.length} properties</div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            {properties.filter((p) => p.status === "pending").length} pending
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {properties.filter((p) => p.status === "approved").length} approved
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            {properties.filter((p) => p.status === "sent").length} sent
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400"></span>
            {properties.filter((p) => p.status === "flagged").length} flagged
          </span>
        </div>
      </div>
    </div>
  );
}
