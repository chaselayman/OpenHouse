"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Calendar,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    // Contact Info
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // Search Criteria
    minPrice: "",
    maxPrice: "",
    minBeds: "3",
    maxBeds: "",
    minBaths: "2",
    maxBaths: "",
    minSqft: "",
    maxSqft: "",
    locations: [] as string[],
    propertyTypes: [] as string[],
    // Preferences
    mustHaves: [] as string[],
    dealBreakers: [] as string[],
    timeline: "3-6 months",
    notes: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    const array = formData[field] as string[];
    if (array.includes(item)) {
      setFormData({ ...formData, [field]: array.filter((i) => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...array, item] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in to create a client");
        setIsLoading(false);
        return;
      }

      // Insert client into database
      const { error: insertError } = await supabase.from("clients").insert({
        agent_id: user.id,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email || null,
        phone: formData.phone || null,
        status: "active",
        min_price: formData.minPrice ? parseInt(formData.minPrice) : null,
        max_price: formData.maxPrice ? parseInt(formData.maxPrice) : null,
        min_beds: formData.minBeds ? parseInt(formData.minBeds) : null,
        max_beds: formData.maxBeds ? parseInt(formData.maxBeds) : null,
        min_baths: formData.minBaths ? parseFloat(formData.minBaths) : null,
        max_baths: formData.maxBaths ? parseFloat(formData.maxBaths) : null,
        min_sqft: formData.minSqft ? parseInt(formData.minSqft) : null,
        max_sqft: formData.maxSqft ? parseInt(formData.maxSqft) : null,
        locations: formData.locations.length > 0 ? formData.locations : null,
        property_types: formData.propertyTypes.length > 0 ? formData.propertyTypes : null,
        must_haves: formData.mustHaves.length > 0 ? formData.mustHaves : null,
        dealbreakers: formData.dealBreakers.length > 0 ? formData.dealBreakers : null,
        notes: formData.notes || null,
      });

      if (insertError) {
        setError(insertError.message);
        setIsLoading(false);
        return;
      }

      router.push("/clients");
    }
  };

  const locations = [
    "South Austin",
    "North Austin",
    "East Austin",
    "West Austin",
    "Downtown",
    "Westlake",
    "Round Rock",
    "Cedar Park",
    "Pflugerville",
    "Lakeway",
  ];

  const propertyTypes = ["Single Family", "Condo", "Townhouse", "Multi-Family"];

  const features = [
    "Pool",
    "Garage",
    "Updated Kitchen",
    "Home Office",
    "Large Backyard",
    "Open Floor Plan",
    "Natural Light",
    "Hardwood Floors",
    "Central AC",
    "Smart Home",
  ];

  const dealBreakerOptions = [
    "Busy Road",
    "HOA",
    "Foundation Issues",
    "Flood Zone",
    "Major Repairs Needed",
    "Small Lot",
    "No Garage",
    "Outdated Kitchen",
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/clients"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </Link>
        <h1 className="text-2xl font-bold text-white mb-1">Add New Client</h1>
        <p className="text-slate-400">Enter your client&apos;s information and search criteria.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { num: 1, label: "Contact Info" },
          { num: 2, label: "Search Criteria" },
          { num: 3, label: "Preferences" },
        ].map((s) => (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step > s.num
                    ? "bg-emerald-500 text-black"
                    : step === s.num
                    ? "bg-white text-black"
                    : "bg-white/10 text-slate-500"
                }`}
              >
                {step > s.num ? <Check className="w-5 h-5" /> : s.num}
              </div>
              <span
                className={`text-xs mt-2 ${
                  step >= s.num ? "text-white" : "text-slate-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {s.num < 3 && (
              <div
                className={`w-24 h-0.5 mx-4 ${
                  step > s.num ? "bg-emerald-500" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="glass-card rounded-xl p-8">
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Contact Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Contact Information</h2>
                  <p className="text-sm text-slate-400">Basic details about your client</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="john.smith@email.com"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Property recommendations will be sent to this email
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="(512) 555-0123"
                />
              </div>
            </div>
          )}

          {/* Step 2: Search Criteria */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Home className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Search Criteria</h2>
                  <p className="text-sm text-slate-400">What is your client looking for?</p>
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      name="minPrice"
                      value={formData.minPrice}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                      placeholder="Min"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={formData.maxPrice}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                      placeholder="Max"
                    />
                  </div>
                </div>
              </div>

              {/* Beds & Baths */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    <Bed className="w-4 h-4 inline mr-2" />
                    Bedrooms
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="minBeds"
                      value={formData.minBeds}
                      onChange={handleInputChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    >
                      <option value="">Min</option>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}+
                        </option>
                      ))}
                    </select>
                    <select
                      name="maxBeds"
                      value={formData.maxBeds}
                      onChange={handleInputChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    >
                      <option value="">Max</option>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">
                    <Bath className="w-4 h-4 inline mr-2" />
                    Bathrooms
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      name="minBaths"
                      value={formData.minBaths}
                      onChange={handleInputChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    >
                      <option value="">Min</option>
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}+
                        </option>
                      ))}
                    </select>
                    <select
                      name="maxBaths"
                      value={formData.maxBaths}
                      onChange={handleInputChange}
                      className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    >
                      <option value="">Max</option>
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Preferred Locations
                </label>
                <div className="flex flex-wrap gap-2">
                  {locations.map((location) => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => toggleArrayItem("locations", location)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.locations.includes(location)
                          ? "bg-sky-500 text-black"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              </div>

              {/* Property Types */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Property Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleArrayItem("propertyTypes", type)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.propertyTypes.includes(type)
                          ? "bg-emerald-500 text-black"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Preferences</h2>
                  <p className="text-sm text-slate-400">Help our AI find the perfect matches</p>
                </div>
              </div>

              {/* Must Haves */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Must Have Features
                </label>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleArrayItem("mustHaves", feature)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.mustHaves.includes(feature)
                          ? "bg-emerald-500 text-black"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deal Breakers */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Deal Breakers
                </label>
                <div className="flex flex-wrap gap-2">
                  {dealBreakerOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleArrayItem("dealBreakers", item)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                        formData.dealBreakers.includes(item)
                          ? "bg-red-500 text-white"
                          : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/20"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Buying Timeline
                </label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="asap">ASAP</option>
                  <option value="1-3 months">1-3 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6-12 months">6-12 months</option>
                  <option value="just looking">Just looking</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 resize-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
                  placeholder="Any other details about what your client is looking for..."
                />
              </div>

              {/* AI Notice */}
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">AI-Powered Matching</h4>
                    <p className="text-xs text-slate-400">
                      Once saved, our AI will immediately begin scanning the MLS for matching
                      properties and analyzing listing photos for red flags. Your client will
                      receive their first personalized property recommendations within minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : step < 3 ? (
                <>
                  Continue <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Client & Start AI Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
