"use client";

import { useState } from "react";
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
} from "lucide-react";

// Mock data
const showings = [
  {
    id: 1,
    property: "2401 Eva St",
    address: "2401 Eva St, Austin, TX 78702",
    client: "Sarah Jenkins",
    clientId: 1,
    clientInitials: "SJ",
    clientGradient: "from-pink-500 to-rose-500",
    date: "2025-01-14",
    time: "2:00 PM",
    duration: 30,
    status: "confirmed",
    listingAgent: "John Smith",
    listingAgentPhone: "(512) 555-1234",
    notes: "Lockbox code: 1234. Enter through side gate.",
  },
  {
    id: 2,
    property: "504 Riverside Dr",
    address: "504 Riverside Dr, Austin, TX 78741",
    client: "Mike Kogan",
    clientId: 2,
    clientInitials: "MK",
    clientGradient: "from-sky-500 to-blue-500",
    date: "2025-01-15",
    time: "10:30 AM",
    duration: 45,
    status: "pending",
    listingAgent: "Jane Doe",
    listingAgentPhone: "(512) 555-5678",
    notes: "Client wants to see the pool area specifically.",
  },
  {
    id: 3,
    property: "789 Oak Lane",
    address: "789 Oak Lane, Austin, TX 78704",
    client: "Lisa Chen",
    clientId: 3,
    clientInitials: "LC",
    clientGradient: "from-emerald-500 to-green-500",
    date: "2025-01-16",
    time: "3:00 PM",
    duration: 30,
    status: "confirmed",
    listingAgent: "Bob Wilson",
    listingAgentPhone: "(512) 555-9012",
    notes: "",
  },
  {
    id: 4,
    property: "156 Sunset View",
    address: "156 Sunset View, Westlake, TX 78746",
    client: "Sarah Jenkins",
    clientId: 1,
    clientInitials: "SJ",
    clientGradient: "from-pink-500 to-rose-500",
    date: "2025-01-15",
    time: "2:00 PM",
    duration: 60,
    status: "confirmed",
    listingAgent: "Mary Johnson",
    listingAgentPhone: "(512) 555-3456",
    notes: "Premium listing. Client is very interested.",
  },
  {
    id: 5,
    property: "321 Cedar Blvd",
    address: "321 Cedar Blvd, Round Rock, TX 78681",
    client: "Mike Kogan",
    clientId: 2,
    clientInitials: "MK",
    clientGradient: "from-sky-500 to-blue-500",
    date: "2025-01-17",
    time: "11:00 AM",
    duration: 30,
    status: "cancelled",
    listingAgent: "Tom Brown",
    listingAgentPhone: "(512) 555-7890",
    notes: "Client cancelled - property went under contract.",
  },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function ShowingsPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 14)); // Jan 14, 2025
  const [view, setView] = useState<"week" | "list">("week");

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
    return showings.filter((s) => s.date === dateKey);
  };

  const isToday = (date: Date) => {
    const today = new Date(2025, 0, 14); // Mock today
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
      default:
        return null;
    }
  };

  const upcomingShowings = showings
    .filter((s) => s.status !== "cancelled")
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Showings</h1>
          <p className="text-slate-400">Manage your property showing schedule.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
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
              onClick={() => setCurrentDate(new Date(2025, 0, 14))}
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

      {view === "week" ? (
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
                <div className="text-xs text-slate-500 uppercase mb-1">{days[date.getDay()]}</div>
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
                          {showing.time}
                        </div>
                        <div className="text-slate-300 truncate">{showing.property}</div>
                        <div className="text-slate-500 truncate">{showing.client}</div>
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
                  <div className="text-lg font-bold text-white">{showing.time}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(showing.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-[10px] text-slate-600">{showing.duration} min</div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{showing.property}</h3>
                      <div className="text-sm text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {showing.address}
                      </div>
                    </div>
                    {getStatusBadge(showing.status)}
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <Link
                      href={`/clients/${showing.clientId}`}
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-br ${showing.clientGradient} flex items-center justify-center text-white text-[10px] font-bold`}
                      >
                        {showing.clientInitials}
                      </div>
                      {showing.client}
                    </Link>
                    <div className="flex items-center gap-1 text-slate-500">
                      <User className="w-3 h-3" />
                      {showing.listingAgent}
                    </div>
                    <div className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3 h-3" />
                      {showing.listingAgentPhone}
                    </div>
                  </div>

                  {showing.notes && (
                    <div className="mt-2 text-xs text-slate-500 bg-white/5 rounded p-2">
                      {showing.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button className="p-2 rounded-lg bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors">
                    <Navigation className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
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
          <div className="text-2xl font-bold text-white">
            {showings.filter((s) => s.status !== "cancelled").length}
          </div>
          <div className="text-xs text-slate-500">This Week</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-400">
            {showings.filter((s) => s.status === "cancelled").length}
          </div>
          <div className="text-xs text-slate-500">Cancelled</div>
        </div>
      </div>
    </div>
  );
}
