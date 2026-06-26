import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  BarChart2,
  Flame,
  Trophy,
  CheckCircle2,
  TrendingUp,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { fetchStreakData, STREAK_MILESTONES } from "../Store/Reducers/StreakSlice";

function getMilestoneContext(streak) {
  let prevMilestone = { days: 0, badge: "Beginner", emoji: "🌱" };
  let nextMilestone = STREAK_MILESTONES[0];
  for (let i = 0; i < STREAK_MILESTONES.length; i++) {
    if (streak >= STREAK_MILESTONES[i].days) {
      prevMilestone = STREAK_MILESTONES[i];
      nextMilestone = STREAK_MILESTONES[i + 1] || null;
    } else {
      nextMilestone = STREAK_MILESTONES[i];
      break;
    }
  }
  const progress = nextMilestone
    ? (streak - prevMilestone.days) / (nextMilestone.days - prevMilestone.days)
    : 1;
  return { prevMilestone, nextMilestone, progress: Math.min(progress, 1) };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseLocalDate(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateLabel(dateKey) {
  const d = parseLocalDate(dateKey);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildLastNDays(n) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(toDateKey(d));
  }
  return days;
}

function buildYearGrid() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek - 52 * 7);
  const columns = [];
  let cursor = new Date(startDate);
  while (cursor <= today) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      if (cursor <= today) {
        week.push(toDateKey(new Date(cursor)));
      } else {
        week.push(null);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    columns.push(week);
  }
  return columns;
}

function getBestDay(activityMap) {
  let best = { key: null, count: 0 };
  for (const [key, count] of Object.entries(activityMap)) {
    if (count > best.count) best = { key, count };
  }
  return best;
}

// ─── Color helpers ─────────────────────────────────────────────────────────
function getIntensityClass(count) {
  if (!count || count === 0) return "bg-zinc-900 border-zinc-800/40";
  if (count === 1) return "bg-amber-950/80 border-amber-900/50";
  if (count <= 2) return "bg-amber-900/70 border-amber-800/50";
  if (count <= 4) return "bg-amber-700/80 border-amber-600/50";
  return "bg-amber-500 border-amber-400/60 shadow-[0_0_6px_rgba(245,158,11,0.4)]";
}

function getBarColor(count, max) {
  if (!count || count === 0) return "bg-zinc-800";
  const ratio = count / (max || 1);
  if (ratio < 0.25) return "bg-amber-900/70";
  if (ratio < 0.5) return "bg-amber-700/80";
  if (ratio < 0.75) return "bg-amber-600";
  return "bg-amber-500";
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_STRIP_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─── Portal Tooltip ────────────────────────────────────────────────────────
function HeatmapTooltip({ tooltip }) {
  if (!tooltip) return null;
  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: tooltip.x,
        top: tooltip.y - 10,
        transform: "translateX(-50%) translateY(-100%)",
      }}
    >
      <div className="bg-zinc-900/95 border border-zinc-700/60 backdrop-blur-md rounded-lg px-3 py-2 shadow-2xl text-center whitespace-nowrap">
        <p className="text-xs font-bold text-zinc-100">
          {tooltip.count} task{tooltip.count !== 1 ? "s" : ""} completed
        </p>
        <p className="text-[10px] text-zinc-400 mt-0.5">
          {tooltip.label ?? formatDateLabel(tooltip.dateKey)}
        </p>
      </div>
    </div>,
    document.body
  );
}

function CustomBadgeSvg({ days, size = 120, isUnlocked = false }) {
  const grayscaleFilter = !isUnlocked ? "saturate(0.05) brightness(0.65)" : "none";
  
  if (days === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]">
        <defs>
          <linearGradient id="bronzeBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#cd7f32" />
            <stop offset="50%" stopColor="#b87333" />
            <stop offset="100%" stopColor="#8c5222" />
          </linearGradient>
          <linearGradient id="bronzeInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#4a2e16" />
            <stop offset="100%" stopColor="#1a0f07" />
          </linearGradient>
          <linearGradient id="sparkGrad" x1="50" y1="20" x2="50" y2="80">
            <stop offset="0%" stopColor="#fff5e6" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" stroke="url(#bronzeBorder)" strokeWidth="4" fill="url(#bronzeInner)" />
        <circle cx="50" cy="50" r="38" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <g className="origin-center animate-[pulse_3s_ease-in-out_infinite]">
          <path d="M50 20 L53 42 L75 45 L53 48 L50 70 L47 48 L25 45 L47 42 Z" fill="url(#sparkGrad)" />
          <circle cx="50" cy="45" r="4" fill="#ffffff" className="animate-ping" style={{ animationDuration: '3s' }} />
        </g>
        <text x="50" y="80" textAnchor="middle" fill="#fef3c7" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">3d</text>
      </svg>
    );
  }
  
  if (days === 7) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        <defs>
          <linearGradient id="silverBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="silverInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="emeraldGrad" x1="50" y1="30" x2="50" y2="70">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <polygon points="50,6 81,19 94,50 81,81 50,94 19,81 6,50 19,19" stroke="url(#silverBorder)" strokeWidth="4" fill="url(#silverInner)" />
        <polygon points="50,12 76,23 87,50 76,77 50,88 24,77 13,50 24,23" stroke="#64748b" strokeWidth="1" opacity="0.5" />
        <path d="M15,45 Q28,30 40,40 M85,45 Q72,30 60,40" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M18,52 Q28,42 38,48 M82,52 Q72,42 62,48" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <g transform="translate(38, 28) scale(1.1)">
          <path d="M5,2 L19,2 L19,8 C19,12 16,15 12,15 C8,15 5,12 5,8 Z" fill="url(#emeraldGrad)" />
          <path d="M5,4 H2 Q1,4 1,7 Q1,10 5,9 M19,4 H22 Q23,4 23,7 Q23,10 19,9" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12,15 V19 M8,19 H16" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <text x="50" y="80" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">7d</text>
      </svg>
    );
  }
  
  if (days === 14) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]">
        <defs>
          <linearGradient id="purpleBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="purpleInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#0f052d" />
          </linearGradient>
          <linearGradient id="boltGrad" x1="50" y1="20" x2="50" y2="70">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" stroke="url(#purpleBorder)" strokeWidth="4" fill="url(#purpleInner)" />
        <polygon points="50,13 81,31 81,69 50,87 19,69 19,31" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" />
        <g transform="translate(13, 0)">
          <path d="M28,22 L40,40 L32,44 L44,68 L24,44 L32,40 Z" fill="url(#boltGrad)" className="animate-pulse" />
          <path d="M46,22 L58,40 L50,44 L62,68 L42,44 L50,40 Z" fill="url(#boltGrad)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        </g>
        <text x="50" y="82" textAnchor="middle" fill="#f3e8ff" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">14d</text>
      </svg>
    );
  }
  
  if (days === 30) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_18px_rgba(6,182,212,0.35)]">
        <defs>
          <linearGradient id="cyanBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#083344" />
          </linearGradient>
          <linearGradient id="cyanInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#083344" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="gemGrad" x1="50" y1="28" x2="50" y2="62">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <polygon points="50,5 88,43 50,95 12,43" stroke="url(#cyanBorder)" strokeWidth="4" fill="url(#cyanInner)" />
        <polygon points="50,14 80,44 50,86 20,44" stroke="#0891b2" strokeWidth="1" opacity="0.4" />
        <g className="origin-center animate-[pulse_4s_ease-in-out_infinite]">
          <polygon points="50,25 35,35 65,35" fill="url(#gemGrad)" />
          <polygon points="35,35 22,45 35,50" fill="#0891b2" opacity="0.8" />
          <polygon points="65,35 78,45 65,50" fill="#0891b2" opacity="0.8" />
          <polygon points="35,35 50,25 35,50 M65,35 50,25 65,50" stroke="#083344" strokeWidth="0.5" />
          <polygon points="35,50 50,70 65,50" fill="url(#gemGrad)" opacity="0.9" />
          <polygon points="22,45 50,70 35,50" fill="#06b6d4" opacity="0.7" />
          <polygon points="78,45 50,70 65,50" fill="#06b6d4" opacity="0.7" />
        </g>
        <text x="50" y="85" textAnchor="middle" fill="#ecfeff" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">30d</text>
      </svg>
    );
  }
  
  if (days === 100) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
        <defs>
          <linearGradient id="platBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
          <linearGradient id="platInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <linearGradient id="goldTrident" x1="50" y1="20" x2="50" y2="65">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <path d="M20,10 H80 V45 C80,68 50,90 50,90 C50,90 20,68 20,45 Z" stroke="url(#platBorder)" strokeWidth="4" fill="url(#platInner)" />
        <path d="M25,15 H75 V45 C75,64 50,82 50,82 C50,82 25,64 25,45 Z" stroke="#9ca3af" strokeWidth="1" opacity="0.3" />
        <g stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
          <path d="M12,25 Q6,50 20,75 M88,25 Q94,50 80,75" />
          <circle cx="10" cy="35" r="1.5" fill="#9ca3af" />
          <circle cx="8" cy="50" r="1.5" fill="#9ca3af" />
          <circle cx="12" cy="65" r="1.5" fill="#9ca3af" />
          <circle cx="90" cy="35" r="1.5" fill="#9ca3af" />
          <circle cx="92" cy="50" r="1.5" fill="#9ca3af" />
          <circle cx="88" cy="65" r="1.5" fill="#9ca3af" />
        </g>
        <g transform="translate(0, 4)">
          <line x1="50" y1="28" x2="50" y2="62" stroke="url(#goldTrident)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40,25 Q50,42 60,25" stroke="url(#goldTrident)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50,18 L50,28 M40,20 L40,27 M60,20 L60,27" stroke="url(#goldTrident)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <text x="50" y="80" textAnchor="middle" fill="#f9fafb" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">100d</text>
      </svg>
    );
  }
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_25px_rgba(251,191,36,0.45)]">
      <defs>
        <linearGradient id="goldBorder" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="30%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <linearGradient id="goldInner" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id="rubyGrad" x1="50" y1="30" x2="50" y2="70">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <path d="M30,15 L36,25 L50,18 L64,25 L70,15 L62,30 H38 Z" fill="url(#goldBorder)" stroke="#ca8a04" strokeWidth="1" />
      <circle cx="30" cy="14" r="1.5" fill="#fde047" />
      <circle cx="50" cy="17" r="1.5" fill="#fde047" />
      <circle cx="70" cy="14" r="1.5" fill="#fde047" />
      <path d="M22,25 H78 V50 C78,72 50,92 50,92 C50,92 22,72 22,50 Z" stroke="url(#goldBorder)" strokeWidth="4.5" fill="url(#goldInner)" />
      <path d="M27,29 H73 V50 C73,67 50,84 50,84 C50,84 27,67 27,50 Z" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
      <path d="M50,30 L55,44 L70,44 L58,52 L62,66 L50,58 L38,66 L42,52 L30,44 L45,44 Z" fill="url(#rubyGrad)" stroke="url(#goldBorder)" strokeWidth="1.5" className="origin-center animate-[pulse_2.5s_ease-in-out_infinite]" />
      <text x="50" y="82" textAnchor="middle" fill="#fef9c3" fontSize="12" fontWeight="950" fontFamily="monospace" letterSpacing="0.5">365d</text>
    </svg>
  );
}

export function StreakHighlightCard({ currentStreak, longestStreak, activityMap }) {
  const { prevMilestone, nextMilestone, progress } = getMilestoneContext(currentStreak);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);

  const today = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0); return t;
  }, []);

  // ── Streak-at-risk detection ─────────────────────────────────────────────
  // Show a warning after 18:00 if no completions today and streak > 0
  const isAtRisk = useMemo(() => {
    if (currentStreak === 0) return false;
    const hour = new Date().getHours();
    if (hour < 18) return false;
    const todayKey = toDateKey(today);
    return !(activityMap[todayKey] && activityMap[todayKey] > 0);
  }, [currentStreak, activityMap, today]);

  // Build Monday-anchored current week
  const weekDays = useMemo(() => {
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [today]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.015, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="w-full rounded-2xl border border-zinc-800/80 backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:border-amber-500/30 group shadow-2xl"
        style={{ background: "rgba(9, 9, 11, 0.45)" }}
      >
        {/* Amber radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.08) 0%, transparent 75%)" }}
        />

        <div className="relative p-5 flex flex-col gap-5">
          {/* Top: flame + number + streak label */}
          <div className="flex items-center gap-4">
            {/* Flame */}
            <div className="relative flex-shrink-0">
              {/* Animated Floating Embers */}
              {Array.from({ length: 4 }).map((_, idx) => (
                <motion.span
                  key={idx}
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px]"
                  style={{ bottom: 14, left: 26 + (idx * 3.5) }}
                  animate={{
                    y: [0, -48 - (idx * 4)],
                    x: [0, (idx % 2 === 0 ? 8 : -8) * Math.sin(idx), 0],
                    opacity: [0, 0.9, 0],
                    scale: [0, 1.25, 0]
                  }}
                  transition={{
                    duration: 1.8 + (idx * 0.35),
                    repeat: Infinity,
                    delay: idx * 0.4,
                    ease: "easeOut"
                  }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.08, 1], y: [0, -2, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg width="60" height="74" viewBox="0 0 60 80" fill="none">
                  <defs>
                    <linearGradient id="at-flameGrad" x1="30" y1="80" x2="30" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="50%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#fef08a" />
                    </linearGradient>
                    <linearGradient id="at-innerFlame" x1="30" y1="80" x2="30" y2="20" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#fffbeb" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#fef9c3" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <path d="M30 8 C30 8 14 28 14 46 C14 56 20 66 30 68 C40 66 46 56 46 46 C46 28 30 8 30 8Z" fill="url(#at-flameGrad)" />
                  <path d="M30 30 C30 30 22 42 22 52 C22 58 25 63 30 64 C35 63 38 58 38 52 C38 42 30 30 30 30Z" fill="url(#at-innerFlame)" />
                  <circle cx="42" cy="22" r="3" fill="#fef08a" opacity="0.8" />
                </svg>
              </motion.div>
            </div>

            {/* Number + label */}
            <div>
              <span
                className="text-6xl font-black leading-none block select-none"
                style={{
                  background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 60%, #d97706 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {currentStreak}
              </span>
              <span className="text-xs font-black text-amber-400/90 mt-1 block uppercase tracking-widest font-mono">day streak</span>
            </div>

            {/* Right: longest streak badge & freeze status */}
            <div className="ml-auto flex flex-col items-end gap-2">
              <div className="flex items-center gap-1.5 bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
                <Trophy size={11} className="text-emerald-400" />
                <span className="text-xs font-black text-zinc-300 font-mono">{longestStreak}d</span>
              </div>
              
              <div className="flex items-center gap-1.5 bg-cyan-950/30 border border-cyan-900/30 rounded-xl px-2.5 py-1 select-none cursor-help group/freeze relative">
                <span className="text-xs">❄️</span>
                <span className="text-[10px] font-extrabold text-cyan-300 uppercase tracking-widest font-mono">Shielded</span>
                
                {/* Tooltip Bubble */}
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover/freeze:block bg-zinc-950 border border-zinc-800/80 rounded-lg p-2.5 text-[10px] text-zinc-300 w-48 shadow-2xl z-35 font-medium leading-relaxed">
                  Streak Freeze is active! If you miss a task today, your streak will be protected automatically.
                </div>
              </div>
            </div>
          </div>

          {/* ── Streak-at-risk warning ─────────────────────────────────────── */}
          <AnimatePresence>
            {isAtRisk && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 rounded-xl px-3 py-2.5"
              >
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0 animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-red-300">Streak at risk!</p>
                  <p className="text-[10px] text-red-400/70">Complete a task before midnight to keep your {currentStreak}-day streak alive.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Milestone progress bar (Clickable to show details) */}
          <div 
            onClick={() => setShowMilestonesModal(true)}
            className="flex flex-col gap-1.5 cursor-pointer bg-zinc-900/20 border border-zinc-800/40 rounded-xl p-3 hover:bg-zinc-900/40 transition-all duration-200 group/milestone select-none"
          >
            <div className="flex justify-between items-center px-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500/80 font-mono">Streak Goal</span>
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-wider group-hover/milestone:text-amber-400 transition-colors duration-200">Badges →</span>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)] flex-shrink-0" />
              <div className="flex-1 relative h-2 bg-zinc-800 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.4)]"
                />
                <motion.div
                  initial={{ left: 0 }}
                  animate={{ left: `calc(${progress * 100}% - 5px)` }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-zinc-950 border-2 border-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]"
                />
              </div>
              {nextMilestone && (
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-600 flex-shrink-0" />
              )}
            </div>
            <div className="flex justify-between px-0.5 mt-0.5">
              <span className="text-[10px] text-amber-400 font-bold font-mono">{prevMilestone.days}d</span>
              {nextMilestone && (
                <span className="text-[10px] text-zinc-500 font-semibold font-mono">{nextMilestone.days}d</span>
              )}
            </div>
            {nextMilestone ? (
              <p className="text-xs text-zinc-400 leading-snug">
                Reach{" "}
                <span className="text-amber-400 font-bold">{nextMilestone.days} days</span>{" "}
                to unlock {nextMilestone.emoji}{" "}
                <span className="text-amber-300 font-bold">{nextMilestone.badge}</span>!
              </p>
            ) : (
              <p className="text-xs text-amber-300 font-bold">👑 Legendary Streak achieved!</p>
            )}
          </div>

          {/* Weekly strip with interactive tooltips */}
          <div className="bg-zinc-900/30 border border-zinc-800/40 rounded-xl px-1.5 py-3">
            <div className="grid grid-cols-7 gap-0.5">
              {WEEK_STRIP_LABELS.map((label, i) => {
                const dayDate = weekDays[i];
                const dateKey = toDateKey(dayDate);
                const hasActivity = activityMap[dateKey] && activityMap[dateKey] > 0;
                const isToday = dayDate.getTime() === today.getTime();
                const isFuture = dayDate.getTime() > today.getTime();
                const isTodayAtRisk = isToday && isAtRisk;
                
                return (
                  <div 
                    key={i} 
                    className="relative flex flex-col items-center gap-1.5 cursor-default"
                    onMouseEnter={() => setHoveredDay(i)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <span className={`text-[10px] font-black ${
                      isToday
                        ? isTodayAtRisk ? "text-red-400" : "text-amber-400"
                        : "text-zinc-600"
                    } font-mono uppercase tracking-wider`}>
                      {label}
                    </span>
                    
                    {hasActivity ? (
                      <motion.div
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.04, type: "spring", stiffness: 400 }}
                        className="w-[34px] h-[34px] rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/25 hover:border-amber-400/50 transition-all duration-200"
                      >
                        <span className="text-sm">🔥</span>
                      </motion.div>
                    ) : isTodayAtRisk ? (
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-[34px] h-[34px] rounded-full border border-red-500/80 bg-red-900/10 flex items-center justify-center"
                      >
                        <span className="text-sm">⚠️</span>
                      </motion.div>
                    ) : isToday ? (
                      <div className="w-[34px] h-[34px] rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-amber-400 font-mono">{dayDate.getDate()}</span>
                      </div>
                    ) : isFuture ? (
                      <div className="w-[34px] h-[34px] rounded-full border border-zinc-800/60 flex items-center justify-center opacity-40">
                        <span className="text-[10px] font-medium text-zinc-600 font-mono">{dayDate.getDate()}</span>
                      </div>
                    ) : (
                      <div className="w-[34px] h-[34px] rounded-full border border-zinc-800/80 bg-zinc-900/20 flex items-center justify-center">
                        <span className="text-[10px] font-medium text-zinc-500 font-mono">{dayDate.getDate()}</span>
                      </div>
                    )}

                    {/* Day Tooltip */}
                    <AnimatePresence>
                      {hoveredDay === i && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute bottom-full mb-2 bg-zinc-950/95 border border-zinc-800/80 backdrop-blur-md rounded-xl px-2.5 py-1.5 shadow-2xl text-center whitespace-nowrap z-40 select-none"
                        >
                          <p className="text-[10px] font-extrabold text-zinc-200">
                            {dayDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </p>
                          <p className="text-[9px] font-semibold text-zinc-400 mt-0.5">
                            {hasActivity
                              ? `${activityMap[dateKey]} task${activityMap[dateKey] !== 1 ? "s" : ""} completed 🔥`
                              : isTodayAtRisk
                                ? "Streak at risk! Complete a task ⚠️"
                                : isToday
                                  ? "No completions today yet 🎯"
                                  : isFuture
                                    ? "Upcoming day 🚀"
                                    : "No tasks completed 💤"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Milestone Modal */}
      <AnimatePresence>
        {showMilestonesModal && (
          <div className="fixed inset-0 z-[9990] bg-zinc-950/98 backdrop-blur-xl overflow-y-auto flex flex-col w-screen h-screen">
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="w-full min-h-screen p-6 sm:p-12 md:p-16 flex flex-col gap-8 text-left relative overflow-x-hidden"
            >
              {/* Glow header overlay */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none rounded-full blur-[100px]" 
                style={{ background: "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)" }} 
              />
              
              <div className="flex justify-between items-start border-b border-zinc-900 pb-6 relative z-10">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-widest">Streak Milestones</h3>
                  <p className="text-xs sm:text-sm text-zinc-500 font-semibold mt-2">Complete consecutive daily tasks to unlock premium badges. Click any badge to view full details.</p>
                </div>
                <button
                  onClick={() => setShowMilestonesModal(false)}
                  className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer font-bold focus:outline-none"
                >
                  ✕
                </button>
              </div>

              {/* Responsive Badge Grid - Takes full width and spans beautifully */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative z-10 w-full mt-4">
                {STREAK_MILESTONES.map((m) => {
                  const isUnlocked = currentStreak >= m.days;
                  const isNext = nextMilestone && nextMilestone.days === m.days;
                  
                  return (
                    <motion.div 
                      key={m.days} 
                      onClick={() => {
                        setSelectedBadge(m);
                      }}
                      whileHover={{ scale: 1.05, y: -6 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className={`flex flex-col items-center gap-4 border rounded-[28px] p-6 transition-all duration-300 cursor-pointer text-center relative select-none shadow-lg ${
                        isUnlocked 
                          ? "bg-amber-500/5 border-amber-500/15 hover:border-amber-500/40 hover:bg-amber-500/10 shadow-[0_4px_20px_rgba(245,158,11,0.04)]" 
                          : isNext
                            ? "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
                            : "bg-zinc-900/10 border-zinc-900/60 opacity-50 hover:opacity-75"
                      }`}
                    >
                      {/* Badge Svg inside the Grid cell */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative">
                        {isUnlocked && (
                          <div className="absolute inset-0 rounded-full bg-amber-500/5 blur-lg" />
                        )}
                        <CustomBadgeSvg days={m.days} size={96} isUnlocked={isUnlocked} />
                      </div>

                      <div className="flex flex-col gap-1 w-full mt-2">
                        <span className={`text-sm sm:text-base font-extrabold ${isUnlocked ? 'text-amber-300' : 'text-zinc-400'} font-mono uppercase tracking-wide`}>
                          {m.badge}
                        </span>
                        <span className="text-[10px] sm:text-xs font-black text-zinc-500 font-mono tracking-widest uppercase">
                          {m.days} days streak
                        </span>
                      </div>

                      {/* Status indicator tag */}
                      <div className="mt-auto w-full pt-4 border-t border-zinc-900/80 flex items-center justify-center">
                        <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider font-mono ${
                          isUnlocked 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                            : isNext
                              ? "bg-zinc-900 text-zinc-400 border border-zinc-800"
                              : "bg-zinc-950 text-zinc-600 border border-transparent"
                        }`}>
                          {isUnlocked 
                            ? "✓ Earned" 
                            : isNext
                              ? `Progress: ${currentStreak}/${m.days}d`
                              : `Locked`}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full-Screen Badge Details Overlay */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Glowing Halo Background behind the badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] pointer-events-none rounded-full blur-[80px]" style={{
              background: selectedBadge.days === 3 ? "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)"
                        : selectedBadge.days === 7 ? "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)"
                        : selectedBadge.days === 14 ? "radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)"
                        : selectedBadge.days === 30 ? "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)"
                        : selectedBadge.days === 100 ? "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)"
                        : "radial-gradient(circle, rgba(251,191,36,0.2) 0%, transparent 70%)"
            }} />

            {/* Floating Sparkle Particles */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const angle = (idx / 12) * Math.PI * 2;
              const distance = 130 + Math.random() * 40;
              const targetX = Math.cos(angle) * distance;
              const targetY = Math.sin(angle) * distance;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ 
                    opacity: [0, 0.9, 0], 
                    x: [0, targetX], 
                    y: [0, targetY], 
                    scale: [0, 1.2, 0.2] 
                  }}
                  transition={{ 
                    duration: 3 + Math.random() * 2, 
                    repeat: Infinity,
                    delay: idx * 0.2,
                    ease: "easeOut"
                  }}
                  className="absolute pointer-events-none text-amber-300 text-xs"
                >
                  ✨
                </motion.div>
              );
            })}

            {/* Detail Card Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-sm bg-zinc-950 border border-zinc-800/80 rounded-[32px] p-8 shadow-2xl relative z-10 overflow-hidden text-center flex flex-col items-center gap-6"
            >
              {/* Radial glow */}
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 pointer-events-none" 
                style={{
                  background: selectedBadge.days === 3 ? "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%)"
                            : selectedBadge.days === 7 ? "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.06) 0%, transparent 70%)"
                            : selectedBadge.days === 14 ? "radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.08) 0%, transparent 70%)"
                            : selectedBadge.days === 30 ? "radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.08) 0%, transparent 70%)"
                            : selectedBadge.days === 100 ? "radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.06) 0%, transparent 70%)"
                            : "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.1) 0%, transparent 70%)"
                }} 
              />

              {/* Close Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-5 right-5 w-8.5 h-8.5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                ✕
              </button>

              {/* Header Status Tag */}
              <div className="mt-4">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono border ${
                  currentStreak >= selectedBadge.days 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)] animate-pulse" 
                    : "bg-zinc-900/60 text-zinc-500 border-zinc-800"
                }`}>
                  {currentStreak >= selectedBadge.days ? "✓ Badge Unlocked" : "🔒 Locked Badge"}
                </span>
              </div>

              {/* Large Premium Badge */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative my-2"
              >
                <CustomBadgeSvg days={selectedBadge.days} size={180} isUnlocked={currentStreak >= selectedBadge.days} />
              </motion.div>

              {/* Texts */}
              <div className="flex flex-col gap-2">
                <h2 className="text-xl font-black text-white tracking-tight uppercase font-mono">
                  {selectedBadge.badge}
                </h2>
                <p className="text-xs text-zinc-400 font-semibold px-4">
                  {selectedBadge.days === 3 ? "You're laying the foundation. Sparking consistency!"
                  : selectedBadge.days === 7 ? "An entire week of productivity. You are building real momentum."
                  : selectedBadge.days === 14 ? "Two weeks of focus. A powerful habit has been formed."
                  : selectedBadge.days === 30 ? "A full month of active task completions. You are a master."
                  : selectedBadge.days === 100 ? "Centurion level consistency. 100 days of dedication."
                  : "Legendary status achieved. 365 days of unbeatable consistency."}
                </p>
              </div>

              {/* Progress Detail */}
              <div className="w-full bg-zinc-900/40 border border-zinc-900/80 rounded-2xl p-4 flex flex-col gap-2 mt-2">
                <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                  <span className="text-zinc-500 uppercase tracking-wider">Requirement</span>
                  <span className="text-zinc-300">{selectedBadge.days} Days Streak</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold font-mono">
                  <span className="text-zinc-500 uppercase tracking-wider">Your Streak</span>
                  <span className={currentStreak >= selectedBadge.days ? "text-amber-400" : "text-zinc-400"}>
                    {currentStreak} days
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="relative h-1.5 bg-zinc-800 rounded-full w-full overflow-hidden mt-1">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                    style={{ width: `${Math.min((currentStreak / selectedBadge.days) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setSelectedBadge(null)}
                style={{
                  background: selectedBadge.days === 3 || selectedBadge.days === 365 ? "linear-gradient(to right, #f59e0b, #ef4444)"
                            : selectedBadge.days === 7 ? "linear-gradient(to right, #10b981, #059669)"
                            : selectedBadge.days === 14 ? "linear-gradient(to right, #a855f7, #ec4899)"
                            : selectedBadge.days === 30 ? "linear-gradient(to right, #06b6d4, #3b82f6)"
                            : "linear-gradient(to right, #ec4899, #f43f5e)"
                }}
                className="w-full py-3.5 rounded-2xl text-white font-extrabold text-xs uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer font-mono mt-2"
              >
                {currentStreak >= selectedBadge.days ? "Awesome!" : "Let's Go!"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Chart Views ───────────────────────────────────────────────────────────

function YearHeatmap({ activityMap }) {
  const allColumns = useMemo(() => buildYearGrid(), []);
  const [tooltip, setTooltip] = useState(null);

  const { firstHalf, secondHalf } = useMemo(() => {
    const mid = Math.ceil(allColumns.length / 2);
    return { firstHalf: allColumns.slice(0, mid), secondHalf: allColumns.slice(mid) };
  }, [allColumns]);

  const getMonthLabels = (cols) => {
    const labels = [];
    let lastMonth = -1;
    cols.forEach((week, colIdx) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;
      const month = parseLocalDate(firstDay).getMonth();
      if (month !== lastMonth) {
        labels.push({ colIdx, label: MONTH_NAMES[month] });
        lastMonth = month;
      }
    });
    return labels;
  };

  const renderRow = (cols, key) => {
    const monthLabels = getMonthLabels(cols);
    return (
      <div key={key} className="w-full">
        <div className="flex w-full mb-1 gap-[2px]">
          {cols.map((_, colIdx) => {
            const lbl = monthLabels.find((l) => l.colIdx === colIdx);
            return (
              <div key={colIdx} className="flex-1 min-w-0 overflow-visible relative h-4">
                {lbl && (
                  <span className="absolute left-0 top-0 text-[9px] text-zinc-500 font-semibold leading-none whitespace-nowrap">
                    {lbl.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex w-full gap-[2px]">
          {cols.map((week, colIdx) => (
            <div key={colIdx} className="flex-1 flex flex-col gap-[2px]">
              {week.map((dateKey, rowIdx) => (
                <div
                  key={rowIdx}
                  className={`w-full aspect-square rounded-[2px] border cursor-pointer transition-all duration-100 hover:ring-1 hover:ring-amber-400/60 hover:brightness-125 ${
                    dateKey
                      ? getIntensityClass(activityMap[dateKey])
                      : "bg-transparent border-transparent"
                  }`}
                  onMouseEnter={(e) => {
                    if (!dateKey) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({ dateKey, count: activityMap[dateKey] || 0, x: rect.left + rect.width / 2, y: rect.top });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {renderRow(firstHalf, "first")}
      {renderRow(secondHalf, "second")}
      <div className="flex items-center gap-1.5 justify-end">
        <span className="text-[9px] text-zinc-600">Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div key={lvl} className={`w-[10px] h-[10px] rounded-[2px] border ${getIntensityClass(lvl === 0 ? 0 : lvl)}`} />
        ))}
        <span className="text-[9px] text-zinc-600">More</span>
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

function MonthView({ activityMap }) {
  const months = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }, []);

  const monthTotals = useMemo(() =>
    months.map(({ year, month }) => {
      let total = 0;
      for (const [key, count] of Object.entries(activityMap)) {
        const d = parseLocalDate(key);
        if (d.getFullYear() === year && d.getMonth() === month) total += count;
      }
      return { year, month, total };
    }),
    [months, activityMap]
  );

  const maxVal = Math.max(...monthTotals.map((m) => m.total), 1);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-2 h-36 px-1">
        {monthTotals.map(({ year, month, total }, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1 group cursor-pointer"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({ dateKey: `${year}-${String(month + 1).padStart(2, "0")}-01`, count: total, label: `${MONTH_NAMES[month]} ${year}`, x: rect.left + rect.width / 2, y: rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <span className="text-[10px] text-zinc-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{total}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(total / maxVal) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full rounded-t-lg ${getBarColor(total, maxVal)} group-hover:brightness-125 transition-all min-h-[2px]`}
              style={{ maxHeight: "100%" }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 px-1">
        {monthTotals.map(({ month }, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] text-zinc-600">{MONTH_NAMES[month].slice(0, 3)}</span>
          </div>
        ))}
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

function WeekView({ activityMap }) {
  const days = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay();
    const result = [];
    for (let i = dayOfWeek; i >= 0; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i); result.push(toDateKey(d));
    }
    for (let i = dayOfWeek + 1; i < 7; i++) result.push(null);
    return result;
  }, []);

  const values = days.map((key) => (key ? activityMap[key] || 0 : null));
  const maxVal = Math.max(...values.filter((v) => v !== null), 1);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-3 h-40 px-2">
        {days.map((dateKey, i) => {
          const count = values[i];
          const isFuture = count === null;
          return (
            <div
              key={i}
              className={`flex-1 flex flex-col items-center gap-1 ${!isFuture ? "cursor-pointer group" : ""}`}
              onMouseEnter={(e) => {
                if (!isFuture && dateKey) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ dateKey, count, x: rect.left + rect.width / 2, y: rect.top });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              {!isFuture && (
                <span className="text-[10px] text-zinc-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
              )}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: isFuture ? "4px" : `${Math.max((count / maxVal) * 100, count > 0 ? 4 : 2)}%` }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full rounded-t-lg transition-all min-h-[2px] ${isFuture ? "bg-zinc-800/40 rounded-lg" : `${getBarColor(count, maxVal)} group-hover:brightness-125`}`}
                style={{ maxHeight: "100%" }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-2 px-2">
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="flex-1 text-center">
            <span className={`text-[9px] font-medium ${days[i] && toDateKey(new Date()) === days[i] ? "text-amber-400" : "text-zinc-600"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

function DaysView({ activityMap }) {
  const days = useMemo(() => buildLastNDays(30), []);
  const values = days.map((key) => activityMap[key] || 0);
  const maxVal = Math.max(...values, 1);
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-full">
      <div className="flex items-end gap-[3px] h-36 px-1">
        {days.map((dateKey, i) => {
          const count = values[i];
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center cursor-pointer group"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({ dateKey, count, x: rect.left + rect.width / 2, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((count / maxVal) * 100, count > 0 ? 4 : 2)}%` }}
                transition={{ duration: 0.4, delay: i * 0.008, ease: [0.16, 1, 0.3, 1] }}
                className={`w-full rounded-t-sm transition-all min-h-[2px] ${getBarColor(count, maxVal)} group-hover:brightness-125`}
                style={{ maxHeight: "100%" }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex items-center mt-2 px-1">
        {days.map((dateKey, i) => {
          const showLabel = i === 0 || i === 14 || i === 29;
          const d = parseLocalDate(dateKey);
          return (
            <div key={i} className="flex-1 text-center">
              {showLabel && (
                <span className="text-[9px] text-zinc-600">
                  {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          );
        })}
      </div>
      <HeatmapTooltip tooltip={tooltip} />
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 min-w-0 bg-zinc-900/30 border border-amber-500/10 hover:border-amber-500/20 rounded-xl p-3.5 flex flex-col gap-1.5 transition-colors"
    >
      <div className="w-7 h-7 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.05)]">
        <Icon size={14} />
      </div>
      <div className="mt-0.5">
        <p className="text-lg font-extrabold text-zinc-100 leading-none">{value}</p>
        {subtitle && <p className="text-[10px] text-amber-400/80 font-bold mt-1 leading-none">{subtitle}</p>}
      </div>
      <p className="text-[10px] text-zinc-500 font-semibold leading-tight">{label}</p>
    </motion.div>
  );
}

// ─── View Tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "year",  label: "Year" },
  { id: "month", label: "Month" },
  { id: "week",  label: "Week" },
  { id: "days",  label: "30 Days" },
];

// ─── Main Component ────────────────────────────────────────────────────────
export default function ActivityTracker() {
  const dispatch = useDispatch();
  const { activityMap, currentStreak, longestStreak, totalCompleted, isLoading } = useSelector(
    (state) => state.StreakSlice
  );

  const [activeView, setActiveView] = useState("year");

  useEffect(() => {
    dispatch(fetchStreakData());
  }, [dispatch]);

  // ── Milestone celebration toast ───────────────────────────────────────────
  // Listens for the custom event fired by StreakSlice's optimistic reducer
  // and shows a rich, animated toast so the user feels the achievement.
  useEffect(() => {
    const handleMilestone = (e) => {
      const { emoji, badge, days } = e.detail;
      toast(
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={badge}>{emoji}</span>
          <div>
            <p className="font-black text-amber-300 text-sm">{days}-Day Streak! 🎉</p>
            <p className="text-xs text-zinc-300 mt-0.5">
              You unlocked <span className="font-bold text-amber-400">{badge}</span>!
            </p>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          style: {
            background: "linear-gradient(135deg, #1c1003, #2d1e00)",
            border: "1px solid rgba(245,158,11,0.4)",
            boxShadow: "0 0 24px rgba(245,158,11,0.2)",
            color: "#fef3c7",
          },
          progressStyle: { background: "#f59e0b" },
        }
      );
    };
    window.addEventListener("todo-streak-milestone", handleMilestone);
    return () => window.removeEventListener("todo-streak-milestone", handleMilestone);
  }, []);

  const thisYearTotal = useMemo(() => {
    const thisYear = new Date().getFullYear();
    return Object.entries(activityMap).reduce((sum, [key, count]) => {
      return parseLocalDate(key).getFullYear() === thisYear ? sum + count : sum;
    }, 0);
  }, [activityMap]);

  const bestDay = useMemo(() => {
    const { key, count } = getBestDay(activityMap);
    return key
      ? {
          count,
          date: parseLocalDate(key).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }
      : null;
  }, [activityMap]);

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="border-b border-zinc-900/60 pb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-amber-400" />
          <h2 className="text-lg font-bold text-zinc-100">Activity Tracker</h2>
        </div>
        <p className="text-[10px] text-zinc-500 mt-1">
          Track your consistency and stay on your streak.
        </p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500">Loading activity data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Streak Highlight (Duolingo-style) ── */}
          <StreakHighlightCard
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            activityMap={activityMap}
          />

          {/* ── Analytics Stats Row ── */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={CheckCircle2} label="Total Completed" value={totalCompleted} delay={0} />
            <StatCard icon={TrendingUp}   label="This Year"        value={thisYearTotal}  delay={0.06} />
            <StatCard
              icon={Calendar}
              label="Best Day"
              value={bestDay ? `${bestDay.count} task${bestDay.count !== 1 ? "s" : ""}` : "—"}
              subtitle={bestDay ? bestDay.date : undefined}
              delay={0.12}
            />
          </div>

          {/* View Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer focus:outline-none ${
                  activeView === tab.id
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 shadow-lg"
                    : "text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 min-h-0"
            >
              {activeView === "year"  && <YearHeatmap  activityMap={activityMap} />}
              {activeView === "month" && <MonthView    activityMap={activityMap} />}
              {activeView === "week"  && <WeekView     activityMap={activityMap} />}
              {activeView === "days"  && <DaysView     activityMap={activityMap} />}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
