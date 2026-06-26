/**
 * GamificationBar.jsx
 * ─────────────────────────────────────────────────────────────────
 * Unified, animated XP / Level progress bar.
 * Used in: Dashboard hero, Profile gamification tab, Leaderboard self-card.
 *
 * Props:
 *   xp       {number}  – raw cumulative XP
 *   streak   {number}  – current streak days (optional, for display)
 *   size     {"sm"|"md"|"lg"} – compact vs full layout
 *   showStreak {bool}  – whether to show streak pill
 *   animate  {bool}    – whether to animate on mount
 */
import React, { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Zap, Flame, TrendingUp } from "lucide-react";
import {
  computeXPBreakdown,
  getTierGradient,
  getLevelInfo,
} from "../utils/gamificationUtils";

// Animated counter
function AnimatedNumber({ value, suffix = "", className = "" }) {
  const spring = useSpring(0, { stiffness: 80, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString() + suffix);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}

export default function GamificationBar({
  xp = 0,
  streak = 0,
  size = "md",
  showStreak = true,
  animate = true,
  className = "",
}) {
  const {
    level,
    xpInLevel,
    xpForThisLevel,
    xpToNext,
    progressPercent,
    levelTitle,
    levelTier,
  } = computeXPBreakdown(xp);

  const tierStyle = getTierGradient(levelTier);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const barWidth = mounted && animate ? `${progressPercent}%` : "0%";

  if (size === "sm") {
    // ── COMPACT (leaderboard self-card) ──
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-5 h-5 rounded-md bg-gradient-to-br ${tierStyle.gradient} flex items-center justify-center text-[9px] font-black text-black shadow-lg`}
              style={{ boxShadow: `0 0 8px ${tierStyle.glow}` }}
            >
              {level}
            </div>
            <span className="text-[10px] font-bold text-zinc-300">{levelTitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {showStreak && streak > 0 && (
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-amber-400">
                <Flame className="w-2.5 h-2.5 fill-amber-500" />
                {streak}d
              </span>
            )}
            <span className="text-[9px] text-zinc-600 font-mono">
              {xpInLevel.toLocaleString()}/{xpForThisLevel.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="h-1 w-full rounded-full bg-zinc-800/80 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${tierStyle.gradient}`}
            style={{ boxShadow: `0 0 6px ${tierStyle.glow}` }}
            initial={{ width: 0 }}
            animate={{ width: barWidth }}
            transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.1 }}
          />
        </div>
      </div>
    );
  }

  if (size === "lg") {
    // ── FULL (dashboard hero, profile tab) ──
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        {/* Top row — level badge + title + XP numbers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Level badge */}
            <motion.div
              className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${tierStyle.gradient} flex items-center justify-center font-black text-sm text-black shadow-lg flex-shrink-0`}
              style={{ boxShadow: `0 0 16px ${tierStyle.glow}` }}
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {level}
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3, ease: "linear" }}
              />
            </motion.div>

            <div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-violet-400" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400">
                  Level {level}
                </span>
              </div>
              <span className="text-[11px] font-bold text-zinc-300">{levelTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showStreak && streak > 0 && (
              <motion.div
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20"
                whileHover={{ scale: 1.04 }}
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-400" />
                <span className="text-xs font-bold text-amber-300">{streak}d</span>
              </motion.div>
            )}
            <div className="text-right">
              <div className="text-xs font-bold text-zinc-300 font-mono">
                <AnimatedNumber value={xpInLevel} />
                <span className="text-zinc-600">/{xpForThisLevel.toLocaleString()} XP</span>
              </div>
              <div className="text-[9px] text-zinc-600 font-semibold">
                {xpToNext.toLocaleString()} to next level
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-2 w-full rounded-full bg-zinc-800/80 overflow-hidden">
          {/* Track shimmer */}
          <motion.div
            className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
          />
          {/* Fill */}
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${tierStyle.gradient} relative`}
            style={{ boxShadow: `0 0 10px ${tierStyle.glow}` }}
            initial={{ width: 0 }}
            animate={{ width: barWidth }}
            transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
          >
            {/* Tip glow */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white/60 blur-[2px]" />
          </motion.div>
        </div>

        {/* Bottom stats row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-zinc-600" />
            <span className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">
              Total: {xp.toLocaleString()} XP
            </span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${tierStyle.gradient}`}
              style={{ boxShadow: `0 0 4px ${tierStyle.glow}` }}
            />
            <span className="text-[9px] text-zinc-600 font-semibold uppercase tracking-wider">
              {levelTier} tier
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── MEDIUM (default, profile sidebar) ──
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${tierStyle.gradient} flex items-center justify-center font-black text-xs text-black shadow-md`}
            style={{ boxShadow: `0 0 10px ${tierStyle.glow}` }}
          >
            {level}
          </motion.div>
          <div>
            <span className="text-[10px] font-bold text-violet-400 block">Lv {level} · {levelTitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showStreak && streak > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-400">
              <Flame className="w-3 h-3 fill-amber-500" />
              {streak}d
            </span>
          )}
          <span className="text-[10px] text-zinc-500 font-mono">
            {xpInLevel}/{xpForThisLevel} XP
          </span>
        </div>
      </div>

      <div className="h-1.5 w-full rounded-full bg-zinc-800/80 overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${tierStyle.gradient}`}
          style={{ boxShadow: `0 0 8px ${tierStyle.glow}` }}
          initial={{ width: 0 }}
          animate={{ width: barWidth }}
          transition={{ duration: 1.3, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
        />
      </div>
    </div>
  );
}
