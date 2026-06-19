import React, { useState } from "react";
import { Check, Sparkles, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../Components/Header";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"

  const plans = [
    {
      name: "Starter",
      tagline: "Organize your personal daily schedule.",
      price: { monthly: 0, yearly: 0 },
      features: [
        "Create & track basic tasks",
        "Starred & Today filters",
        "7-day active streak tracking",
        "Minimalist list layout",
      ],
      cta: "Current Plan",
      color: "zinc",
      popular: false,
    },
    {
      name: "Pro Builder",
      tagline: "Accelerate your habits and workflows.",
      price: { monthly: 9, yearly: 7 },
      features: [
        "Priority Stacks Column Board",
        "Custom milestone accomplishments",
        "Full 1-year historical activity tracking",
        "Unlimited tasks & subtask checklists",
        "Priority support",
      ],
      cta: "Upgrade to Pro",
      color: "purple",
      popular: true,
    },
    {
      name: "Executive Premium",
      tagline: "Ultimate planner for high-performing clients.",
      price: { monthly: 29, yearly: 23 },
      features: [
        "Full Weekly & Monthly Calendar Planner",
        "Interactive Drag-and-Drop scheduling",
        "Deep-nested subtasks & timelines",
        "Stripe instant checkout & invoice logs",
        "Custom dashboard background themes",
        "24/7 dedicated account manager",
      ],
      cta: "Join Executive Class",
      color: "gold",
      popular: false,
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-150 flex flex-col overflow-x-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-amber-950/5 blur-[160px]" />
      </div>

      <Header />

      <main className="relative z-10 flex-grow max-w-6xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-4"
          >
            <Sparkles size={12} className="fill-amber-400" />
            <span>EXECUTIVE CLASS PRODUCTIVITY</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Plans designed to keep you <br />
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              focused and consistent.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-4 leading-relaxed">
            Choose the subscription that matches your ambition. Unlock the Calendar Planner, visual priority stacks, and detailed gamified milestones.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-1 mt-8 mx-auto w-fit">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-zinc-800 text-white shadow-md border border-zinc-700/30"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer flex items-center gap-1.5 ${
                billingCycle === "yearly"
                  ? "bg-amber-500/15 text-amber-300 shadow-md border border-amber-500/20"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Yearly Billing
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/20 border border-amber-500/30 text-amber-300 leading-none">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16 items-stretch">
          {plans.map((plan, i) => {
            const isGold = plan.color === "gold";
            const isPurple = plan.color === "purple";
            const planPrice = billingCycle === "monthly" ? plan.price.monthly : plan.price.yearly;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 shadow-2xl transition-all duration-300 hover:translate-y-[-4px] ${
                  plan.popular
                    ? "border-purple-500/30 bg-purple-950/5 shadow-purple-950/10"
                    : isGold
                      ? "border-amber-500/30 bg-amber-950/5 shadow-amber-950/10"
                      : "border-zinc-800 bg-zinc-950/40"
                }`}
              >
                {/* Popular / Premium Banner badges */}
                {plan.popular && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-600 border border-purple-400 text-white shadow-lg">
                    POPULAR CHOICE
                  </span>
                )}
                {isGold && (
                  <span className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 border border-amber-400 text-black shadow-lg">
                    EXECUTIVE GRADE
                  </span>
                )}

                <div>
                  {/* Plan Name */}
                  <h3 className={`text-xl font-black ${
                    isGold 
                      ? "text-amber-400" 
                      : isPurple 
                        ? "text-purple-400" 
                        : "text-zinc-200"
                  }`}>
                    {plan.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-medium mt-1 leading-snug">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white">${planPrice}</span>
                    <span className="text-zinc-500 font-bold text-sm">/ month</span>
                  </div>
                  {billingCycle === "yearly" && planPrice > 0 && (
                    <span className="text-[10px] text-amber-400 font-bold mt-1.5 block">Billed annually (${planPrice * 12}/yr)</span>
                  )}

                  <div className="h-[1px] bg-zinc-900/60 my-6" />

                  {/* Feature Checklist */}
                  <ul className="flex flex-col gap-3 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs font-semibold text-zinc-400 leading-snug">
                        <Check size={14} className={`flex-shrink-0 mt-0.5 ${
                          isGold 
                            ? "text-amber-400" 
                            : isPurple 
                              ? "text-purple-400" 
                              : "text-zinc-500"
                        }`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to action */}
                <button className={`w-full py-3 rounded-xl text-xs font-bold mt-8 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus:outline-none ${
                  isGold
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-black font-black hover:shadow-lg hover:shadow-amber-500/25"
                    : isPurple
                      ? "bg-purple-600 hover:bg-purple-500 text-white font-black hover:shadow-lg hover:shadow-purple-900/35"
                      : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold border border-zinc-700/50"
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Guarantees */}
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 justify-center py-6 px-8 rounded-2xl bg-zinc-900/10 border border-zinc-800/40 w-full">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-amber-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-300">Secure Payments</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">256-bit SSL encrypted Stripe transactions.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Zap size={20} className="text-purple-400" />
            <div className="text-left">
              <p className="text-xs font-bold text-zinc-300">Instant Access</p>
              <p className="text-[10px] text-zinc-500 mt-0.5">Features unlock instantly upon payment.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
