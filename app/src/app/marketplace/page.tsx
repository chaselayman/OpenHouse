import Link from "next/link";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import {
  ArrowRight,
  Zap,
  Home,
  Flame,
  TrendingUp,
  Star,
  Cake,
  Package,
  Check,
  ChevronDown,
  Calculator,
  Building,
  Key,
  Users
} from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RealtorFlow — The Automation Marketplace for Modern Agents",
  description: "Build your perfect automation stack. OpenHouse, LeadRevive, TouchBase, ReviewDrip, BigDayBot — only pay for what you need.",
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Nav */}
      <header className="relative z-50 sticky top-0 backdrop-blur-xl bg-[#050507]/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/marketplace" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">RealtorFlow</span>
            </Link>

            <nav className="hidden md:flex gap-1 border border-white/5 rounded-full px-2 py-1 bg-white/5 backdrop-blur-md shadow-lg shadow-black/20">
              <a href="#automations" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Automations</a>
              <a href="#how-it-works" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</a>
              <a href="#pricing" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
            </nav>

            <div className="flex gap-3 items-center">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-200 focus:outline-none shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Build Your Stack
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-32 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            5 Powerful Automations — Pay Only For What You Need
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
            Your Automation.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-emerald-300">Your Stack. Your Way.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed drop-shadow-sm">
            The realtor automation marketplace built for modern agents. Pick the automations you need, skip the ones you don&apos;t. Scale your business on autopilot.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <a href="#automations" className="h-12 px-8 rounded-full bg-white text-black font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform duration-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.5)]">
              Explore Automations
              <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#pricing" className="h-12 px-8 rounded-full border border-white/10 bg-white/5 text-white font-medium text-sm flex items-center gap-2 hover:bg-white/10 transition-colors backdrop-blur-sm">
              <Calculator className="w-4 h-4" />
              Build Your Bundle
            </a>
          </div>

          {/* Quick Product Preview */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium">OpenHouse</span>
            <span className="px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium">LeadRevive</span>
            <span className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">TouchBase</span>
            <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">ReviewDrip</span>
            <span className="px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium">BigDayBot</span>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Building className="w-5 h-5" /> KW KELLER WILLIAMS</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Home className="w-5 h-5" /> RE/MAX</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Key className="w-5 h-5" /> eXp Realty</div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white"><Users className="w-5 h-5" /> Coldwell Banker</div>
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-24 bg-[#0B0C10]/60 border-y border-white/5 backdrop-blur-md relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Stop paying for tools you don&apos;t use.</h2>
          <p className="text-lg text-slate-400">
            Most CRMs force you into bloated packages with features you&apos;ll never touch.
            <span className="text-white"> RealtorFlow lets you build the exact automation stack you need — nothing more, nothing less.</span>
          </p>
        </div>
      </section>

      {/* Automations Marketplace */}
      <section id="automations" className="py-24 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">The Automation Marketplace</h2>
            <p className="text-slate-400">Five powerful tools. Mix and match to build your perfect workflow.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* OpenHouse */}
            <div className="product-card glass-card rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-sky-500 to-cyan-500"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <Home className="w-7 h-7 text-sky-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-400 text-xs font-bold">SHOWINGS</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">OpenHouse</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Autoscheduling for ShowingTime. AI scrapes MLS, vets listing photos for red flags, and lets clients book showings instantly.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-sky-400" /> AI Photo Analysis
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-sky-400" /> ShowingTime Integration
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-sky-400" /> Client Self-Booking Portal
                  </li>
                </ul>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <span className="text-3xl font-bold text-white">$29</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <Link href="/signup" className="px-6 py-2 rounded-lg bg-sky-500 text-white font-semibold text-sm hover:bg-sky-400 transition-colors">Add to Stack</Link>
                </div>
              </div>
            </div>

            {/* LeadRevive */}
            <div className="product-card glass-card rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Flame className="w-7 h-7 text-orange-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-bold">LEADS</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">LeadRevive</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Revive cold leads with automated, personalized messages. Re-engage prospects who went dark and convert them into active buyers.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-orange-400" /> Smart Re-engagement Sequences
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-orange-400" /> Personalized AI Messages
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-orange-400" /> Response Tracking
                  </li>
                </ul>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <span className="text-3xl font-bold text-white">$19</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <Link href="/signup" className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold text-sm hover:bg-orange-400 transition-colors">Add to Stack</Link>
                </div>
              </div>
            </div>

            {/* TouchBase */}
            <div className="product-card glass-card rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 to-green-500"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-emerald-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">SELLERS</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">TouchBase</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Automated Cost Analysis emails to Sellers. Keep your listings informed with market updates and property valuations on autopilot.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400" /> CMA Report Generation
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400" /> Market Update Emails
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-emerald-400" /> Automated Seller Nurturing
                  </li>
                </ul>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <span className="text-3xl font-bold text-white">$24</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <Link href="/signup" className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-400 transition-colors">Add to Stack</Link>
                </div>
              </div>
            </div>

            {/* ReviewDrip */}
            <div className="product-card glass-card rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-purple-500 to-violet-500"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Star className="w-7 h-7 text-purple-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold">REVIEWS</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">ReviewDrip</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Client & Friend Reminders for Google Reviews. Automated, perfectly-timed asks that boost your online reputation effortlessly.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-purple-400" /> Smart Timing Algorithm
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-purple-400" /> Google Review Links
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-purple-400" /> Follow-up Sequences
                  </li>
                </ul>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <span className="text-3xl font-bold text-white">$14</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <Link href="/signup" className="px-6 py-2 rounded-lg bg-purple-500 text-white font-semibold text-sm hover:bg-purple-400 transition-colors">Add to Stack</Link>
                </div>
              </div>
            </div>

            {/* BigDayBot */}
            <div className="product-card glass-card rounded-3xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500"></div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                    <Cake className="w-7 h-7 text-pink-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-400 text-xs font-bold">NURTURE</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">BigDayBot</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Drip campaigns for Anniversaries, Birthdays, and special occasions. Stay top-of-mind with clients on the days that matter most.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-pink-400" /> Home Anniversary Campaigns
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-pink-400" /> Birthday Automations
                  </li>
                  <li className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-pink-400" /> Holiday Drip Sequences
                  </li>
                </ul>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <span className="text-3xl font-bold text-white">$12</span>
                    <span className="text-slate-500">/mo</span>
                  </div>
                  <Link href="/signup" className="px-6 py-2 rounded-lg bg-pink-500 text-white font-semibold text-sm hover:bg-pink-400 transition-colors">Add to Stack</Link>
                </div>
              </div>
            </div>

            {/* Bundle Card */}
            <div className="product-card rounded-3xl overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent relative">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold price-glow">SAVE 30%</div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Package className="w-7 h-7 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Full Stack Bundle</h3>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Get all 5 automations at a massive discount. The complete toolkit for agents who want it all.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-400 text-xs">OpenHouse</span>
                  <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-xs">LeadRevive</span>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">TouchBase</span>
                  <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">ReviewDrip</span>
                  <span className="px-2 py-1 rounded bg-pink-500/20 text-pink-400 text-xs">BigDayBot</span>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    <span className="text-sm text-slate-500 line-through">$98/mo</span>
                    <div>
                      <span className="text-3xl font-bold text-emerald-400">$69</span>
                      <span className="text-slate-500">/mo</span>
                    </div>
                  </div>
                  <Link href="/signup" className="px-6 py-2 rounded-lg bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-400 transition-colors">Get Full Stack</Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 bg-[#0B0C10]/80 border-t border-white/5 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Build Your Stack in 3 Steps</h2>
            <p className="text-slate-400">Simple setup. Immediate results.</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>

            {/* Step 1 */}
            <div className="glass-card p-6 rounded-2xl relative hover:-translate-y-1 transition-transform duration-300 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#050507] border border-white/10 flex items-center justify-center text-white font-bold mb-4 shadow-xl">1</div>
              <h3 className="text-lg font-semibold text-white mb-2">Pick Your Automations</h3>
              <p className="text-sm text-slate-400">Choose the tools that match your workflow. Start with one or grab the full bundle.</p>
            </div>

            {/* Step 2 */}
            <div className="glass-card p-6 rounded-2xl relative hover:-translate-y-1 transition-transform duration-300 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#050507] border border-sky-500/30 text-sky-400 flex items-center justify-center font-bold mb-4 shadow-xl shadow-sky-900/20">2</div>
              <h3 className="text-lg font-semibold text-white mb-2">Connect Your Accounts</h3>
              <p className="text-sm text-slate-400">Link your MLS, email, and calendar. Setup takes less than 10 minutes.</p>
            </div>

            {/* Step 3 */}
            <div className="glass-card p-6 rounded-2xl relative hover:-translate-y-1 transition-transform duration-300 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#050507] border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold mb-4 shadow-xl shadow-emerald-900/20">3</div>
              <h3 className="text-lg font-semibold text-white mb-2">Watch It Work</h3>
              <p className="text-sm text-slate-400">Your automations run 24/7. Track results in your dashboard and reclaim your time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Summary */}
      <section id="pricing" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Transparent, Modular Pricing</h2>
            <p className="text-slate-400">Only pay for what you use. Add or remove automations anytime.</p>
          </div>

          <div className="max-w-3xl mx-auto">
            {/* Pricing Table */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                        <Home className="w-5 h-5 text-sky-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">OpenHouse</div>
                        <div className="text-xs text-slate-400">Showing Automation</div>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white">$29/mo</span>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Flame className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">LeadRevive</div>
                        <div className="text-xs text-slate-400">Cold Lead Re-engagement</div>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white">$19/mo</span>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">TouchBase</div>
                        <div className="text-xs text-slate-400">Seller CMA Automation</div>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white">$24/mo</span>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Star className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">ReviewDrip</div>
                        <div className="text-xs text-slate-400">Google Review Campaigns</div>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white">$14/mo</span>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                        <Cake className="w-5 h-5 text-pink-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">BigDayBot</div>
                        <div className="text-xs text-slate-400">Anniversary & Birthday Drips</div>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white">$12/mo</span>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-lg font-semibold text-white">Full Stack Bundle</div>
                      <div className="text-sm text-emerald-400">All 5 automations included</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-500 line-through">$98/mo</span>
                      <div className="text-2xl font-bold text-emerald-400">$69/mo</div>
                    </div>
                  </div>
                  <Link href="/signup" className="block w-full py-4 rounded-xl bg-white text-black font-semibold text-center hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
                    Start 14-Day Free Trial
                  </Link>
                  <p className="text-xs text-center text-slate-500 mt-4">No credit card required • Cancel anytime</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-[#0B0C10]/80 border-t border-white/5 backdrop-blur-md relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <details className="group glass-card rounded-xl">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-white">
                <span>Can I add or remove automations anytime?</span>
                <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4" /></span>
              </summary>
              <div className="text-slate-400 mt-0 px-4 pb-4 leading-relaxed text-sm">
                Yes! Your subscription is completely flexible. Add new automations as your business grows or remove ones you no longer need. Changes take effect on your next billing cycle.
              </div>
            </details>
            <details className="group glass-card rounded-xl">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-white">
                <span>Does OpenHouse work with my MLS?</span>
                <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4" /></span>
              </summary>
              <div className="text-slate-400 mt-0 px-4 pb-4 leading-relaxed text-sm">
                Yes. OpenHouse integrates with 98% of US MLS providers via RETS/RESO Web API integration.
              </div>
            </details>
            <details className="group glass-card rounded-xl">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-white">
                <span>Is my client data secure?</span>
                <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4" /></span>
              </summary>
              <div className="text-slate-400 mt-0 px-4 pb-4 leading-relaxed text-sm">
                Absolutely. We use bank-level encryption (AES-256) and never sell your client data. Your leads stay yours.
              </div>
            </details>
            <details className="group glass-card rounded-xl">
              <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-4 text-white">
                <span>Do I get a discount for the bundle?</span>
                <span className="transition group-open:rotate-180"><ChevronDown className="w-4 h-4" /></span>
              </summary>
              <div className="text-slate-400 mt-0 px-4 pb-4 leading-relaxed text-sm">
                Yes! The Full Stack Bundle saves you 30% compared to purchasing each automation individually. That&apos;s $69/mo instead of $98/mo.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to automate your business?</h2>
          <p className="text-lg text-slate-400 mb-10">
            Join thousands of agents who&apos;ve built their perfect automation stack with RealtorFlow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="h-14 px-8 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Start Free Trial
            </Link>
            <a href="#automations" className="h-14 px-8 rounded-full border border-white/20 text-white font-medium flex items-center justify-center hover:bg-white/5 transition-colors text-lg backdrop-blur-sm">
              Explore Automations
            </a>
          </div>
          <p className="mt-6 text-sm text-slate-500">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050507] pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span className="text-lg font-bold text-white">RealtorFlow</span>
              </div>
              <p className="text-sm text-slate-500">
                The automation marketplace for modern real estate professionals.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Automations</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">OpenHouse</a></li>
                <li><a href="#" className="hover:text-white">LeadRevive</a></li>
                <li><a href="#" className="hover:text-white">TouchBase</a></li>
                <li><a href="#" className="hover:text-white">ReviewDrip</a></li>
                <li><a href="#" className="hover:text-white">BigDayBot</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-sm text-slate-600">
            © 2025 RealtorFlow Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
