"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Cake,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Home,
  Gift,
  Mail,
  MessageSquare,
  Clock,
  Users,
  Plus,
  Settings,
  Heart,
  Baby,
  Key,
  Sparkles,
  Upload,
  FileSpreadsheet,
  RefreshCw,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  X,
  Lock,
  ChevronDown,
} from "lucide-react";
import { useSubscriptions } from "@/lib/hooks/useSubscriptions";

interface Campaign {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  daysBefore: number;
  channel: "email" | "sms" | "both";
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  birthday: string | null;
  wedding_anniversary: string | null;
  home_purchase_date: string | null;
  move_in_date: string | null;
  created_at: string;
}

interface UpcomingEvent {
  contact: Contact;
  eventType: string;
  eventDate: string;
  yearsSince: number | null;
}

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

const initialCampaigns: Campaign[] = [
  {
    id: "birthday",
    name: "Birthday Wishes",
    description: "Send personalized birthday greetings to clients",
    icon: Gift,
    enabled: true,
    daysBefore: 0,
    channel: "email",
  },
  {
    id: "home-anniversary",
    name: "Home Anniversary",
    description: "Celebrate the anniversary of their home purchase",
    icon: Home,
    enabled: true,
    daysBefore: 0,
    channel: "email",
  },
  {
    id: "wedding-anniversary",
    name: "Wedding Anniversary",
    description: "Congratulate clients on their wedding anniversary",
    icon: Heart,
    enabled: false,
    daysBefore: 0,
    channel: "email",
  },
  {
    id: "move-in-date",
    name: "Move-in Anniversary",
    description: "Celebrate when they moved into their home",
    icon: Key,
    enabled: false,
    daysBefore: 0,
    channel: "email",
  },
  {
    id: "kids-birthday",
    name: "Kids' Birthdays",
    description: "Remember their children's birthdays",
    icon: Baby,
    enabled: false,
    daysBefore: 0,
    channel: "email",
  },
  {
    id: "first-home",
    name: "First Home Anniversary",
    description: "Special celebration for first-time homeowners",
    icon: Sparkles,
    enabled: false,
    daysBefore: 0,
    channel: "email",
  },
];

export default function BigDayBotPage() {
  const { isSubscribed, isLoading: subscriptionLoading } = useSubscriptions();
  const hasSubscription = isSubscribed("bigdaybot");

  const [isEnabled, setIsEnabled] = useState(true);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showImportModal, setShowImportModal] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["campaigns"]));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Fetch contacts and upcoming events on load
  useEffect(() => {
    if (hasSubscription) {
      fetchContacts();
    } else {
      setIsLoading(false);
    }
  }, [hasSubscription]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/bigdaybot/contacts?upcoming=true&days=30");
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
        setUpcomingEvents(data.upcomingEvents || []);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/bigdaybot/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setImportResult(result);

      if (result.success) {
        // Refresh contacts list
        await fetchContacts();
      }
    } catch (error) {
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [error instanceof Error ? error.message : "Import failed"],
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await fetch(`/api/bigdaybot/contacts?id=${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== contactId));
        setUpcomingEvents((prev) =>
          prev.filter((e) => e.contact.id !== contactId)
        );
      }
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].name.endsWith(".csv")) {
      setSelectedFile(files[0]);
      setImportResult(null);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setImportResult(null);
    }
  };

  const downloadTemplate = () => {
    window.location.href = "/api/bigdaybot/template";
  };

  const toggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const closeModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportResult(null);
  };

  const activeCampaigns = campaigns.filter((c) => c.enabled).length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Show subscription required message if not subscribed
  if (!subscriptionLoading && !hasSubscription) {
    return (
      <div className="p-8 max-w-4xl">
        <Link
          href="/automations"
          className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Automations</span>
        </Link>

        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-pink-400" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Subscribe to BigDayBot
          </h1>
          <p className="text-[var(--foreground-muted)] mb-6 max-w-md mx-auto">
            Automatically send personalized messages to your clients on birthdays,
            anniversaries, and other special occasions.
          </p>
          <Link
            href="/automations/bigdaybot/subscribe"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold hover:bg-pink-400 transition-all"
          >
            <Cake className="w-5 h-5" />
            Subscribe - $12/month
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Back Link */}
      <Link
        href="/automations"
        className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Automations</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
            <Cake className="w-8 h-8 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">BigDayBot</h1>
            <p className="text-[var(--foreground-muted)] mt-1">
              Automated campaigns for birthdays, anniversaries & special days
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--card-bg-hover)] transition-all"
        >
          <span className="text-sm font-medium text-[var(--foreground-muted)]">
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
          {isEnabled ? (
            <ToggleRight className="w-8 h-8 text-emerald-400" />
          ) : (
            <ToggleLeft className="w-8 h-8 text-[var(--foreground-muted)]" />
          )}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Active Campaigns</span>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">{activeCampaigns}</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs">Contacts</span>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {isLoading ? "-" : contacts.length}
          </div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
            <Mail className="w-4 h-4" />
            <span className="text-xs">Sent (30d)</span>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">0</div>
        </div>
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Upcoming</span>
          </div>
          <div className="text-2xl font-bold text-[var(--foreground)]">
            {isLoading ? "-" : upcomingEvents.length}
          </div>
        </div>
      </div>

      {/* Import Contacts Section - Collapsible */}
      <div className="glass-card rounded-2xl mb-8 overflow-hidden">
        <button
          onClick={() => toggleSection("import")}
          className="w-full p-6 flex items-center justify-between border-b border-[var(--card-border)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-pink-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--foreground)]">Import Contacts</h3>
              <p className="text-sm text-[var(--foreground-muted)]">Add contacts with their important dates</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${expandedSections.has("import") ? "rotate-180" : ""}`} />
        </button>

        <div className={`collapsible-content ${expandedSections.has("import") ? "expanded" : "collapsed"}`}>
          <div className="p-6">
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold text-sm hover:bg-pink-400 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Upload CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] font-medium text-sm hover:bg-[var(--card-bg-hover)] transition-colors">
                <RefreshCw className="w-4 h-4" />
                Sync CRM
              </button>
            </div>

            {/* Import Options */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-[var(--card-bg-hover)] hover:border-[var(--card-border-hover)] transition-all"
              >
                <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-medium text-[var(--foreground)]">CSV File</span>
                <span className="text-xs text-[var(--foreground-muted)]">Excel, Google Sheets</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] opacity-50 cursor-not-allowed">
                <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span className="text-sm font-medium text-[var(--foreground)]">Google Contacts</span>
                <span className="text-xs text-[var(--foreground-muted)]">Coming soon</span>
              </button>
              <button className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] opacity-50 cursor-not-allowed">
                <Plus className="w-6 h-6 text-purple-400" />
                <span className="text-sm font-medium text-[var(--foreground)]">Add Manually</span>
                <span className="text-xs text-[var(--foreground-muted)]">Coming soon</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts List - Only shown if there are contacts */}
      {contacts.length > 0 && (
        <div className="glass-card rounded-2xl mb-8 overflow-hidden">
          <button
            onClick={() => toggleSection("contacts")}
            className="w-full p-6 flex items-center justify-between border-b border-[var(--card-border)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-sky-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-[var(--foreground)]">Contacts</h3>
                <p className="text-sm text-[var(--foreground-muted)]">{contacts.length} total contacts</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${expandedSections.has("contacts") ? "rotate-180" : ""}`} />
          </button>

          <div className={`collapsible-content ${expandedSections.has("contacts") ? "expanded" : "collapsed"}`}>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--foreground-muted)] border-b border-[var(--card-border)]">
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Birthday</th>
                      <th className="pb-3 font-medium">Anniversary</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--card-border)]">
                    {contacts.slice(0, 10).map((contact) => (
                      <tr key={contact.id} className="text-sm">
                        <td className="py-3 text-[var(--foreground)]">
                          {contact.first_name} {contact.last_name || ""}
                        </td>
                        <td className="py-3 text-[var(--foreground-muted)]">{contact.email || "-"}</td>
                        <td className="py-3 text-[var(--foreground-muted)]">{formatDate(contact.birthday)}</td>
                        <td className="py-3 text-[var(--foreground-muted)]">
                          {formatDate(contact.wedding_anniversary)}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => handleDeleteContact(contact.id)}
                            className="text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {contacts.length > 10 && (
                  <p className="text-sm text-[var(--foreground-muted)] mt-4 text-center">
                    Showing 10 of {contacts.length} contacts
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Campaigns - Collapsible - Legacy section removed, keeping only new collapsible version */}
      <div className="glass-card rounded-2xl mb-8 overflow-hidden">
        <button
          onClick={() => toggleSection("campaigns")}
          className="w-full p-6 flex items-center justify-between border-b border-[var(--card-border)]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Gift className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--foreground)]">Event Campaigns</h3>
              <p className="text-sm text-[var(--foreground-muted)]">{activeCampaigns} active campaigns</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${expandedSections.has("campaigns") ? "rotate-180" : ""}`} />
        </button>

        <div className={`collapsible-content ${expandedSections.has("campaigns") ? "expanded" : "collapsed"}`}>
          <div className="p-6 space-y-3">
            {campaigns.map((campaign) => {
              const Icon = campaign.icon;
              return (
                <div
                  key={campaign.id}
                  className={`glass-card rounded-xl p-4 transition-all ${
                    !isEnabled ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-pink-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[var(--foreground)]">{campaign.name}</h3>
                        {campaign.enabled && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)]">{campaign.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Channel Badge */}
                      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--card-bg)] text-[var(--foreground-muted)] text-xs">
                        {campaign.channel === "email" || campaign.channel === "both" ? (
                          <Mail className="w-3 h-3" />
                        ) : null}
                        {campaign.channel === "sms" || campaign.channel === "both" ? (
                          <MessageSquare className="w-3 h-3" />
                        ) : null}
                      </div>

                      {/* Settings */}
                      <button className="w-8 h-8 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg-hover)] transition-all">
                        <Settings className="w-4 h-4" />
                      </button>

                      {/* Toggle */}
                      <button
                        onClick={() => toggleCampaign(campaign.id)}
                        disabled={!isEnabled}
                        className="transition-colors hover:opacity-80 disabled:cursor-not-allowed"
                      >
                        {campaign.enabled ? (
                          <ToggleRight className="w-8 h-8 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-[var(--foreground-muted)]" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CSV Format Guide - Collapsible */}
      <div className="glass-card rounded-2xl mb-8 overflow-hidden">
        <button
          onClick={() => toggleSection("csvguide")}
          className="w-full p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--foreground)]">CSV Format Guide</h3>
              <p className="text-sm text-[var(--foreground-muted)]">Learn how to format your CSV file</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${expandedSections.has("csvguide") ? "rotate-180" : ""}`} />
        </button>

        <div className={`collapsible-content ${expandedSections.has("csvguide") ? "expanded" : "collapsed"}`}>
          <div className="px-6 pb-6 border-t border-[var(--card-border)] pt-4">
            <p className="text-sm text-[var(--foreground-muted)] mb-4">
              Your CSV should include these columns (dates in MM/DD/YYYY format):
            </p>
            <div className="bg-[var(--background-secondary)] rounded-lg p-4 overflow-x-auto">
              <code className="text-xs text-[var(--foreground-muted)]">
                first_name,last_name,email,phone,birthday,wedding_anniversary,home_purchase_date,move_in_date,kid1_name,kid1_birthday,kid2_name,kid2_birthday
              </code>
            </div>
            <div className="mt-4">
              <button
                onClick={downloadTemplate}
                className="text-sm text-pink-400 hover:text-pink-300 transition-colors"
              >
                Download Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <button
          onClick={() => toggleSection("upcoming")}
          className="w-full p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-[var(--foreground)]">Upcoming Events</h3>
              <p className="text-sm text-[var(--foreground-muted)]">{upcomingEvents.length} events in the next 30 days</p>
            </div>
          </div>
          <ChevronDown className={`w-5 h-5 text-[var(--foreground-muted)] transition-transform ${expandedSections.has("upcoming") ? "rotate-180" : ""}`} />
        </button>

        <div className={`collapsible-content ${expandedSections.has("upcoming") ? "expanded" : "collapsed"}`}>
          <div className="px-6 pb-6 border-t border-[var(--card-border)] pt-4">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-[var(--foreground-muted)] animate-spin mx-auto" />
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[var(--card-bg)] flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[var(--foreground-muted)]" />
                </div>
                <h3 className="text-[var(--foreground)] font-medium mb-2">No upcoming events</h3>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  Import contacts with their important dates to see upcoming events
                </p>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-500 text-white font-semibold text-sm hover:bg-pink-400 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Import Contacts
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 5).map((event, index) => (
                  <div key={index} className="glass-card rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6 text-pink-400" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[var(--foreground)]">
                        {event.contact.first_name} {event.contact.last_name || ""}
                      </div>
                      <div className="text-sm text-[var(--foreground-muted)]">{event.eventType}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[var(--foreground)] font-medium">
                        {new Date(event.eventDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {event.yearsSince && (
                        <div className="text-xs text-[var(--foreground-muted)]">
                          {event.yearsSince} years
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[var(--sidebar-bg)] border border-[var(--card-border)] rounded-2xl p-6 w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Import Contacts</h2>
              <button
                onClick={closeModal}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer mb-6 ${
                isDragging
                  ? "border-pink-500 bg-pink-500/10"
                  : selectedFile
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-[var(--card-border)] hover:border-pink-500/50 hover:bg-pink-500/5"
              }`}
            >
              {selectedFile ? (
                <>
                  <Check className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <p className="text-[var(--foreground)] font-medium mb-2">{selectedFile.name}</p>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                  <p className="text-[var(--foreground)] font-medium mb-2">
                    Drop your CSV file here
                  </p>
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">or click to browse</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Import Result */}
            {importResult && (
              <div
                className={`rounded-lg p-4 mb-6 ${
                  importResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                }`}
              >
                {importResult.success ? (
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-emerald-400 font-medium">
                        Successfully imported {importResult.imported} contacts
                      </p>
                      {importResult.skipped > 0 && (
                        <p className="text-sm text-[var(--foreground-muted)]">
                          {importResult.skipped} rows skipped
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <div>
                      <p className="text-red-400 font-medium">Import failed</p>
                      {importResult.errors.map((err, i) => (
                        <p key={i} className="text-sm text-[var(--foreground-muted)]">
                          {err}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Field Mapping Preview */}
            <div className="bg-[var(--card-bg)] rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">Expected Fields</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-[var(--foreground-muted)]">• First Name (required)</span>
                <span className="text-[var(--foreground-muted)]">• Last Name</span>
                <span className="text-[var(--foreground-muted)]">• Email</span>
                <span className="text-[var(--foreground-muted)]">• Phone</span>
                <span className="text-[var(--foreground-muted)]">• Birthday</span>
                <span className="text-[var(--foreground-muted)]">• Wedding Anniversary</span>
                <span className="text-[var(--foreground-muted)]">• Home Purchase Date</span>
                <span className="text-[var(--foreground-muted)]">• Move-in Date</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] font-medium hover:bg-[var(--card-bg-hover)] transition-colors"
              >
                {importResult?.success ? "Done" : "Cancel"}
              </button>
              {!importResult?.success && (
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                  className="flex-1 py-2 rounded-lg bg-pink-500 text-white font-semibold hover:bg-pink-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    "Import"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
