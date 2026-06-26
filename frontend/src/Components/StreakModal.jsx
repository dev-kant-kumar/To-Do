import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ShareCardModal from "./ShareCard";

// ─── Milestone definitions ─────────────────────────────────────────────────
const MILESTONES = [
  { days: 3,   badge: "Starter Spark",      emoji: "✨" },
  { days: 7,   badge: "Week Warrior",        emoji: "🏆" },
  { days: 14,  badge: "Fortnight Force",     emoji: "⚡" },
  { days: 30,  badge: "Monthly Master",      emoji: "💎" },
  { days: 100, badge: "Century Centurion",   emoji: "🔱" },
  { days: 365, badge: "Legendary Streak",    emoji: "👑" },
];

function getMilestoneContext(streak) {
  // Find the previous milestone (already passed) and next milestone (coming up)
  let prevMilestone = { days: 0, badge: "Beginner", emoji: "🌱" };
  let nextMilestone = MILESTONES[0];

  for (let i = 0; i < MILESTONES.length; i++) {
    if (streak >= MILESTONES[i].days) {
      prevMilestone = MILESTONES[i];
      nextMilestone = MILESTONES[i + 1] || null;
    } else {
      nextMilestone = MILESTONES[i];
      break;
    }
  }

  const progress = nextMilestone
    ? (streak - prevMilestone.days) / (nextMilestone.days - prevMilestone.days)
    : 1;

  return { prevMilestone, nextMilestone, progress: Math.min(progress, 1) };
}

// ─── Helper: build current week (Mon → Sun) ────────────────────────────────
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function buildCurrentWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun

  // Monday-anchored week: go back to Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEK_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

// ─── Count-up animation hook ───────────────────────────────────────────────
function useCountUp(target, duration = 800) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const steps = 30;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── Animated Flame SVG ───────────────────────────────────────────────────
function FlameIcon({ size = 80 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="flameGlow" cx="50%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="flameGrad" x1="30" y1="80" x2="30" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fef08a" />
        </linearGradient>
        <linearGradient id="innerFlameGrad" x1="30" y1="80" x2="30" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fef9c3" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {/* Glow behind flame */}
      <ellipse cx="30" cy="72" rx="24" ry="8" fill="url(#flameGlow)" />
      {/* Main flame body */}
      <path
        d="M30 8 C30 8 14 28 14 46 C14 56 20 66 30 68 C40 66 46 56 46 46 C46 28 30 8 30 8Z"
        fill="url(#flameGrad)"
      />
      {/* Inner bright core */}
      <path
        d="M30 30 C30 30 22 42 22 52 C22 58 25 63 30 64 C35 63 38 58 38 52 C38 42 30 30 30 30Z"
        fill="url(#innerFlameGrad)"
      />
      {/* Spark dots */}
      <circle cx="42" cy="22" r="3" fill="#fef08a" opacity="0.8" />
      <circle cx="18" cy="16" r="2" fill="#fbbf24" opacity="0.6" />
    </svg>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────
function MilestoneProgressBar({ streak }) {
  const { prevMilestone, nextMilestone, progress } = getMilestoneContext(streak);

  // Show at most 4 visible milestones around current position
  const relevantMilestones = MILESTONES.filter(
    (m) => m.days <= (nextMilestone ? nextMilestone.days : 999)
  ).slice(-3);

  return (
    <div className="w-full px-2">
      <div className="flex items-center gap-0 w-full">
        {/* Start dot */}
        <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] flex-shrink-0 z-10" />

        {/* Progress track */}
        <div className="flex-1 relative h-2 bg-zinc-800 rounded-full mx-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_6px_rgba(251,191,36,0.5)]"
          />
          {/* Current position dot on track */}
          <motion.div
            initial={{ left: 0 }}
            animate={{ left: `calc(${progress * 100}% - 6px)` }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] z-10"
          />
        </div>

        {/* Next milestone dot */}
        {nextMilestone && (
          <div className="w-3.5 h-3.5 rounded-full bg-zinc-700 border border-zinc-600 flex-shrink-0" />
        )}
      </div>

      {/* Milestone labels */}
      <div className="flex justify-between mt-2 px-1">
        <span className="text-[10px] text-amber-400 font-bold">{prevMilestone.days}d</span>
        {nextMilestone && (
          <span className="text-[10px] text-zinc-500 font-semibold">{nextMilestone.days}d</span>
        )}
      </div>

      {/* Motivational message */}
      {nextMilestone && (
        <p className="text-center text-xs text-zinc-400 mt-3 leading-relaxed px-2">
          Stay faithful and reach{" "}
          <span className="text-amber-400 font-bold">{nextMilestone.days} days</span>
          {" "}— unlock your{" "}
          <span className="text-amber-300 font-bold">
            {nextMilestone.emoji} {nextMilestone.badge}
          </span>{" "}
          badge!
        </p>
      )}
      {!nextMilestone && (
        <p className="text-center text-xs text-amber-300 mt-3 font-bold">
          👑 You've achieved Legendary Streak status!
        </p>
      )}
    </div>
  );
}

// ─── Weekly Strip ─────────────────────────────────────────────────────────
function WeekStrip({ activityMap }) {
  const weekDays = useMemo(() => buildCurrentWeek(), []);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  return (
    <div className="w-full bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-4">
      <div className="grid grid-cols-7 gap-1.5">
        {/* Day labels */}
        {WEEK_LABELS.map((label, i) => {
          const isToday = weekDays[i].getTime() === today.getTime();
          return (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className={`text-[10px] font-bold ${isToday ? "text-amber-400" : "text-zinc-500"}`}>
                {label}
              </span>
              {/* Day circle */}
              {(() => {
                const dateKey = toDateKey(weekDays[i]);
                const hasActivity = activityMap[dateKey] && activityMap[dateKey] > 0;
                const isFuture = weekDays[i].getTime() > today.getTime();

                if (hasActivity) {
                  return (
                    <motion.div
                      initial={{ scale: 0.7 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05, type: "spring", stiffness: 400 }}
                      className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                    >
                      <span className="text-base leading-none">🔥</span>
                    </motion.div>
                  );
                } else if (isToday) {
                  return (
                    <div className="w-9 h-9 rounded-full border-2 border-amber-400 bg-amber-400/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400">{weekDays[i].getDate()}</span>
                    </div>
                  );
                } else if (isFuture) {
                  return (
                    <div className="w-9 h-9 rounded-full border border-zinc-700/40 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-600">{weekDays[i].getDate()}</span>
                    </div>
                  );
                } else {
                  // Past, no activity
                  return (
                    <div className="w-9 h-9 rounded-full border-2 border-zinc-700 bg-zinc-800/30 flex items-center justify-center">
                      <span className="text-xs font-medium text-zinc-500">{weekDays[i].getDate()}</span>
                    </div>
                  );
                }
              })()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Inline Icon Components for sharing ────────────────────────────────────
const TwitterIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.724-1.458L0 24zm6.59-4.846c1.666.988 3.31 1.488 5.35 1.489 5.525 0 10.018-4.494 10.022-10.02.002-2.678-1.04-5.195-2.934-7.09-1.894-1.896-4.412-2.939-7.092-2.94-5.532 0-10.024 4.493-10.028 10.02-.001 2.012.52 3.978 1.512 5.679L1.87 21.08l4.777-1.926zm10.741-6.195c-.3-.15-1.774-.875-2.049-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.266-.467-2.41-1.487-.889-.793-1.49-1.77-1.665-2.07-.175-.3-.019-.462.13-.612.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.625-.925-2.225-.244-.589-.491-.51-.675-.52-.175-.01-.375-.01-.575-.01-.2 0-.525.075-.8.375-.275.3-1.05 1.025-1.05 2.5 0 1.475 1.075 2.9 1.225 3.1.15.2 2.11 3.22 5.116 4.521.715.31 1.273.495 1.708.633.717.228 1.37.196 1.885.119.574-.085 1.774-.725 2.024-1.425.25-.7.25-1.3 0-1.425-.075-.125-.275-.2-.575-.35z" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" x2="5" y1="12" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

// ─── Theme Preset definitions for Share Card ──────────────────────────────
const STREAK_THEMES = [
  {
    id: "sunset",
    name: "Sunset Fire",
    bgStart: "#050508",
    bgEnd: "#130925",
    glowColor: "#f59e0b",
    accentColor: "#fbbf24",
    textStart: "#fef08a",
    textMiddle: "#f59e0b",
    textEnd: "#ea580c",
    flameStart: "#ea580c",
    flameMiddle: "#fbbf24",
    flameEnd: "#fef08a",
    btnStart: "#fbbf24",
    btnEnd: "#f59e0b",
  },
  {
    id: "amethyst",
    name: "Neon Amethyst",
    bgStart: "#050508",
    bgEnd: "#130925",
    glowColor: "#d946ef",
    accentColor: "#e879f9",
    textStart: "#fae8ff",
    textMiddle: "#d946ef",
    textEnd: "#a855f7",
    flameStart: "#8b5cf6",
    flameMiddle: "#d946ef",
    flameEnd: "#fae8ff",
    btnStart: "#e879f9",
    btnEnd: "#c084fc",
  },
  {
    id: "aurora",
    name: "Emerald Aurora",
    bgStart: "#050508",
    bgEnd: "#130925",
    glowColor: "#10b981",
    accentColor: "#34d399",
    textStart: "#ecfdf5",
    textMiddle: "#10b981",
    textEnd: "#059669",
    flameStart: "#059669",
    flameMiddle: "#34d399",
    flameEnd: "#a7f3d0",
    btnStart: "#34d399",
    btnEnd: "#059669",
  },
  {
    id: "blizzard",
    name: "Ice Blizzard",
    bgStart: "#050508",
    bgEnd: "#130925",
    glowColor: "#06b6d4",
    accentColor: "#22d3ee",
    textStart: "#ecfeff",
    textMiddle: "#06b6d4",
    textEnd: "#0284c7",
    flameStart: "#0284c7",
    flameMiddle: "#22d3ee",
    flameEnd: "#cffafe",
    btnStart: "#22d3ee",
    btnEnd: "#06b6d4",
  }
];

// ─── Main Modal Component ─────────────────────────────────────────────────
export default function StreakModal({ isOpen, onClose, currentStreak, longestStreak, activityMap, userInfo }) {
  const animatedCount = useCountUp(isOpen ? currentStreak : 0, 900);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState("streak");

  const weekDays = useMemo(() => buildCurrentWeek(), []);
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);


  const milestoneText = useMemo(() => {
    const { prevMilestone } = getMilestoneContext(currentStreak);
    return prevMilestone.days > 0
      ? `🏆 ${prevMilestone.badge} Milestone Badge Active!`
      : "🌱 Started a new habit journey!";
  }, [currentStreak]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Reset share modal state on open
  useEffect(() => {
    if (isOpen) {
      setShowShareModal(false);
      setShareType("streak");
    }
  }, [isOpen]);

  // Build share data from userInfo + streak props
  const shareData = {
    name: userInfo?.name || "User",
    username: userInfo?.username || "user",
    currentStreak: currentStreak || 0,
    longestStreak: longestStreak || 0,
    rank: userInfo?.rank || 1,
    level: userInfo?.level || 1,
    xp: userInfo?.xp || 0,
  };

  return (
    <>
      {/* ShareCardModal — rendered outside the streak modal so it can stack on top */}
      {showShareModal && (
        <ShareCardModal
          type={shareType}
          data={shareData}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                key="streak-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              />

              {/* Card */}
              <motion.div
                key="streak-card"
                initial={{ opacity: 0, scale: 0.88, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: 16 }}
                transition={{ type: "spring", stiffness: 340, damping: 28, delay: 0.05 }}
                className="relative w-full max-w-[380px] max-h-[92vh] overflow-y-auto rounded-[2rem] overflow-x-hidden z-10 shadow-2xl scrollbar-none"
                style={{ background: "linear-gradient(160deg, #111113 0%, #0a0a0c 100%)" }}
              >
                {/* Radial glow behind flame */}
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, transparent 70%)" }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 p-2 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 transition-all focus:outline-none cursor-pointer z-20"
                >
                  <X size={20} strokeWidth={2} />
                </button>

                <div className="flex flex-col items-center px-6 pt-8 pb-6 gap-5">
                  {/* Animated Flame */}
                  <motion.div
                    animate={{ scale: [1, 1.06, 1], y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-2"
                  >
                    <FlameIcon size={80} />
                  </motion.div>

                  {/* Streak count */}
                  <div className="flex flex-col items-center gap-0.5 -mt-1">
                    <motion.span
                      className="text-6xl font-black leading-none"
                      style={{
                        background: "linear-gradient(180deg, #fef08a 0%, #f59e0b 60%, #d97706 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {animatedCount}
                    </motion.span>
                    <span className="text-lg font-bold text-amber-400/90 tracking-wide">
                      day streak
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-zinc-800/80" />

                  {/* Milestone Progress Bar */}
                  <MilestoneProgressBar streak={currentStreak} />

                  {/* Divider */}
                  <div className="w-full h-px bg-zinc-800/80" />

                  {/* Weekly Strip */}
                  <div className="w-full">
                    <WeekStrip activityMap={activityMap} />
                  </div>

                  {/* Stats row */}
                  <div className="flex w-full gap-3">
                    <div className="flex-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Current</p>
                      <p className="text-xl font-black text-amber-400 mt-1">{currentStreak}d</p>
                    </div>
                    <div className="flex-1 bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Longest</p>
                      <p className="text-xl font-black text-zinc-200 mt-1">{longestStreak}d</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col w-full gap-2.5">
                    {/* Primary: Continue */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={onClose}
                      className="w-full py-3.5 rounded-xl font-black text-sm text-zinc-950 cursor-pointer focus:outline-none shadow-lg"
                      style={{ background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" }}
                    >
                      Continue
                    </motion.button>

                    {/* Share Cards — 3-button row */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: "streak", label: "Streak", emoji: "🔥" },
                        { type: "rank",   label: "Rank",   emoji: "🏆" },
                        { type: "achievement", label: "Level", emoji: "⚡" },
                      ].map((card) => (
                        <motion.button
                          key={card.type}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setShareType(card.type); setShowShareModal(true); }}
                          className="py-2.5 rounded-xl font-bold text-xs text-amber-400 hover:text-amber-300 border border-amber-500/25 hover:border-amber-400/50 bg-amber-500/5 hover:bg-amber-500/10 transition-all cursor-pointer focus:outline-none flex flex-col items-center gap-1"
                        >
                          <span className="text-base leading-none">{card.emoji}</span>
                          <span>{card.label}</span>
                        </motion.button>
                      ))}
                    </div>

                    {/* Tertiary: View Full Stats */}
                    <Link
                      to="/profile?tab=activity"
                      onClick={onClose}
                      className="w-full py-2.5 rounded-xl text-center text-xs font-bold text-zinc-400 hover:text-zinc-300 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/40 transition-all focus:outline-none"
                    >
                      View Full Stats →
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
