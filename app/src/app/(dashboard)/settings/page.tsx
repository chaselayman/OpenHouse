"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Link as LinkIcon,
  Shield,
  Save,
  Check,
  Loader2,
  LogOut,
  AlertCircle,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Integration } from "@/lib/types/database";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [clientCount, setClientCount] = useState(0);
  const [connectingIntegration, setConnectingIntegration] = useState<string | null>(null);
  const [integrationError, setIntegrationError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    brokerage: "",
    license_number: "",
  });

  const [notifications, setNotifications] = useState({
    emailNewMatches: true,
    emailShowingUpdates: true,
    emailWeeklyDigest: false,
    pushNewMatches: true,
    pushShowingReminders: true,
    pushClientActivity: false,
  });

  // License validation
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [validatingLicense, setValidatingLicense] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);
      setFormData({
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        brokerage: profileData.brokerage || "",
        license_number: profileData.license_number || "",
      });

      // Fetch integrations
      const { data: integrationsData } = await supabase
        .from("integrations")
        .select("*")
        .eq("agent_id", user.id);

      setIntegrations(integrationsData || []);

      // Fetch client count
      const { count } = await supabase
        .from("clients")
        .select("*", { count: "exact", head: true })
        .eq("agent_id", user.id)
        .eq("status", "active");

      setClientCount(count || 0);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function validateLicenseNumber(licenseNumber: string): Promise<boolean> {
    if (!licenseNumber || licenseNumber.trim() === "") {
      setLicenseError(null);
      return true;
    }

    setValidatingLicense(true);
    try {
      const response = await fetch("/api/license/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          licenseNumber: licenseNumber.trim(),
          userId: profile?.id,
        }),
      });

      const data = await response.json();

      if (!data.available) {
        setLicenseError(data.message || "This license number is already in use");
        return false;
      }

      setLicenseError(null);
      return true;
    } catch (error) {
      console.error("License validation error:", error);
      setLicenseError("Failed to validate license number");
      return false;
    } finally {
      setValidatingLicense(false);
    }
  }

  async function handleSave() {
    if (!profile) return;

    // Validate license number first
    const licenseValid = await validateLicenseNumber(formData.license_number);
    if (!licenseValid) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          brokerage: formData.brokerage,
          license_number: formData.license_number.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchData();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  function getInitials(name: string): string {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  function getIntegrationStatus(type: string): "connected" | "disconnected" {
    const integration = integrations.find((i) => i.type === type);
    return integration?.status === "connected" ? "connected" : "disconnected";
  }

  async function handleConnectIntegration(type: "google_calendar" | "showingtime") {
    setConnectingIntegration(type);
    setIntegrationError(null);

    try {
      const endpoint = type === "google_calendar"
        ? "/api/integrations/google-calendar"
        : "/api/integrations/showingtime";

      const response = await fetch(endpoint, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to connect");
      }

      // Refresh integrations
      await fetchData();
    } catch (error) {
      console.error(`Error connecting ${type}:`, error);
      setIntegrationError(
        error instanceof Error ? error.message : "Failed to connect integration"
      );
    } finally {
      setConnectingIntegration(null);
    }
  }

  async function handleDisconnectIntegration(type: "google_calendar" | "showingtime") {
    if (!confirm(`Are you sure you want to disconnect ${type === "google_calendar" ? "Google Calendar" : "ShowingTime"}?`)) {
      return;
    }

    setConnectingIntegration(type);
    setIntegrationError(null);

    try {
      const endpoint = type === "google_calendar"
        ? "/api/integrations/google-calendar"
        : "/api/integrations/showingtime";

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to disconnect");
      }

      // Refresh integrations
      await fetchData();
    } catch (error) {
      console.error(`Error disconnecting ${type}:`, error);
      setIntegrationError(
        error instanceof Error ? error.message : "Failed to disconnect integration"
      );
    } finally {
      setConnectingIntegration(null);
    }
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
        <p className="text-slate-400">Manage your account settings and preferences.</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/10">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>

              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                    {getInitials(formData.full_name)}
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                      Change Photo
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company / Brokerage
                    </label>
                    <input
                      type="text"
                      value={formData.brokerage}
                      onChange={(e) => setFormData({ ...formData, brokerage: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-sky-500"
                      placeholder="Your brokerage name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      License Number
                      <span className="text-xs text-slate-500 ml-2">(must be unique)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.license_number}
                      onChange={(e) => {
                        setFormData({ ...formData, license_number: e.target.value });
                        setLicenseError(null); // Clear error on change
                      }}
                      className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white focus:outline-none ${
                        licenseError
                          ? "border-red-500 focus:border-red-500"
                          : "border-white/10 focus:border-sky-500"
                      }`}
                      placeholder="TX-123456"
                    />
                    {licenseError && (
                      <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {licenseError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
              {/* Error message */}
              {integrationError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-400">{integrationError}</p>
                  </div>
                  <button
                    onClick={() => setIntegrationError(null)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Connected Services</h2>

                <div className="space-y-4">
                  {/* ShowingTime */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">ShowingTime</h3>
                        <p className="text-sm text-slate-400">
                          Auto-book showings and sync calendar
                        </p>
                      </div>
                    </div>
                    {getIntegrationStatus("showingtime") === "connected" ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          Connected
                        </span>
                        <button
                          onClick={() => handleDisconnectIntegration("showingtime")}
                          disabled={connectingIntegration === "showingtime"}
                          className="px-3 py-1 rounded-lg text-slate-400 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnectIntegration("showingtime")}
                        disabled={connectingIntegration === "showingtime"}
                        className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {connectingIntegration === "showingtime" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    )}
                  </div>

                  {/* Google Calendar */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Google Calendar</h3>
                        <p className="text-sm text-slate-400">Sync showings to your calendar</p>
                      </div>
                    </div>
                    {getIntegrationStatus("google_calendar") === "connected" ? (
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                          Connected
                        </span>
                        <button
                          onClick={() => handleDisconnectIntegration("google_calendar")}
                          disabled={connectingIntegration === "google_calendar"}
                          className="px-3 py-1 rounded-lg text-slate-400 hover:text-red-400 text-xs transition-colors disabled:opacity-50"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnectIntegration("google_calendar")}
                        disabled={connectingIntegration === "google_calendar"}
                        className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {connectingIntegration === "google_calendar" ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          "Connect"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Info about integrations */}
              <div className="p-4 rounded-lg bg-sky-500/10 border border-sky-500/20">
                <p className="text-sm text-sky-300">
                  <strong>Note:</strong> ShowingTime uses mock mode for development until MLS partnership credentials are available.
                  Google Calendar requires a service account to be configured in the environment.
                </p>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-4">Email Notifications</h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "emailNewMatches",
                        label: "New property matches",
                        desc: "Get notified when AI finds new matches for your clients",
                      },
                      {
                        key: "emailShowingUpdates",
                        label: "Showing updates",
                        desc: "Confirmations, cancellations, and changes",
                      },
                      {
                        key: "emailWeeklyDigest",
                        label: "Weekly digest",
                        desc: "Summary of activity and upcoming showings",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      >
                        <div>
                          <div className="text-sm text-white">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]:
                                !notifications[item.key as keyof typeof notifications],
                            })
                          }
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            notifications[item.key as keyof typeof notifications]
                              ? "bg-emerald-500"
                              : "bg-slate-600"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              notifications[item.key as keyof typeof notifications]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-4">Push Notifications</h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "pushNewMatches",
                        label: "New property matches",
                        desc: "Instant alerts for high-match properties",
                      },
                      {
                        key: "pushShowingReminders",
                        label: "Showing reminders",
                        desc: "30 minutes before each showing",
                      },
                      {
                        key: "pushClientActivity",
                        label: "Client activity",
                        desc: "When clients view or book properties",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                      >
                        <div>
                          <div className="text-sm text-white">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]:
                                !notifications[item.key as keyof typeof notifications],
                            })
                          }
                          className={`w-11 h-6 rounded-full transition-colors relative ${
                            notifications[item.key as keyof typeof notifications]
                              ? "bg-emerald-500"
                              : "bg-slate-600"
                          }`}
                        >
                          <span
                            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              notifications[item.key as keyof typeof notifications]
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Current Plan</h2>

                <div className="p-4 rounded-lg border border-sky-500/30 bg-sky-500/10 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-semibold">
                        {profile?.plan_type === "brokerage"
                          ? "Brokerage Plan"
                          : "Individual Agent Plan"}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {profile?.plan_tier === "unlimited"
                          ? "Unlimited clients"
                          : `${profile?.client_limit || 5} active clients included`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        ${profile?.plan_type === "brokerage" ? "39.99" : "49.99"}
                      </div>
                      <div className="text-xs text-slate-400">
                        {profile?.plan_type === "brokerage" ? "per agent/month" : "per month"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">
                      Next billing date:{" "}
                      {new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <button className="text-sky-400 hover:text-sky-300">Change plan</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Active clients used</span>
                    <span className="text-white">
                      {clientCount} / {profile?.client_limit || 5}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all"
                      style={{
                        width: `${Math.min(100, (clientCount / (profile?.client_limit || 5)) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Need more clients? Add for $4.99/client or upgrade to unlimited.
                  </p>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Payment Method</h2>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 rounded bg-slate-700 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white">No payment method on file</div>
                      <div className="text-xs text-slate-500">Add a card to continue</div>
                    </div>
                  </div>
                  <button className="text-sm text-sky-400 hover:text-sky-300">
                    Add Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Password</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">
                  Two-Factor Authentication
                </h2>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                  <div>
                    <div className="text-white font-medium">Two-factor authentication</div>
                    <div className="text-sm text-slate-400">
                      Add an extra layer of security to your account
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors">
                    Enable
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6 border-red-500/20">
                <h2 className="text-lg font-semibold text-red-400 mb-6">Danger Zone</h2>

                <div className="flex items-center justify-between p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                  <div>
                    <div className="text-white font-medium">Delete Account</div>
                    <div className="text-sm text-slate-400">
                      Permanently delete your account and all data
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save Button - only show for Profile tab */}
          {activeTab === "profile" && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || validatingLicense}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                  saved
                    ? "bg-emerald-500 text-black"
                    : "bg-white text-black hover:bg-slate-200"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {saving || validatingLicense ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {validatingLicense ? "Validating..." : "Saving..."}
                  </>
                ) : saved ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
