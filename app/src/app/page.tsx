import Link from "next/link";
import { Logo } from "@/components/Logo";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ArrowRight, Home, Eye, Calendar, Sparkles, Check } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Nav */}
      <header className="relative z-50 sticky top-0 backdrop-blur-xl bg-[#050507]/60 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo />

            <nav className="hidden md:flex gap-1 border border-white/5 rounded-full px-2 py-1 bg-white/5 backdrop-blur-md shadow-lg shadow-black/20">
              <a href="#how-it-works" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</a>
              <a href="#features" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
            </nav>

            <div className="flex gap-3 items-center">
              <Link href="/login" className="hidden sm:block text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
              <Link href="/signup" className="inline-flex h-9 items-center justify-center rounded-lg bg-white px-4 text-sm font-semibold text-black transition hover:bg-slate-200 focus:outline-none shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-20 pb-32 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(14,165,233,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            New: ShowingTime Integration is live
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-2xl">
            Give it an email.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-emerald-300">Just show up to showings.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed drop-shadow-sm">
            The AI assistant that scrapes MLS, vets photos for red flags, and lets your clients book instant showings. Save 2-4 hours per client.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/signup" className="h-12 px-8 rounded-full bg-white text-black font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform duration-200 shadow-[0_0_40px_-10px_rgba(255,255,255,0.4)] hover:shadow-[0_0_50px_-5px_rgba(255,255,255,0.5)]">
              Start 14-day free trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="h-12 px-8 rounded-full border border-white/10 bg-white/5 text-white font-medium text-sm flex items-center gap-2 hover:bg-white/10 transition-colors backdrop-blur-sm">
              Watch how it works
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">From new lead to front door</h2>
            <p className="text-slate-400">The entire workflow is automated.</p>
          </div>

          <div className="relative grid md:grid-cols-4 gap-8">
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10"></div>

            {[
              { num: 1, title: "Input Criteria", desc: "Enter your client's budget, location, and non-negotiables.", icon: Home, highlight: false },
              { num: 2, title: "AI Analysis", desc: "We scrape the MLS. Our AI scans photos for defects humans miss.", icon: Eye, highlight: true },
              { num: 3, title: "Client Selection", desc: "Clients receive a beautiful digest of vetted homes.", icon: Sparkles, highlight: false },
              { num: 4, title: "Auto-Book & Sync", desc: "We interface with ShowingTime to book slots instantly.", icon: Calendar, highlight: true },
            ].map((step) => (
              <div key={step.num} className="glass-card p-6 rounded-2xl relative hover:-translate-y-1 transition-transform duration-300">
                <div className={`w-10 h-10 rounded-full bg-[#050507] border flex items-center justify-center font-bold mb-4 shadow-xl ${
                  step.highlight ? "border-sky-500/30 text-sky-400" : "border-white/10 text-white"
                }`}>
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Pay for results, not leads</h2>
            <p className="text-slate-400">Competitive pricing that scales with your business.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Individual */}
            <div className="glass-card p-8 rounded-3xl flex flex-col hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-xl font-semibold text-white mb-2">Individual Agent</h3>
              <p className="text-sm text-slate-400 mb-6">For the solo top producer.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$49.99</span>
                <span className="text-slate-500">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" /> 5 Active Clients included
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Unlimited AI Property Analysis
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" /> ShowingTime Auto-Booking
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="w-4 h-4 text-slate-500">+</span> $4.99 per additional client
                </li>
              </ul>
              <Link href="/signup" className="w-full py-3 rounded-xl bg-white text-black font-semibold text-center hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Brokerage */}
            <div className="p-8 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent flex flex-col relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-emerald-500/20">BEST VALUE</div>
              <h3 className="text-xl font-semibold text-white mb-2">Brokerage Team</h3>
              <p className="text-sm text-slate-400 mb-6">Power up your entire office.</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$39.99</span>
                <span className="text-slate-500">/agent/mo</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Minimum 5 agents
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Admin Dashboard & Analytics
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Team Calendar Sync
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-emerald-400" /> Volume discounts available
                </li>
              </ul>
              <Link href="/signup?plan=brokerage" className="w-full py-3 rounded-xl border border-white/20 text-white font-semibold text-center hover:bg-white/5 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative overflow-hidden z-10">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to reclaim your weekends?</h2>
          <p className="text-lg text-slate-400 mb-10">
            Join tech-forward agents who have automated their showing workflow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="h-14 px-8 rounded-full bg-white text-black font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-lg shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Start Free Trial
            </Link>
            <Link href="/login" className="h-14 px-8 rounded-full border border-white/20 text-white font-medium flex items-center justify-center hover:bg-white/5 transition-colors text-lg backdrop-blur-sm">
              Log In
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">No credit card required for trial</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050507] pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-5 h-5 text-white" />
                <span className="text-lg font-bold text-white">OpenHouse</span>
              </div>
              <p className="text-sm text-slate-500">
                The intelligent showing assistant for the modern real estate professional.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Success Stories</a></li>
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
            2025 OpenHouse AI Technologies Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
