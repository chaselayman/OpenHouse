"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Navigation,
  MoreHorizontal,
  X,
  Loader2,
  Home,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Showing, Client, Property } from "@/lib/types/database";

type ShowingWithDetails = Showing & {
  client: Client;
  property: Property;
};

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const clientGradients = [
  "from-pink-500 to-rose-500",
  "from-sky-500 to-blue-500",
  "from-emerald-500 to-green-500",
  "from-amber-500 to-orange-500",
  "from-purple-500 to-violet-500",
  "from-cyan-500 to-teal-500",
];

function getClientGradient(clientId: string): string {
  const hash = clientId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return clientGradients[hash % clientGradients.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ShowingsPage() {
  const [showings, setShowings] = useState<ShowingWithDetails[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "list">("week");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    client_id: "",
    property_id: "",
    scheduled_date: "",
    scheduled_time: "",
    duration_minutes: 30,
    notes: "",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch showings with client and property data
      const { data: showingsData, error: showingsError } = await supabase
        .from("showings")
        .select(
          `
          *,
          client:clients(*),
          property:properties(*)
        `
        )
        .eq("agent_id", user.id)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (showingsError) throw showingsError;

      // Fetch clients for the dropdown
      const { data: clientsData } = await supabase
        .from("clients")
        .select("*")
        .eq("agent_id", user.id)
        .eq("status", "active")
        .order("full_name");

      // Fetch properties for the dropdown
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*")
        .eq("agent_id", user.id)
        .in("status", ["active", "pending"])
        .order("address");

      setShowings((showingsData as ShowingWithDetails[]) || []);
      setClients(clientsData || []);
      setProperties(propertiesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      // Use the new scheduling API which handles ShowingTime + Google Calendar
      const response = await fetch("/api/showings/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: formData.property_id,
          clientId: formData.client_id,
          date: formData.scheduled_date,
          time: formData.scheduled_time,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to schedule showing");
      }

      setShowModal(false);
      setFormData({
        client_id: "",
        property_id: "",
        scheduled_date: "",
        scheduled_time: "",
        duration_minutes: 30,
        notes: "",
      });
      fetchData();
    } catch (error) {
      console.error("Error creating showing:", error);
      alert(error instanceof Error ? error.message : "Failed to schedule showing. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function updateShowingStatus(
    showingId: string,
    status: "confirmed" | "cancelled"
  ) {
    try {
      // Use API endpoint to handle calendar event cancellation
      const response = await fetch(`/api/showings/${showingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update showing");
      }

      fetchData();
    } catch (error) {
      console.error("Error updating showing:", error);
      alert(error instanceof Error ? error.message : "Failed to update showing");
    }
  }

  const getWeekDates = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const formatDateKey = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const getShowingsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return showings.filter((s) => s.scheduled_date === dateKey);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const prevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Confirmed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-500/10 text-sky-400">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case "no_show":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400">
            <XCircle className="w-3 h-3" /> No Show
          </span>
        );
      default:
        return null;
    }
  };

  const upcomingShowings = showings
    .filter((s) => s.status !== "cancelled")
    .sort((a, b) => {
      const dateA = new Date(`${a.scheduled_date} ${a.scheduled_time}`);
      const dateB = new Date(`${b.scheduled_date} ${b.scheduled_time}`);
      return dateA.getTime() - dateB.getTime();
    });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Showings</h1>
          <p className="text-slate-400">Manage your property showing schedule.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" />
          Schedule Showing
        </button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-white">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevWeek}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextWeek}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-400 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-2"
            >
              Today
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setView("week")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "week" ? "bg-white text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              view === "list" ? "bg-white text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {showings.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No showings scheduled</h3>
          <p className="text-slate-400 mb-6">
            Schedule your first showing to see it on the calendar.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Schedule Showing
          </button>
        </div>
      ) : view === "week" ? (
        /* Week View */
        <div className="glass-card rounded-xl overflow-hidden">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-white/10">
            {weekDates.map((date, i) => (
              <div
                key={i}
                className={`p-4 text-center border-r border-white/5 last:border-r-0 ${
                  isToday(date) ? "bg-sky-500/10" : ""
                }`}
              >
                <div className="text-xs text-slate-500 uppercase mb-1">
                  {days[date.getDay()]}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    isToday(date) ? "text-sky-400" : "text-white"
                  }`}
                >
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Day Content */}
          <div className="grid grid-cols-7 min-h-[500px]">
            {weekDates.map((date, i) => {
              const dayShowings = getShowingsForDate(date);
              return (
                <div
                  key={i}
                  className={`p-2 border-r border-white/5 last:border-r-0 ${
                    isToday(date) ? "bg-sky-500/5" : ""
                  }`}
                >
                  <div className="space-y-2">
                    {dayShowings.map((showing) => (
                      <div
                        key={showing.id}
                        className={`p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          showing.status === "cancelled"
                            ? "bg-red-500/10 border border-red-500/20 opacity-50"
                            : showing.status === "confirmed"
                              ? "bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
                        }`}
                      >
                        <div className="font-medium text-white mb-1 truncate">
                          {showing.scheduled_time}
                        </div>
                        <div className="text-slate-300 truncate">
                          {showing.property?.address || "Unknown Property"}
                        </div>
                        <div className="text-slate-500 truncate">
                          {showing.client?.full_name || "Unknown Client"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
          {upcomingShowings.map((showing) => (
            <div
              key={showing.id}
              className={`glass-card rounded-xl p-4 ${
                showing.status === "cancelled" ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Time Block */}
                <div className="w-20 shrink-0 text-center">
                  <div className="text-lg font-bold text-white">
                    {showing.scheduled_time}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(showing.scheduled_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {showing.duration_minutes} min
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">
                        {showing.property?.address || "Unknown Property"}
                      </h3>
                      <div className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {showing.property?.city}, {showing.property?.state}{" "}
                        {showing.property?.zip}
                      </div>
                    </div>
                    {getStatusBadge(showing.status)}
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <Link
                      href={`/clients/${showing.client_id}`}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${getClientGradient(showing.client_id)} flex items-center justify-center text-white text-[10px] font-bold`}
                      >
                        {getInitials(showing.client?.full_name || "?")}
                      </div>
                      {showing.client?.full_name || "Unknown Client"}
                    </Link>
                    {showing.property?.listing_agent_name && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <User className="w-3 h-3" />
                        {showing.property.listing_agent_name}
                      </div>
                    )}
                    {showing.property?.listing_agent_phone && (
                      <div className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3 h-3" />
                        {showing.property.listing_agent_phone}
                      </div>
                    )}
                  </div>

                  {showing.notes && (
                    <div className="mt-2 text-xs text-slate-500 bg-white/5 rounded p-2">
                      {showing.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {showing.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateShowingStatus(showing.id, "confirmed")}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                        title="Confirm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateShowingStatus(showing.id, "cancelled")}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors">
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {showings.filter((s) => s.status === "confirmed").length}
          </div>
          <div className="text-xs text-slate-500">Confirmed</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {showings.filter((s) => s.status === "pending").length}
          </div>
          <div className="text-xs text-slate-500">Pending</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-sky-400">
            {showings.filter((s) => s.status === "completed").length}
          </div>
          <div className="text-xs text-slate-500">Completed</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {showings.filter((s) => s.status === "cancelled").length}
          </div>
          <div className="text-xs text-slate-500">Cancelled</div>
        </div>
      </div>

      {/* Schedule Showing Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Schedule Showing</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Client *
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) =>
                    setFormData({ ...formData, client_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.full_name}
                    </option>
                  ))}
                </select>
                {clients.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">
                    No active clients.{" "}
                    <Link href="/clients/new" className="underline">
                      Add a client first
                    </Link>
                  </p>
                )}
              </div>

              {/* Property Select */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Property *
                </label>
                <select
                  value={formData.property_id}
                  onChange={(e) =>
                    setFormData({ ...formData, property_id: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                  required
                >
                  <option value="">Select a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.address} - ${property.price?.toLocaleString() || "N/A"}
                    </option>
                  ))}
                </select>
                {properties.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">
                    No active properties.{" "}
                    <Link href="/properties" className="underline">
                      Add a property first
                    </Link>
                  </p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.scheduled_time}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduled_time: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration_minutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                  rows={3}
                  placeholder="Lockbox code, special instructions, etc."
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || clients.length === 0 || properties.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Schedule Showing
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
