"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  CheckCircle2,
  Eye,
  Trash2,
  Home,
  Bed,
  Bath,
  Square,
  Plus,
  Loader2,
  X,
  Info,
  TrendingUp,
  MapPin,
  Wrench,
  DollarSign,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Property } from "@/lib/types/database";

interface AnalysisResult {
  summary: string;
  priceAnalysis: string;
  locationNotes: string;
  conditionAssessment: string;
  investmentPotential: string;
  recommendations: string[];
}

function formatPrice(price: number | null) {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertiesPage() {
  const supabase = createClient();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProperty, setNewProperty] = useState({
    address: "",
    city: "",
    state: "OK",
    zip: "",
    price: "",
    beds: "",
    baths: "",
    sqft: "",
    mls_id: "",
    description: "",
  });

  // Fetch properties
  const fetchProperties = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: propertiesData } = await supabase
      .from("properties")
      .select("*")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });

    setProperties(propertiesData || []);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Auto-refresh to check for completed analyses (polls every 10 seconds if there are pending analyses)
  useEffect(() => {
    const hasPendingAnalyses = properties.some((p) => !p.analyzed_at);

    if (!hasPendingAnalyses) return;

    const interval = setInterval(() => {
      fetchProperties();
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [properties, fetchProperties]);

  // Trigger auto-analysis via API (fire and forget)
  const triggerAnalysis = async (propertyId: string) => {
    try {
      await fetch("/api/properties/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyIds: [propertyId] }),
      });
    } catch (error) {
      console.error("Auto-analysis trigger failed:", error);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("properties")
      .insert({
        agent_id: user.id,
        address: newProperty.address,
        city: newProperty.city,
        state: newProperty.state,
        zip: newProperty.zip,
        price: newProperty.price ? parseInt(newProperty.price) : null,
        beds: newProperty.beds ? parseInt(newProperty.beds) : null,
        baths: newProperty.baths ? parseFloat(newProperty.baths) : null,
        sqft: newProperty.sqft ? parseInt(newProperty.sqft) : null,
        mls_id: newProperty.mls_id || null,
        description: newProperty.description || null,
        status: "active",
      })
      .select()
      .single();

    if (!error && data) {
      setProperties([data, ...properties]);
      setShowAddModal(false);
      setNewProperty({
        address: "",
        city: "",
        state: "OK",
        zip: "",
        price: "",
        beds: "",
        baths: "",
        sqft: "",
        mls_id: "",
        description: "",
      });

      // Auto-analyze in background (fire and forget)
      triggerAnalysis(data.id);
    }

    setIsSubmitting(false);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    const { error } = await supabase.from("properties").delete().eq("id", propertyId);

    if (!error) {
      setProperties(properties.filter((p) => p.id !== propertyId));
    }
  };

  const openAnalysisModal = (property: Property) => {
    setSelectedProperty(property);
    setShowAnalysisModal(true);
  };

  // Filter out properties with red flags - they are auto-hidden from clients
  const cleanProperties = properties.filter((property) => {
    // Hide properties that have been analyzed and have red flags
    if (property.analyzed_at && property.red_flags && property.red_flags.length > 0) {
      return false;
    }
    return true;
  });

  const filteredProperties = cleanProperties.filter((property) => {
    const matchesSearch =
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (property.mls_id?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Count of hidden red flag properties
  const hiddenRedFlagCount = properties.filter(
    (p) => p.analyzed_at && p.red_flags && p.red_flags.length > 0
  ).length;

  const getStatusBadge = (property: Property) => {
    if (!property.analyzed_at) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">
          <Loader2 className="w-3 h-3 animate-spin" /> Analyzing...
        </span>
      );
    }
    if (property.ai_score && property.ai_score >= 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> Excellent
        </span>
      );
    }
    if (property.ai_score && property.ai_score >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-400">
          <CheckCircle2 className="w-3 h-3" /> Good
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">
        <Sparkles className="w-3 h-3" /> Reviewed
      </span>
    );
  };

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
          <h1 className="text-2xl font-bold text-white mb-1">Properties</h1>
          <p className="text-slate-400">Properties are automatically analyzed by AI when added.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
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
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="off_market">Off Market</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div
              key={property.id}
              onClick={() => property.analyzed_at && openAnalysisModal(property)}
              className={`rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden transition-all hover:border-white/20 ${
                property.analyzed_at ? "cursor-pointer" : ""
              }`}
            >
              {/* Image */}
              <div className="h-48 relative overflow-hidden group bg-slate-800">
                {property.photos && property.photos[0] ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 opacity-80"
                    style={{ backgroundImage: `url(${property.photos[0]})` }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="w-12 h-12 text-slate-600" />
                  </div>
                )}

                {/* Top badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  {property.mls_id && (
                    <span className="px-2 py-1 bg-black/60 backdrop-blur rounded text-[10px] text-white font-medium border border-white/10">
                      MLS #{property.mls_id}
                    </span>
                  )}
                </div>

                {/* Match score */}
                {property.ai_score && (
                  <div
                    className={`absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-lg ${
                      property.ai_score >= 80
                        ? "bg-emerald-500 text-black"
                        : property.ai_score >= 60
                        ? "bg-sky-500 text-black"
                        : "bg-slate-600 text-white"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" /> {property.ai_score}% Score
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{property.address}</h3>
                    <p className="text-xs text-slate-500">
                      {property.city}{property.state ? `, ${property.state}` : ""} {property.zip}
                    </p>
                  </div>
                  <span className="text-sm font-mono text-white">
                    {formatPrice(property.price)}
                  </span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  {property.beds && (
                    <span className="flex items-center gap-1">
                      <Bed className="w-3 h-3" /> {property.beds} bed
                    </span>
                  )}
                  {property.baths && (
                    <span className="flex items-center gap-1">
                      <Bath className="w-3 h-3" /> {property.baths} bath
                    </span>
                  )}
                  {property.sqft && (
                    <span className="flex items-center gap-1">
                      <Square className="w-3 h-3" /> {property.sqft.toLocaleString()} sqft
                    </span>
                  )}
                </div>

                {/* AI Note / Highlights */}
                {property.highlights && property.highlights.length > 0 && (
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                    <span className="text-sky-300 font-medium">AI:</span> {property.highlights[0]}
                  </p>
                )}

                {/* Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 capitalize">{property.status}</span>
                  {getStatusBadge(property)}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {property.analyzed_at ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openAnalysisModal(property);
                      }}
                      className="flex-1 py-2 rounded-lg bg-white/5 text-slate-400 text-xs font-medium hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" /> View Analysis
                    </button>
                  ) : (
                    <div className="flex-1 py-2 rounded-lg bg-white/5 text-slate-500 text-xs font-medium flex items-center justify-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> AI analyzing...
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProperty(property.id);
                    }}
                    className="px-3 py-2 rounded-lg border border-white/10 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Home className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No properties yet</h3>
          <p className="text-slate-400 mb-4">Add properties manually or connect MLS to import listings.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add your first property
          </button>
        </div>
      )}

      {/* Stats Footer */}
      {properties.length > 0 && (
        <div className="mt-8 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing {filteredProperties.length} clean properties
            {hiddenRedFlagCount > 0 && (
              <span className="ml-2 text-slate-600">
                ({hiddenRedFlagCount} filtered out by AI)
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {cleanProperties.filter((p) => p.ai_score && p.ai_score >= 80).length} excellent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              {cleanProperties.filter((p) => p.ai_score && p.ai_score >= 60 && p.ai_score < 80).length} good
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              {cleanProperties.filter((p) => !p.analyzed_at).length} analyzing
            </span>
          </div>
        </div>
      )}

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Add Property</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={newProperty.address}
                  onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={newProperty.city}
                    onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    placeholder="Oklahoma City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    ZIP
                  </label>
                  <input
                    type="text"
                    value={newProperty.zip}
                    onChange={(e) => setNewProperty({ ...newProperty, zip: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    placeholder="73102"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={newProperty.price}
                  onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  placeholder="500000"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Beds
                  </label>
                  <input
                    type="number"
                    value={newProperty.beds}
                    onChange={(e) => setNewProperty({ ...newProperty, beds: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Baths
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProperty.baths}
                    onChange={(e) => setNewProperty({ ...newProperty, baths: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    placeholder="2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Sq Ft
                  </label>
                  <input
                    type="number"
                    value={newProperty.sqft}
                    onChange={(e) => setNewProperty({ ...newProperty, sqft: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    placeholder="2000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  MLS # (optional)
                </label>
                <input
                  type="text"
                  value={newProperty.mls_id}
                  onChange={(e) => setNewProperty({ ...newProperty, mls_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  placeholder="182392"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newProperty.description}
                  onChange={(e) => setNewProperty({ ...newProperty, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 resize-none"
                  placeholder="Property description..."
                />
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI analysis will run automatically after adding
              </p>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Add Property
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysisModal && selectedProperty && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">AI Property Analysis</h2>
                <p className="text-sm text-slate-400">{selectedProperty.address}</p>
              </div>
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Score */}
              {selectedProperty.ai_score !== null && (
                <div className="flex items-center gap-4">
                  <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold ${
                      selectedProperty.ai_score >= 80
                        ? "bg-emerald-500/20 text-emerald-400"
                        : selectedProperty.ai_score >= 60
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {selectedProperty.ai_score}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Overall Score</p>
                    <p className="text-white font-medium">
                      {selectedProperty.ai_score >= 80
                        ? "Excellent opportunity"
                        : selectedProperty.ai_score >= 60
                        ? "Good property"
                        : "Worth considering"}
                    </p>
                  </div>
                </div>
              )}

              {/* Highlights */}
              {selectedProperty.highlights && selectedProperty.highlights.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    Highlights ({selectedProperty.highlights.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedProperty.highlights.map((highlight, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-300"
                      >
                        {highlight}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Analysis */}
              {selectedProperty.ai_analysis && (
                <div className="space-y-4">
                  {(selectedProperty.ai_analysis as unknown as AnalysisResult).summary && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                        <Info className="w-4 h-4 text-sky-400" />
                        Summary
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {(selectedProperty.ai_analysis as unknown as AnalysisResult).summary}
                      </p>
                    </div>
                  )}

                  {(selectedProperty.ai_analysis as unknown as AnalysisResult).priceAnalysis && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Price Analysis
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {(selectedProperty.ai_analysis as unknown as AnalysisResult).priceAnalysis}
                      </p>
                    </div>
                  )}

                  {(selectedProperty.ai_analysis as unknown as AnalysisResult).locationNotes && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        Location Notes
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {(selectedProperty.ai_analysis as unknown as AnalysisResult).locationNotes}
                      </p>
                    </div>
                  )}

                  {(selectedProperty.ai_analysis as unknown as AnalysisResult).conditionAssessment && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                        <Wrench className="w-4 h-4 text-purple-400" />
                        Condition Assessment
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {(selectedProperty.ai_analysis as unknown as AnalysisResult).conditionAssessment}
                      </p>
                    </div>
                  )}

                  {(selectedProperty.ai_analysis as unknown as AnalysisResult).investmentPotential && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                        <TrendingUp className="w-4 h-4 text-sky-400" />
                        Investment Potential
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {(selectedProperty.ai_analysis as unknown as AnalysisResult).investmentPotential}
                      </p>
                    </div>
                  )}

                  {(selectedProperty.ai_analysis as unknown as AnalysisResult).recommendations?.length > 0 && (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-white mb-2">
                        <Lightbulb className="w-4 h-4 text-amber-400" />
                        Recommendations
                      </h3>
                      <ul className="space-y-2">
                        {(selectedProperty.ai_analysis as unknown as AnalysisResult).recommendations.map(
                          (rec, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-slate-300"
                            >
                              <span className="text-amber-400 mt-1">•</span>
                              {rec}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Analyzed timestamp */}
              {selectedProperty.analyzed_at && (
                <p className="text-xs text-slate-500 pt-4 border-t border-white/10">
                  Analyzed {new Date(selectedProperty.analyzed_at).toLocaleDateString()} at{" "}
                  {new Date(selectedProperty.analyzed_at).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setShowAnalysisModal(false)}
                className="w-full py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
