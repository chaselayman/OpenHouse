"use client";

import { useState } from "react";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Link as LinkIcon,
  Shield,
  Palette,
  Save,
  Check,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@realty.com",
    phone: "(512) 555-0100",
    company: "Austin Premier Realty",
    license: "TX-123456",
  });

  const [notifications, setNotifications] = useState({
    emailNewMatches: true,
    emailShowingUpdates: true,
    emailWeeklyDigest: false,
    pushNewMatches: true,
    pushShowingReminders: true,
    pushClientActivity: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "integrations", label: "Integrations", icon: LinkIcon },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ];

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
                    JD
                  </div>
                  <div>
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
                      Change Photo
                    </button>
                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Company / Brokerage
                    </label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      License Number
                    </label>
                    <input
                      type="text"
                      value={profile.license}
                      onChange={(e) => setProfile({ ...profile, license: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Integrations Tab */}
          {activeTab === "integrations" && (
            <div className="space-y-6">
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
                        <p className="text-sm text-slate-400">Auto-book showings and sync calendar</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                      Connected
                    </span>
                  </div>

                  {/* MLS */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Austin MLS (ACTRIS)</h3>
                        <p className="text-sm text-slate-400">Real-time property data sync</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                      Connected
                    </span>
                  </div>

                  {/* Google Calendar */}
                  <div className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">Google Calendar</h3>
                        <p className="text-sm text-slate-400">Sync showings to your calendar</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors">
                      Connect
                    </button>
                  </div>
                </div>
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
                      { key: "emailNewMatches", label: "New property matches", desc: "Get notified when AI finds new matches for your clients" },
                      { key: "emailShowingUpdates", label: "Showing updates", desc: "Confirmations, cancellations, and changes" },
                      { key: "emailWeeklyDigest", label: "Weekly digest", desc: "Summary of activity and upcoming showings" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <div className="text-sm text-white">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key as keyof typeof notifications],
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
                      { key: "pushNewMatches", label: "New property matches", desc: "Instant alerts for high-match properties" },
                      { key: "pushShowingReminders", label: "Showing reminders", desc: "30 minutes before each showing" },
                      { key: "pushClientActivity", label: "Client activity", desc: "When clients view or book properties" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div>
                          <div className="text-sm text-white">{item.label}</div>
                          <div className="text-xs text-slate-500">{item.desc}</div>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key as keyof typeof notifications],
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
                      <h3 className="text-white font-semibold">Individual Agent Plan</h3>
                      <p className="text-sm text-slate-400">5 active clients included</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">$49.99</div>
                      <div className="text-xs text-slate-400">per month</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Next billing date: Feb 14, 2025</span>
                    <button className="text-sky-400 hover:text-sky-300">Change plan</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Active clients used</span>
                    <span className="text-white">3 / 5</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10">
                    <div className="h-full w-3/5 rounded-full bg-sky-500" />
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
                      <div className="text-white">Visa ending in 4242</div>
                      <div className="text-xs text-slate-500">Expires 12/26</div>
                    </div>
                  </div>
                  <button className="text-sm text-sky-400 hover:text-sky-300">Update</button>
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
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-slate-200 transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-6">Two-Factor Authentication</h2>

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

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all ${
                saved
                  ? "bg-emerald-500 text-black"
                  : "bg-white text-black hover:bg-slate-200"
              }`}
            >
              {saved ? (
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
        </div>
      </div>
    </div>
  );
}
