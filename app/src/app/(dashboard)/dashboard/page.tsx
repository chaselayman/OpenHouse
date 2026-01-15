"use client";

import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Client, Property, Showing, Profile } from "@/lib/types/database";

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

function formatPrice(price: number | null) {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function formatShowingTime(date: string, time: string) {
  const showingDate = new Date(`${date}T${time}`);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = showingDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (showingDate.toDateString() === today.toDateString()) {
    return `Today, ${timeStr}`;
  } else if (showingDate.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${timeStr}`;
  } else {
    return `${showingDate.toLocaleDateString("en-US", { weekday: "short" })}, ${timeStr}`;
  }
}

export default function DashboardPage() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showings, setShowings] = useState<(Showing & { client: Client; property: Property })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      // Fetch clients
      const { data: clientsData } = await supabase
        .from("clients")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setClients(clientsData || []);

      // Fetch properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setProperties(propertiesData || []);

      // Fetch upcoming showings with client and property info
      const { data: showingsData } = await supabase
        .from("showings")
        .select(`
          *,
          client:clients(*),
          property:properties(*)
        `)
        .eq("agent_id", user.id)
        .gte("scheduled_date", new Date().toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })
        .limit(3);
      setShowings(showingsData || []);

      setIsLoading(false);
    }

    fetchData();
  }, [supabase]);

  const activeClients = clients.filter((c) => c.status === "active").length;
  const analyzedProperties = properties.filter((p) => p.ai_score !== null).length;
  const weekShowings = showings.length;

  const stats = [
    { label: "Active Clients", value: activeClients.toString(), change: `of ${clients.length}`, icon: Users, color: "sky" },
    { label: "Properties", value: properties.length.toString(), change: `${analyzedProperties} analyzed`, icon: Home, color: "emerald" },
    { label: "Upcoming Showings", value: weekShowings.toString(), change: "scheduled", icon: Calendar, color: "violet" },
    { label: "Time Saved", value: `${clients.length * 4}h`, change: "estimated", icon: Clock, color: "amber" },
  ];

  const firstName = profile?.full_name?.split(" ")[0] || "there";

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
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back, {firstName}</h1>
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
          {clients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-4">No clients yet</p>
              <Link
                href="/clients/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add your first client
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client, index) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                  >
                    {getInitials(client.full_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{client.full_name}</div>
                    <div className="text-xs text-slate-500">
                      {client.locations?.join(", ") || "No locations set"}
                    </div>
                  </div>
                  <div
                    className={`text-xs px-2 py-1 rounded-full ${
                      client.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : client.status === "inactive"
                        ? "bg-slate-500/10 text-slate-400"
                        : "bg-sky-500/10 text-sky-400"
                    }`}
                  >
                    {client.status}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Properties */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Properties</h2>
            <Link href="/properties" className="text-sm text-sky-400 hover:text-sky-300 flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {properties.length === 0 ? (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm mb-2">No properties yet</p>
              <p className="text-slate-500 text-xs">Properties will appear here once you add them or connect MLS</p>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                    property.red_flags && property.red_flags.length > 0
                      ? "border-red-500/20 bg-red-500/5"
                      : "border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div
                    className="w-16 h-16 rounded-lg bg-slate-800 bg-cover bg-center shrink-0 flex items-center justify-center"
                    style={property.photos?.[0] ? { backgroundImage: `url(${property.photos[0]})` } : {}}
                  >
                    {!property.photos?.[0] && <Home className="w-6 h-6 text-slate-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white truncate">{property.address}</h3>
                      {property.ai_score && property.ai_score >= 80 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {property.red_flags && property.red_flags.length > 0 && (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mb-1">
                      {formatPrice(property.price)} • {property.beds} bed, {property.baths} bath
                    </div>
                    {property.red_flags && property.red_flags.length > 0 && (
                      <div className="text-xs text-red-400 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {property.red_flags[0]}
                      </div>
                    )}
                  </div>
                  {property.ai_score && (
                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-bold flex items-center gap-1 ${
                          property.ai_score >= 90
                            ? "text-emerald-400"
                            : property.ai_score >= 80
                            ? "text-sky-400"
                            : property.ai_score >= 60
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {property.ai_score}%
                      </div>
                      <div className="text-xs text-slate-500">AI score</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
        {showings.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No upcoming showings</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {showings.map((showing) => (
              <div
                key={showing.id}
                className="p-4 rounded-lg border border-white/10 bg-white/5 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-medium text-white">
                    {formatShowingTime(showing.scheduled_date, showing.scheduled_time)}
                  </span>
                </div>
                <div className="text-sm text-slate-300 mb-1">{showing.property?.address}</div>
                <div className="text-xs text-slate-500">with {showing.client?.full_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Activity Banner */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-violet-500/10 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-white mb-0.5">AI is ready to work for you</h3>
            <p className="text-xs text-slate-400">
              {properties.length > 0
                ? `${analyzedProperties} of ${properties.length} properties analyzed. Add more properties to analyze.`
                : "Add properties to get AI-powered analysis and red flag detection."}
            </p>
          </div>
          <Link
            href="/properties"
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            {properties.length > 0 ? "Review Properties" : "Add Properties"}
          </Link>
        </div>
      </div>
    </div>
  );
}
