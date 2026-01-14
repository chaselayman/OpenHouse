"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Home,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";

// Mock client data
const clientsData: Record<string, {
  id: number;
  name: string;
  email: string;
  phone: string;
  initials: string;
  gradient: string;
  status: string;
  createdAt: string;
  lastActive: string;
  criteria: {
    priceMin: number;
    priceMax: number;
    beds: string;
    baths: string;
    locations: string[];
    propertyTypes: string[];
    mustHaves: string[];
  };
  timeline: string;
  notes: string;
}> = {
  "1": {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah.jenkins@email.com",
    phone: "(512) 555-0123",
    initials: "SJ",
    gradient: "from-pink-500 to-rose-500",
    status: "active",
    createdAt: "Jan 5, 2025",
    lastActive: "2 hours ago",
    criteria: {
      priceMin: 500000,
      priceMax: 650000,
      beds: "3+",
      baths: "2+",
      locations: ["South Austin", "East Austin"],
      propertyTypes: ["Single Family"],
      mustHaves: ["Home Office", "Large Backyard", "Updated Kitchen"],
    },
    timeline: "3-6 months",
    notes: "First-time buyer. Works from home so needs dedicated office space. Has two kids, school district is important.",
  },
  "2": {
    id: 2,
    name: "Mike Kogan",
    email: "mike.kogan@email.com",
    phone: "(512) 555-0456",
    initials: "MK",
    gradient: "from-sky-500 to-blue-500",
    status: "searching",
    createdAt: "Jan 8, 2025",
    lastActive: "1 day ago",
    criteria: {
      priceMin: 600000,
      priceMax: 800000,
      beds: "4+",
      baths: "3+",
      locations: ["North Austin", "Round Rock", "Cedar Park"],
      propertyTypes: ["Single Family"],
      mustHaves: ["Pool", "3-car Garage", "Large Lot"],
    },
    timeline: "1-3 months",
    notes: "Relocating for work. Needs to be close to Domain area. Pre-approved for $850k.",
  },
  "3": {
    id: 3,
    name: "Lisa Chen",
    email: "lisa.chen@email.com",
    phone: "(512) 555-0789",
    initials: "LC",
    gradient: "from-emerald-500 to-green-500",
    status: "active",
    createdAt: "Dec 28, 2024",
    lastActive: "5 hours ago",
    criteria: {
      priceMin: 350000,
      priceMax: 500000,
      beds: "2+",
      baths: "2+",
      locations: ["Downtown", "East Austin"],
      propertyTypes: ["Condo", "Townhouse"],
      mustHaves: ["Walkable", "Modern", "Parking"],
    },
    timeline: "ASAP",
    notes: "Young professional. Wants to be close to downtown nightlife and restaurants. Works at tech company on Congress.",
  },
};

const propertiesData = [
  {
    id: 1,
    clientId: 1,
    address: "2401 Eva St",
    price: 625000,
    beds: 3,
    baths: 2,
    match: 94,
    status: "approved",
    image: "https://images.unsplash.com/photo-1600596542815-27b88e54e60d?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 2,
    clientId: 1,
    address: "1822 Maple Ave",
    price: 595000,
    beds: 3,
    baths: 2,
    match: 78,
    status: "flagged",
    image: "https://images.unsplash.com/photo-1574872956277-27038e23f044?auto=format&fit=crop&q=80&w=400",
  },
  {
    id: 6,
    clientId: 1,
    address: "156 Sunset View",
    price: 825000,
    beds: 4,
    baths: 3.5,
    match: 85,
    status: "sent",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&q=80&w=400",
  },
];

const showingsData = [
  {
    id: 1,
    clientId: 1,
    property: "2401 Eva St",
    date: "Today",
    time: "2:00 PM",
    status: "confirmed",
  },
  {
    id: 2,
    clientId: 1,
    property: "156 Sunset View",
    date: "Tomorrow",
    time: "10:30 AM",
    status: "pending",
  },
  {
    id: 3,
    clientId: 1,
    property: "789 Oak Lane",
    date: "Thu, Jan 16",
    time: "3:00 PM",
    status: "confirmed",
  },
];

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const client = clientsData[clientId];

  if (!client) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-bold text-white mb-2">Client not found</h2>
          <Link href="/clients" className="text-sky-400 hover:text-sky-300">
            Back to clients
          </Link>
        </div>
      </div>
    );
  }

  const clientProperties = propertiesData.filter((p) => p.clientId === client.id);
  const clientShowings = showingsData.filter((s) => s.clientId === client.id);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${client.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
            >
              {client.initials}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{client.name}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> {client.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {client.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                client.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-sky-500/10 text-sky-400"
              }`}
            >
              {client.status === "active" ? "Active" : "Searching"}
            </span>
            <button className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 transition-colors">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Search Criteria */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Criteria Card */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Home className="w-5 h-5 text-sky-400" />
              Search Criteria
            </h2>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">Price Range</div>
                <div className="text-white font-medium flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  ${client.criteria.priceMin.toLocaleString()} - ${client.criteria.priceMax.toLocaleString()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-1">Bedrooms</div>
                  <div className="text-white font-medium flex items-center gap-1">
                    <Bed className="w-4 h-4 text-slate-500" />
                    {client.criteria.beds}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-1">Bathrooms</div>
                  <div className="text-white font-medium flex items-center gap-1">
                    <Bath className="w-4 h-4 text-slate-500" />
                    {client.criteria.baths}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 uppercase mb-2">Locations</div>
                <div className="flex flex-wrap gap-1">
                  {client.criteria.locations.map((loc) => (
                    <span
                      key={loc}
                      className="px-2 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 uppercase mb-2">Property Types</div>
                <div className="flex flex-wrap gap-1">
                  {client.criteria.propertyTypes.map((type) => (
                    <span
                      key={type}
                      className="px-2 py-1 rounded-full bg-white/5 text-slate-300 text-xs border border-white/10"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 uppercase mb-2">Must Haves</div>
                <div className="flex flex-wrap gap-1">
                  {client.criteria.mustHaves.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500 uppercase mb-1">Timeline</div>
                <div className="text-white font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-500" />
                  {client.timeline}
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{client.notes}</p>
          </div>

          {/* Activity Card */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Client since</span>
                <span className="text-white">{client.createdAt}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Last active</span>
                <span className="text-white">{client.lastActive}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Properties viewed</span>
                <span className="text-white">{clientProperties.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Showings booked</span>
                <span className="text-white">{clientShowings.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Properties & Showings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Matched Properties */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Matched Properties
              </h2>
              <Link
                href="/properties"
                className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                View all <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {clientProperties.map((property) => (
                <div
                  key={property.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    property.status === "flagged"
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url(${property.image})` }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white truncate">
                        {property.address}
                      </h3>
                      {property.status === "approved" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {property.status === "flagged" && (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      {property.status === "sent" && (
                        <Send className="w-4 h-4 text-sky-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      ${property.price.toLocaleString()} • {property.beds} bed, {property.baths} bath
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-bold flex items-center gap-1 ${
                        property.match >= 90
                          ? "text-emerald-400"
                          : property.match >= 80
                          ? "text-sky-400"
                          : "text-slate-400"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {property.match}%
                    </div>
                    <div className="text-[10px] text-slate-500">match</div>
                  </div>
                </div>
              ))}

              {clientProperties.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No properties matched yet. AI is searching...
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Showings */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                Upcoming Showings
              </h2>
              <button className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Schedule
              </button>
            </div>

            <div className="space-y-3">
              {clientShowings.map((showing) => (
                <div
                  key={showing.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">{showing.property}</h3>
                    <div className="text-xs text-slate-500">
                      {showing.date} at {showing.time}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      showing.status === "confirmed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}
                  >
                    {showing.status === "confirmed" ? "Confirmed" : "Pending"}
                  </span>
                </div>
              ))}

              {clientShowings.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No showings scheduled yet.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center">
              <Send className="w-5 h-5 text-sky-400 mx-auto mb-2" />
              <span className="text-sm text-white">Send Properties</span>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center">
              <Calendar className="w-5 h-5 text-violet-400 mx-auto mb-2" />
              <span className="text-sm text-white">Schedule Showing</span>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-center">
              <Mail className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <span className="text-sm text-white">Send Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
