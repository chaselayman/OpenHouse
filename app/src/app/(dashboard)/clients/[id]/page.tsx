"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Home,
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
  Loader2,
  Save,
  X,
  Link2,
  Copy,
  Check,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Client, Property, Showing } from "@/lib/types/database";

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
  if (!price) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
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

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showings, setShowings] = useState<(Showing & { property: Property })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const getPortalLink = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/p/${clientId}`;
  };

  const copyPortalLink = async () => {
    const link = getPortalLink();
    await navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch client
      const { data: clientData, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .eq("agent_id", user.id)
        .single();

      if (error || !clientData) {
        setIsLoading(false);
        return;
      }

      setClient(clientData);
      setEditForm(clientData);

      // Fetch properties for this client (via client_properties)
      const { data: clientProperties } = await supabase
        .from("client_properties")
        .select(`
          *,
          property:properties(*)
        `)
        .eq("client_id", clientId);

      if (clientProperties) {
        setProperties(clientProperties.map((cp: { property: Property }) => cp.property).filter(Boolean));
      }

      // Fetch showings for this client
      const { data: showingsData } = await supabase
        .from("showings")
        .select(`
          *,
          property:properties(*)
        `)
        .eq("client_id", clientId)
        .order("scheduled_date", { ascending: true });

      if (showingsData) {
        setShowings(showingsData);
      }

      setIsLoading(false);
    }

    fetchData();
  }, [clientId, supabase]);

  const handleSaveEdit = async () => {
    if (!client) return;

    const { error } = await supabase
      .from("clients")
      .update({
        full_name: editForm.full_name,
        email: editForm.email,
        phone: editForm.phone,
        status: editForm.status,
        notes: editForm.notes,
      })
      .eq("id", client.id);

    if (!error) {
      setClient({ ...client, ...editForm });
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!client || !confirm("Are you sure you want to delete this client?")) return;

    const { error } = await supabase.from("clients").delete().eq("id", client.id);

    if (!error) {
      router.push("/clients");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

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

  const gradientIndex = client.full_name.charCodeAt(0) % gradients.length;

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
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradients[gradientIndex]} flex items-center justify-center text-white text-xl font-bold shadow-lg`}
            >
              {getInitials(client.full_name)}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.full_name || ""}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="text-2xl font-bold text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1 mb-1"
                />
              ) : (
                <h1 className="text-2xl font-bold text-white mb-1">{client.full_name}</h1>
              )}
              <div className="flex items-center gap-4 text-sm text-slate-400">
                {isEditing ? (
                  <>
                    <input
                      type="email"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Email"
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white"
                    />
                    <input
                      type="tel"
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      placeholder="Phone"
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-white"
                    />
                  </>
                ) : (
                  <>
                    {client.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" /> {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" /> {client.phone}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <select
                value={editForm.status || "active"}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Client["status"] })}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  client.status === "active"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : client.status === "inactive"
                    ? "bg-slate-500/10 text-slate-400"
                    : "bg-sky-500/10 text-sky-400"
                }`}
              >
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
            )}

            {isEditing ? (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="p-2 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm(client);
                  }}
                  className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg border border-white/10 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
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
                  {formatPrice(client.min_price)} - {formatPrice(client.max_price)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-1">Bedrooms</div>
                  <div className="text-white font-medium flex items-center gap-1">
                    <Bed className="w-4 h-4 text-slate-500" />
                    {client.min_beds ? `${client.min_beds}+` : "Any"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-1">Bathrooms</div>
                  <div className="text-white font-medium flex items-center gap-1">
                    <Bath className="w-4 h-4 text-slate-500" />
                    {client.min_baths ? `${client.min_baths}+` : "Any"}
                  </div>
                </div>
              </div>

              {client.locations && client.locations.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-2">Locations</div>
                  <div className="flex flex-wrap gap-1">
                    {client.locations.map((loc) => (
                      <span
                        key={loc}
                        className="px-2 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {client.property_types && client.property_types.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-2">Property Types</div>
                  <div className="flex flex-wrap gap-1">
                    {client.property_types.map((type) => (
                      <span
                        key={type}
                        className="px-2 py-1 rounded-full bg-white/5 text-slate-300 text-xs border border-white/10"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {client.must_haves && client.must_haves.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-2">Must Haves</div>
                  <div className="flex flex-wrap gap-1">
                    {client.must_haves.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {client.dealbreakers && client.dealbreakers.length > 0 && (
                <div>
                  <div className="text-xs text-slate-500 uppercase mb-2">Deal Breakers</div>
                  <div className="flex flex-wrap gap-1">
                    {client.dealbreakers.map((item) => (
                      <span
                        key={item}
                        className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes Card */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Notes</h2>
            {isEditing ? (
              <textarea
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none"
                placeholder="Add notes about this client..."
              />
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed">
                {client.notes || "No notes yet."}
              </p>
            )}
          </div>

          {/* Activity Card */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Activity</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-400">
                <span>Client since</span>
                <span className="text-white">{formatDate(client.created_at)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Last updated</span>
                <span className="text-white">{getTimeAgo(client.updated_at)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Properties matched</span>
                <span className="text-white">{properties.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Showings booked</span>
                <span className="text-white">{showings.length}</span>
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
                      <h3 className="text-sm font-medium text-white truncate">
                        {property.address}
                      </h3>
                      {property.ai_score && property.ai_score >= 80 && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {property.red_flags && property.red_flags.length > 0 && (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatPrice(property.price)} • {property.beds} bed, {property.baths} bath
                    </div>
                  </div>
                  {property.ai_score && (
                    <div className="text-right shrink-0">
                      <div
                        className={`text-sm font-bold flex items-center gap-1 ${
                          property.ai_score >= 90
                            ? "text-emerald-400"
                            : property.ai_score >= 80
                            ? "text-sky-400"
                            : "text-slate-400"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        {property.ai_score}%
                      </div>
                      <div className="text-[10px] text-slate-500">match</div>
                    </div>
                  )}
                </div>
              ))}

              {properties.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No properties matched yet. Add properties to match with this client.
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
              {showings.map((showing) => (
                <div
                  key={showing.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-white">{showing.property?.address}</h3>
                    <div className="text-xs text-slate-500">
                      {formatDate(showing.scheduled_date)} at {showing.scheduled_time}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      showing.status === "confirmed"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : showing.status === "pending"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {showing.status.charAt(0).toUpperCase() + showing.status.slice(1)}
                  </span>
                </div>
              ))}

              {showings.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No showings scheduled yet.
                </div>
              )}
            </div>
          </div>

          {/* Portal Link */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-sky-400" />
                Client Portal
              </h2>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Share this link with your client so they can view properties and schedule showings.
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-300 truncate">
                {getPortalLink()}
              </div>
              <button
                onClick={copyPortalLink}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors ${
                  copiedLink
                    ? "bg-emerald-500 text-white"
                    : "bg-sky-500 text-white hover:bg-sky-600"
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Link
                  </>
                )}
              </button>
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
