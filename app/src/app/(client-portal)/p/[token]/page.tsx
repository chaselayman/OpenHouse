"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Bed,
  Bath,
  Square,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Clock,
  CheckCircle2,
  ThumbsDown,
  Home,
  DollarSign,
  MapPin,
  Ruler,
  Car,
  TreePine,
  MessageSquare,
  ExternalLink,
} from "lucide-react";

interface Property {
  id: string;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  price: number | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  photos: string[] | null;
  description: string | null;
  highlights: string[] | null;
  mls_id: string | null;
  listing_url: string | null;
}

interface ClientProperty {
  id: string;
  property_id: string;
  status: string;
  property: Property;
}

interface Showing {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  property: Property;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
  duration: number;
  unavailableReason?: string;
}

interface ClientData {
  id: string;
  full_name: string;
  agent_name: string;
  agent_phone: string | null;
}

const REJECTION_REASONS = [
  { id: "price_high", label: "Price too high", icon: DollarSign },
  { id: "location", label: "Don't like the location", icon: MapPin },
  { id: "too_small", label: "Too small", icon: Ruler },
  { id: "not_enough_beds", label: "Not enough bedrooms", icon: Bed },
  { id: "not_enough_baths", label: "Not enough bathrooms", icon: Bath },
  { id: "no_garage", label: "No garage/parking", icon: Car },
  { id: "no_yard", label: "No yard/outdoor space", icon: TreePine },
  { id: "style", label: "Don't like the style", icon: Home },
];

export default function ClientPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<ClientData | null>(null);
  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [showings, setShowings] = useState<Showing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customFeedback, setCustomFeedback] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const BATCH_SIZE = 5;

  useEffect(() => {
    fetchClientData();
  }, [token]);

  async function fetchClientData() {
    try {
      const response = await fetch(`/api/client-portal/${token}`);
      if (!response.ok) {
        throw new Error("Invalid or expired link");
      }
      const data = await response.json();
      setClient(data.client);
      // Filter to only show pending/suggested properties (not already reviewed)
      const pendingProperties = data.properties.filter(
        (p: ClientProperty) => p.status === "suggested" || p.status === "viewed"
      );
      setProperties(pendingProperties);
      setShowings(data.showings);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailableSlots(propertyId: string, date: string) {
    setLoadingSlots(true);
    setAvailableSlots([]);
    try {
      const response = await fetch(
        `/api/client-portal/${token}/schedule?propertyId=${propertyId}&date=${date}`
      );
      if (response.ok) {
        const data = await response.json();
        // Filter to only show available slots for the selected date
        const slotsForDate = (data.slots || []).filter(
          (slot: TimeSlot) => slot.date === date
        );
        setAvailableSlots(slotsForDate);
      } else {
        console.error("Failed to fetch slots:", await response.text());
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Failed to fetch available slots:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }

  async function handleScheduleShowing() {
    const currentProperty = properties[currentIndex];
    if (!currentProperty || !selectedDate || !selectedTime) return;

    setScheduling(true);
    try {
      const response = await fetch(`/api/client-portal/${token}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: currentProperty.property.id,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to schedule showing");
      }

      // Mark as interested and move to next
      await handlePropertyAction("interested");
      setShowScheduleModal(false);
      setSelectedDate("");
      setSelectedTime("");
      setAvailableSlots([]);
      fetchClientData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to schedule");
    } finally {
      setScheduling(false);
    }
  }

  async function handlePropertyAction(action: "interested" | "rejected", reasons?: string[], feedback?: string) {
    const currentProperty = properties[currentIndex];
    if (!currentProperty) return;

    setSubmitting(true);
    try {
      await fetch(`/api/client-portal/${token}/properties/${currentProperty.property.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action,
          rejection_reasons: reasons,
          client_notes: feedback,
        }),
      });

      // Move to next property
      setCurrentPhotoIndex(0);
      if (currentIndex < properties.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Refresh to get more properties or show empty state
        fetchClientData();
        setCurrentIndex(0);
      }

      // Reset rejection modal state
      setShowRejectModal(false);
      setSelectedReasons([]);
      setCustomFeedback("");
    } catch (err) {
      console.error("Failed to update property status:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function handleReject() {
    setShowRejectModal(true);
  }

  function submitRejection() {
    handlePropertyAction("rejected", selectedReasons, customFeedback);
  }

  function toggleReason(reasonId: string) {
    setSelectedReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((r) => r !== reasonId)
        : [...prev, reasonId]
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Link Not Valid</h1>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const upcomingShowings = showings.filter(
    (s) => s.status !== "cancelled" && s.status !== "completed"
  );

  const currentProperty = properties[currentIndex];
  const remainingInBatch = Math.min(BATCH_SIZE, properties.length) - currentIndex;

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Welcome */}
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-white mb-1">
          Hi {client?.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-sm text-slate-400">
          Review properties from {client?.agent_name}
        </p>
      </div>

      {/* Progress indicator */}
      {properties.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>{remainingInBatch} of {Math.min(BATCH_SIZE, properties.length)} remaining</span>
            <span>{properties.length} total to review</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / Math.min(BATCH_SIZE, properties.length)) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Upcoming Showings (collapsed) */}
      {upcomingShowings.length > 0 && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{upcomingShowings.length} showing{upcomingShowings.length > 1 ? 's' : ''} scheduled</span>
          </div>
        </div>
      )}

      {/* Property Card */}
      {properties.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">All caught up!</h2>
          <p className="text-slate-400 text-sm">
            No new properties to review. Check back soon!
          </p>
        </div>
      ) : currentProperty ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          {/* Photo Gallery */}
          <div className="flex gap-1">
            {/* Main Photo */}
            <div className="relative flex-1 aspect-[4/3] bg-slate-800">
              {currentProperty.property.photos?.[currentPhotoIndex] ? (
                <img
                  src={currentProperty.property.photos[currentPhotoIndex]}
                  alt={currentProperty.property.address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Home className="w-16 h-16" />
                </div>
              )}

              {/* Photo navigation arrows */}
              {currentProperty.property.photos && currentProperty.property.photos.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentPhotoIndex((i) =>
                      i === 0 ? currentProperty.property.photos!.length - 1 : i - 1
                    )}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPhotoIndex((i) =>
                      i === currentProperty.property.photos!.length - 1 ? 0 : i + 1
                    )}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {currentProperty.property.photos && currentProperty.property.photos.length > 1 && (
              <div className="w-20 flex flex-col gap-1">
                {currentProperty.property.photos.slice(0, 3).map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPhotoIndex(i)}
                    className={`relative flex-1 bg-slate-800 overflow-hidden transition-all ${
                      i === currentPhotoIndex ? 'ring-2 ring-sky-500' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={photo}
                      alt={`${currentProperty.property.address} - Photo ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Show "+X more" on last thumbnail if more photos exist */}
                    {i === 2 && currentProperty.property.photos!.length > 3 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          +{currentProperty.property.photos!.length - 3}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-white">
                  ${currentProperty.property.price?.toLocaleString() || "N/A"}
                </p>
                <p className="text-sm text-slate-300">{currentProperty.property.address}</p>
                <p className="text-xs text-slate-500">
                  {currentProperty.property.city}, {currentProperty.property.state}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-300 mb-4">
              {currentProperty.property.beds && (
                <span className="flex items-center gap-1">
                  <Bed className="w-4 h-4" /> {currentProperty.property.beds}
                </span>
              )}
              {currentProperty.property.baths && (
                <span className="flex items-center gap-1">
                  <Bath className="w-4 h-4" /> {currentProperty.property.baths}
                </span>
              )}
              {currentProperty.property.sqft && (
                <span className="flex items-center gap-1">
                  <Square className="w-4 h-4" /> {currentProperty.property.sqft.toLocaleString()}
                </span>
              )}
            </div>

            {/* Highlights */}
            {currentProperty.property.highlights && currentProperty.property.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {currentProperty.property.highlights.slice(0, 3).map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}

            {/* Description preview */}
            {currentProperty.property.description && (
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                {currentProperty.property.description}
              </p>
            )}

            {/* View Full Listing Link */}
            {currentProperty.property.listing_url && (
              <a
                href={currentProperty.property.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Full Listing
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-4 pt-0 flex items-center gap-3">
            <button
              onClick={handleReject}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-red-500/10 text-red-400 font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition-colors disabled:opacity-50"
            >
              <ThumbsDown className="w-5 h-5" />
              Pass
            </button>
            <button
              onClick={() => setShowScheduleModal(true)}
              disabled={submitting}
              className="flex-1 py-3.5 rounded-xl bg-sky-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-sky-600 transition-colors disabled:opacity-50"
            >
              <Calendar className="w-5 h-5" />
              Tour
            </button>
          </div>
        </div>
      ) : null}

      {/* Rejection Reasons Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">What didn't you like?</h2>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedReasons([]);
                    setCustomFeedback("");
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Help us find better matches for you
              </p>
            </div>

            <div className="p-4 overflow-y-auto max-h-[50vh]">
              <div className="grid grid-cols-2 gap-2">
                {REJECTION_REASONS.map((reason) => {
                  const Icon = reason.icon;
                  const isSelected = selectedReasons.includes(reason.id);
                  return (
                    <button
                      key={reason.id}
                      onClick={() => toggleReason(reason.id)}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2 transition-colors ${
                        isSelected
                          ? "bg-red-500/10 border-red-500/30 text-red-400"
                          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-sm">{reason.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  Other feedback (optional)
                </label>
                <textarea
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="Tell us more..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 resize-none"
                  rows={2}
                />
              </div>
            </div>

            <div className="p-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedReasons([]);
                  setCustomFeedback("");
                }}
                className="flex-1 py-3 rounded-xl bg-white/5 text-slate-400 font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ThumbsDown className="w-4 h-4" />
                    Pass on this one
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && currentProperty && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Schedule a Tour</h2>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedDate("");
                  setSelectedTime("");
                  setAvailableSlots([]);
                }}
                className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-400 mb-6">{currentProperty.property.address}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                    if (e.target.value && currentProperty) {
                      fetchAvailableSlots(currentProperty.property.id, e.target.value);
                    }
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Available Times
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
                      <span className="ml-2 text-slate-400">Checking availability...</span>
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {availableSlots.map((slot) => {
                        const hour = parseInt(slot.time.split(":")[0]);
                        const displayHour = hour > 12 ? hour - 12 : hour;
                        const ampm = hour >= 12 ? "PM" : "AM";
                        const displayTime = `${displayHour}:00 ${ampm}`;

                        return (
                          <button
                            key={slot.time}
                            onClick={() => slot.available && setSelectedTime(slot.time)}
                            disabled={!slot.available}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              selectedTime === slot.time
                                ? "bg-sky-500 text-white"
                                : slot.available
                                ? "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                : "bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed line-through"
                            }`}
                            title={
                              !slot.available
                                ? slot.unavailableReason === "agent_busy"
                                  ? "Agent unavailable"
                                  : "Not available"
                                : undefined
                            }
                          >
                            {displayTime}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 py-2">
                      No available times for this date. Please try another date.
                    </p>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleScheduleShowing}
              disabled={!selectedDate || !selectedTime || scheduling}
              className="w-full mt-6 py-3 rounded-xl bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {scheduling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" />
                  Request Tour
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center mt-4">
              Times shown are available based on listing and agent schedule
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
