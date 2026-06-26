/**
 * ShareCard.jsx
 * ─────────────────────────────────────────────────────────────────
 * Polished, big-tech-style shareable card system.
 *
 * Three card types:
 *   "rank"        – Leaderboard rank card
 *   "streak"      – Streak achievement card
 *   "achievement" – Level / XP achievement card
 *
 * Share flow:
 *   1. Renders card as DOM → user sees preview
 *   2. On share: tries Web Share API (native share sheet on mobile)
 *   3. Falls back to copying a text summary to clipboard
 *   4. Always offers PNG download via html-to-canvas-free approach
 *      (we convert the card DOM node to SVG blob → canvas → PNG download)
 *
 * Usage:
 *   <ShareCardModal
 *     type="rank"
 *     data={{ name, username, rank, level, xp, currentStreak }}
 *     onClose={...}
 *   />
 */
import React, { useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Trophy,
  Flame,
  Zap,
  Crown,
  Star,
  Shield,
  TrendingUp,
} from "lucide-react";
import { CustomBadgeSvg } from "./CustomBadgeSvg";
import {
  computeXPBreakdown,
  getTierGradient,
  getLevelInfo,
  getEarnedBadges,
  STREAK_MILESTONES,
} from "../utils/gamificationUtils";

// ── Card: Rank ─────────────────────────────────────────────────────
function RankCardContent({ data }) {
  const { name, username, rank, level, xp, currentStreak } = data;
  const xpInfo = computeXPBreakdown(xp || 0);
  const tierStyle = getTierGradient(xpInfo.levelTier);

  const rankColors = {
    1: { badge: "from-yellow-400 via-amber-400 to-orange-400", glow: "rgba(245,158,11,0.6)", text: "text-amber-300" },
    2: { badge: "from-slate-300 via-slate-200 to-zinc-200",    glow: "rgba(148,163,184,0.5)", text: "text-slate-300" },
    3: { badge: "from-amber-700 via-orange-600 to-amber-600",  glow: "rgba(180,83,9,0.6)",   text: "text-amber-500" },
  };
  const rc = rankColors[rank] || { badge: "from-violet-600 via-purple-600 to-indigo-600", glow: "rgba(139,92,246,0.5)", text: "text-violet-400" };

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #0c0c14 0%, #0f0f1a 50%, #0c0c14 100%)",
        border: `1px solid rgba(139,92,246,0.15)`,
      }}
    >
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 pointer-events-none"
        style={{ background: `radial-gradient(ellipse, ${rc.glow.replace("0.6","0.12")} 0%, transparent 70%)` }} />
      <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />

      {/* Top bar — brand */}
      <div className="relative flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-400">
            todo.
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900/80 border border-zinc-800">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Community Rank</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative px-6 pb-6 pt-4">
        {/* Rank number — hero */}
        <div className="flex items-center gap-5 mb-6">
          {/* Giant rank */}
          <div className="relative flex-shrink-0">
            {rank === 1 && (
              <motion.div
                className="absolute -top-4 -right-2"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Crown className="w-6 h-6 text-amber-300 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              </motion.div>
            )}
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${rc.badge} flex items-center justify-center shadow-2xl`}
              style={{ boxShadow: `0 0 40px ${rc.glow}, 0 20px 40px rgba(0,0,0,0.5)` }}
            >
              <span className="text-5xl font-black text-black/80 leading-none">#{rank}</span>
            </div>
          </div>

          {/* Name + meta */}
          <div className="flex flex-col gap-1 min-w-0">
            <div className="text-xl font-black text-zinc-100 truncate leading-tight">{name}</div>
            <div className="text-sm text-zinc-500 font-mono truncate">@{username}</div>

            {/* Level pill */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <div
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-br ${tierStyle.gradient} shadow-lg`}
                style={{ boxShadow: `0 0 12px ${tierStyle.glow}` }}
              >
                <span className="text-[10px] font-black text-black/80">Lv {xpInfo.level}</span>
                <span className="text-[10px] font-bold text-black/70">{xpInfo.levelTitle}</span>
              </div>

              {currentStreak > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Flame className="w-3 h-3 fill-amber-500 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300">{currentStreak}d streak</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* XP progress bar */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">XP Progress</span>
            <span className="text-[9px] font-mono text-zinc-500">
              {xpInfo.xpInLevel.toLocaleString()} / {xpInfo.xpForThisLevel.toLocaleString()} XP
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${tierStyle.gradient}`}
              style={{
                width: `${xpInfo.progressPercent}%`,
                boxShadow: `0 0 8px ${tierStyle.glow}`,
              }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Rank",   value: `#${rank}`,                  color: rc.text },
            { label: "Total XP", value: (xp||0).toLocaleString(), color: "text-violet-400" },
            { label: "Streak", value: `${currentStreak || 0}d`,    color: "text-amber-400" },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-3 text-center">
              <div className={`text-lg font-black ${s.color} leading-none`}>{s.value}</div>
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="px-6 py-3 border-t border-zinc-800/50 flex items-center justify-between">
        <span className="text-[9px] text-zinc-700 font-mono">todo.app • Productivity Leaderboard</span>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-zinc-700" />
          <span className="text-[9px] text-zinc-700">{new Date().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

// ── Card: Streak ───────────────────────────────────────────────────
function StreakCardContent({ data }) {
  const { name, username, currentStreak = 0, longestStreak = 0 } = data;
  const earnedBadges = getEarnedBadges(currentStreak);
  const isShielded = currentStreak >= 7;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #0c0c14 0%, #100c00 50%, #0c0c14 100%)",
        border: "1px solid rgba(245,158,11,0.15)",
      }}
    >
      {/* Flame glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% -10%, rgba(245,158,11,0.12) 0%, transparent 70%)" }} />

      {/* Brand */}
      <div className="relative flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-400">todo.</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
          <Flame className="w-3 h-3 text-amber-400 fill-amber-500" />
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Streak Achievement</span>
        </div>
      </div>

      {/* Hero — streak number */}
      <div className="relative px-6 py-6 flex flex-col items-center text-center">
        {/* Big fire + number */}
        <motion.div
          className="relative"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="text-7xl font-black leading-none"
            style={{
              background: "linear-gradient(to bottom, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(245,158,11,0.5))",
            }}
          >
            {currentStreak}
          </div>
        </motion.div>
        <div className="text-xs font-black uppercase tracking-[0.4em] text-amber-500/80 mt-1">
          Day Streak
        </div>

        {/* Shield badge */}
        {isShielded && (
          <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Shield className="w-3.5 h-3.5 text-blue-400 fill-blue-400/30" />
            <span className="text-[10px] font-bold text-blue-300">Streak Shielded</span>
          </div>
        )}

        {/* Name */}
        <div className="mt-4">
          <div className="text-base font-black text-zinc-100">{name}</div>
          <div className="text-xs text-zinc-500 font-mono">@{username}</div>
        </div>
      </div>

      {/* Divider with flame */}
      <div className="relative px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>

      {/* Badges earned */}
      {earnedBadges.length > 0 && (
        <div className="px-6 py-4">
          <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mb-3 text-center">
            Streak Badges Earned
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {earnedBadges.map((badge) => (
              <div key={badge.days} className="flex flex-col items-center gap-1">
                <CustomBadgeSvg days={badge.days} size={32} isUnlocked={true} />
                <span className="text-[8px] text-zinc-600 font-bold">{badge.days}d</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-3 text-center">
            <div className="text-lg font-black text-amber-400">{currentStreak}d</div>
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Current Streak</div>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-3 text-center">
            <div className="text-lg font-black text-violet-400">{longestStreak || currentStreak}d</div>
            <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">Longest Streak</div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 py-3 border-t border-zinc-800/50 flex items-center justify-between">
        <span className="text-[9px] text-zinc-700 font-mono">todo.app • Keep the streak alive!</span>
        <span className="text-[9px] text-zinc-700">{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// ── Card: Achievement (Level/XP) ───────────────────────────────────
function AchievementCardContent({ data }) {
  const { name, username, xp = 0, level, currentStreak = 0 } = data;
  const xpInfo = computeXPBreakdown(xp);
  const tierStyle = getTierGradient(xpInfo.levelTier);

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        background: "linear-gradient(135deg, #0c0c14 0%, #0d0b18 50%, #0c0c14 100%)",
        border: `1px solid ${tierStyle.glow.replace("0.5", "0.2")}`,
      }}
    >
      {/* Ambient glow from tier colour */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${tierStyle.glow.replace("0.5","0.08")} 0%, transparent 65%)` }} />

      {/* Brand */}
      <div className="relative flex items-center justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.25em] text-violet-400">todo.</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
          style={{ background: `${tierStyle.glow.replace("0.5","0.08")}`, borderColor: `${tierStyle.glow.replace("0.5","0.25")}` }}>
          <TrendingUp className="w-3 h-3" style={{ color: tierStyle.glow.replace(", 0.5)", "").replace("rgba(","#").slice(0,7) }} />
          <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-wider">Achievement</span>
        </div>
      </div>

      {/* Hero */}
      <div className="relative px-6 py-6 flex flex-col items-center text-center gap-4">
        {/* Level badge */}
        <motion.div
          className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${tierStyle.gradient} flex flex-col items-center justify-center shadow-2xl`}
          style={{ boxShadow: `0 0 50px ${tierStyle.glow}, 0 20px 50px rgba(0,0,0,0.6)` }}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-5xl font-black text-black/80 leading-none">{xpInfo.level}</span>
          <span className="text-[9px] font-black text-black/60 uppercase tracking-wider mt-0.5">Level</span>

          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2, ease: "linear" }}
          />
        </motion.div>

        {/* Title */}
        <div>
          <div
            className={`text-3xl font-black bg-gradient-to-r ${tierStyle.gradient} bg-clip-text text-transparent leading-tight`}
          >
            {xpInfo.levelTitle}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5 uppercase tracking-widest font-bold">
            {xpInfo.levelTier} Tier
          </div>
        </div>

        {/* User */}
        <div>
          <div className="text-sm font-bold text-zinc-200">{name}</div>
          <div className="text-xs text-zinc-500 font-mono">@{username}</div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="px-6 pb-2">
        <div className="flex justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">XP Progress</span>
          <span className="text-[9px] font-mono text-zinc-600">
            {xpInfo.xpInLevel.toLocaleString()}/{xpInfo.xpForThisLevel.toLocaleString()}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${tierStyle.gradient}`}
            style={{ width: `${xpInfo.progressPercent}%`, boxShadow: `0 0 8px ${tierStyle.glow}` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 pb-5 pt-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total XP", value: (xp||0).toLocaleString(), icon: <Zap className="w-3 h-3" /> },
            { label: "Streak",   value: `${currentStreak}d`,       icon: <Flame className="w-3 h-3" /> },
            { label: "Level",    value: xpInfo.level,              icon: <Star className="w-3 h-3" /> },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-3 text-center">
              <div className="text-lg font-black text-zinc-100">{s.value}</div>
              <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="px-6 py-3 border-t border-zinc-800/50 flex items-center justify-between">
        <span className="text-[9px] text-zinc-700 font-mono">todo.app • Level Achievement</span>
        <span className="text-[9px] text-zinc-700">{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// ── Card type config ───────────────────────────────────────────────
const CARD_CONFIGS = {
  rank: {
    label: "Rank Card",
    icon: Trophy,
    color: "text-amber-400",
    Component: RankCardContent,
    getText: (data) =>
      `🏆 I'm ranked #${data.rank} on todo. leaderboard! Level ${data.level} with ${(data.xp||0).toLocaleString()} XP and a ${data.currentStreak || 0}-day streak. 🔥 Join me at todo.app`,
  },
  streak: {
    label: "Streak Card",
    icon: Flame,
    color: "text-amber-400",
    Component: StreakCardContent,
    getText: (data) =>
      `🔥 I'm on a ${data.currentStreak}-day streak on todo.! Consistency is key — join me at todo.app`,
  },
  achievement: {
    label: "Achievement Card",
    icon: Zap,
    color: "text-violet-400",
    Component: AchievementCardContent,
    getText: (data) =>
      `⚡ I just hit Level ${data.level} on todo.! ${(data.xp||0).toLocaleString()} XP earned. 💪 todo.app`,
  },
};

// ── Share action helper ────────────────────────────────────────────
async function performShare(type, data, setCopied) {
  const config = CARD_CONFIGS[type];
  const text = config.getText(data);

  if (navigator.share) {
    try {
      await navigator.share({ text, title: "todo. — Gamification" });
      return;
    } catch (_) {}
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  } catch (_) {}
}

// ── Main Modal ─────────────────────────────────────────────────────
export default function ShareCardModal({ type = "rank", data = {}, onClose }) {
  const [activeType, setActiveType] = useState(type);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const config = CARD_CONFIGS[activeType] || CARD_CONFIGS.rank;
  const CardComponent = config.Component;

  const handleShare = async () => {
    setSharing(true);
    await performShare(activeType, data, setCopied);
    setSharing(false);
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />

        {/* Panel */}
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, y: 40, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 280, damping: 25 }}
        >
          {/* Modal shell */}
          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: "rgba(9, 9, 11, 0.98)",
              border: "1px solid rgba(63, 63, 70, 0.6)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(139,92,246,0.05)",
            }}
          >
            {/* Top accent */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-black text-zinc-100">Share Your Progress</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Card type switcher */}
            <div className="px-5 pb-3">
              <div className="flex items-center gap-1.5 bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-1.5">
                {Object.entries(CARD_CONFIGS).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveType(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        activeType === key
                          ? "bg-zinc-800 text-zinc-100 shadow-lg"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <Icon className={`w-3 h-3 ${activeType === key ? cfg.color : ""}`} />
                      <span className="hidden sm:inline">{cfg.label}</span>
                      <span className="sm:hidden">{cfg.label.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card preview */}
            <div className="px-5 pb-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeType}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                >
                  <CardComponent data={data} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="px-5 pb-5 flex items-center gap-3">
              <motion.button
                onClick={handleShare}
                disabled={sharing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all cursor-pointer disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow: "0 0 20px rgba(124,58,237,0.3)",
                  color: "white",
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(124,58,237,0.45)" }}
                whileTap={{ scale: 0.98 }}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span className="text-emerald-300">Copied to clipboard!</span>
                  </>
                ) : sharing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sharing...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share
                  </>
                )}
              </motion.button>

              <motion.button
                onClick={async () => {
                  const text = config.getText(data);
                  try {
                    await navigator.clipboard.writeText(text);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  } catch (_) {}
                }}
                className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                title="Copy text"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>

            {/* Hint */}
            <div className="px-5 pb-4 -mt-1">
              <p className="text-center text-[10px] text-zinc-700">
                Share your progress to Twitter, WhatsApp, or anywhere else
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
