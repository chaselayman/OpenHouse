"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ArrowRight, Check, Building2, User } from "lucide-react";

type PlanType = "individual" | "brokerage";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [planType, setPlanType] = useState<PlanType>("individual");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    brokerageName: "",
    agentCount: 5,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-50 border-b border-white/5 bg-[#050507]/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400">Already have an account?</span>
              <Link
                href="/login"
                className="text-sm font-medium text-white hover:text-sky-400 transition-colors"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    step > s
                      ? "bg-emerald-500 text-black"
                      : step === s
                      ? "bg-white text-black"
                      : "bg-white/10 text-slate-500"
                  }`}
                >
                  {step > s ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step > s ? "bg-emerald-500" : "bg-white/10"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <div className="glass-card rounded-2xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Choose Plan */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Choose your plan</h1>
                    <p className="text-slate-400">Select the plan that fits your needs</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPlanType("individual")}
                      className={`p-6 rounded-xl border text-left transition-all ${
                        planType === "individual"
                          ? "border-white/30 bg-white/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <User className="w-8 h-8 text-sky-400 mb-3" />
                      <h3 className="text-white font-semibold mb-1">Individual</h3>
                      <p className="text-sm text-slate-400 mb-3">For solo agents</p>
                      <div className="text-white font-bold">
                        $49.99<span className="text-slate-400 font-normal text-sm">/mo</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlanType("brokerage")}
                      className={`p-6 rounded-xl border text-left transition-all relative ${
                        planType === "brokerage"
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-1 rounded-full">
                        BEST VALUE
                      </div>
                      <Building2 className="w-8 h-8 text-emerald-400 mb-3" />
                      <h3 className="text-white font-semibold mb-1">Brokerage</h3>
                      <p className="text-sm text-slate-400 mb-3">For teams of 5+</p>
                      <div className="text-white font-bold">
                        $39.99<span className="text-slate-400 font-normal text-sm">/agent/mo</span>
                      </div>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <h4 className="text-white font-medium mb-2">
                      {planType === "individual" ? "Individual Plan" : "Brokerage Plan"} includes:
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        5 Active Clients included
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        Unlimited AI Property Analysis
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        ShowingTime Auto-Booking
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        14-day free trial
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 2: Account Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
                    <p className="text-slate-400">Enter your email and create a password</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                      placeholder="you@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                      placeholder="Min. 8 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                      placeholder="Re-enter your password"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Profile Details */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Almost there!</h1>
                    <p className="text-slate-400">Tell us a bit about yourself</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        First name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  {planType === "brokerage" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Brokerage name
                        </label>
                        <input
                          type="text"
                          name="brokerageName"
                          value={formData.brokerageName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                          placeholder="ABC Realty"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Number of agents
                        </label>
                        <input
                          type="number"
                          name="agentCount"
                          value={formData.agentCount}
                          onChange={handleInputChange}
                          min={5}
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 transition-all"
                        />
                        <p className="text-xs text-slate-500 mt-1">Minimum 5 agents required</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
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
                    "Start Free Trial"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-slate-500 mt-6">
            By signing up, you agree to our{" "}
            <Link href="/terms" className="text-slate-400 hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-slate-400 hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
