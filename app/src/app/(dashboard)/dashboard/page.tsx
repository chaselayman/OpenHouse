"use client";

import {
  Users,
  Home,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  ArrowRight,
  Eye,
} from "lucide-react";
import Link from "next/link";

// Mock data
const stats = [
  { label: "Active Clients", value: "3", change: "+1", icon: Users, color: "sky" },
  { label: "Properties Analyzed", value: "47", change: "+12", icon: Home, color: "emerald" },
  { label: "Showings This Week", value: "8", change: "+3", icon: Calendar, color: "violet" },
  { label: "Time Saved", value: "14h", change: "this month", icon: Clock, color: "amber" },
];

const recentClients = [
  { id: 1, name: "Sarah Jenkins", initials: "SJ", status: "active", properties: 12, showings: 3, gradient: "from-pink-500 to-rose-500" },
  { id: 2, name: "Mike Kogan", initials: "MK", status: "searching", properties: 8, showings: 0, gradient: "from-sky-500 to-blue-500" },
  { id: 3, name: "Lisa Chen", initials: "LC", status: "active", properties: 15, showings: 2, gradient: "from-emerald-500 to-green-500" },
];

const recentProperties = [
  {
    id: 1,
    address: "2401 Eva St",
    price: "$625,000",
    match: 94,
    client: "Sarah Jenkins",
    image: "https://images.unsplash.com/photo-1600596542815-27b88e54e60d?auto=format&fit=crop&q=80&w=400",
    status: "approved",
  },
  {
    id: 2,
    address: "1822 Maple Ave",
    price: "$595,000",
    match: 78,
    client: "Sarah Jenkins",
    image: "https://images.unsplash.com/photo-1574872956277-27038e23f044?auto=format&fit=crop&q=80&w=400",
    status: "flagged",
    flag: "Water damage detected",
  },
  {
    id: 3,
    address: "504 Riverside Dr",
    price: "$699,000",
    match: 88,
    client: "Mike Kogan",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400",
    status: "pending",
  },
];

const upcomingShowings = [
  { id: 1, property: "2401 Eva St", client: "Sarah Jenkins", time: "Today, 2:00 PM" },
  { id: 2, property: "504 Riverside Dr", client: "Mike Kogan", time: "Tomorrow, 10:30 AM" },
  { id: 3, property: "789 Oak Lane", client: "Lisa Chen", time: "Thu, 3:00 PM" },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back, John</h1>
          <p className="text-slate-400">Here&apos;s what&apos;s happening with your clients today.</p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass-card rounded-xl p-5 hover:-translate-y-0.5 transition-transform"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.color === "sky"
                    ? "bg-sky-500/20 text-sky-400"
                    : stat.color === "emerald"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : stat.color === "violet"
                    ? "bg-violet-500/20 text-violet-400"
                    : "bg-amber-500/20 text-amber-400"
                }`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.color === "sky"
                    ? "bg-sky-500/10 text-sky-400"
                    : stat.color === "emerald"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : stat.color === "violet"
                    ? "bg-violet-500/10 text-violet-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Clients */}
        <div className="lg:col-span-1 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Active Clients</h2>
            <Link href="/clients" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentClients.map((client) => (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${client.gradient} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                >
                  {client.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{client.name}</div>
                  <div className="text-xs text-slate-500">
                    {client.properties} properties • {client.showings} showings
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded-full ${
                    client.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-sky-500/10 text-sky-400"
                  }`}
                >
                  {client.status === "active" ? "Active" : "Searching"}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Properties */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Properties</h2>
            <Link href="/properties" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentProperties.map((property) => (
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
                    <h3 className="text-sm font-medium text-white truncate">{property.address}</h3>
                    {property.status === "approved" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {property.status === "flagged" && (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mb-1">
                    {property.price} • For {property.client}
                  </div>
                  {property.flag && (
                    <div className="text-xs text-red-400 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {property.flag}
                    </div>
                  )}
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
                  <div className="text-xs text-slate-500">match</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Showings */}
      <div className="mt-6 glass-card rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Upcoming Showings</h2>
          <Link href="/showings" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
            View calendar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {upcomingShowings.map((showing) => (
            <div
              key={showing.id}
              className="p-4 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-white">{showing.time}</span>
              </div>
              <div className="text-sm text-slate-300 mb-1">{showing.property}</div>
              <div className="text-xs text-slate-500">with {showing.client}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Activity Banner */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-violet-500/10 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-0.5">AI is working for you</h3>
            <p className="text-xs text-slate-400">
              Currently analyzing 23 new listings for your clients. 4 potential matches found.
            </p>
          </div>
          <Link
            href="/properties"
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Review Matches
          </Link>
        </div>
      </div>
    </div>
  );
}
