import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import {
  Trophy,
  Flame,
  Sparkles,
  Crown,
  Search,
  TrendingUp,
  RefreshCw,
  Star,
  Zap,
  Shield,
  ChevronUp,
  Share2,
} from "lucide-react";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import BackgroundLayer from "../Components/BackgroundLayer";
import { fetchLeaderboardData } from "../Store/Reducers/LeaderboardSlice";
import { CustomBadgeSvg } from "../Components/CustomBadgeSvg";
import GamificationBar from "../Components/GamificationBar";
import ShareCardModal from "../Components/ShareCard";
import {
  getLevelInfo,
  getTierGradient,
} from "../utils/gamificationUtils";

const STREAK_MILESTONES = [3, 7, 14, 30, 100, 365];

// Floating particle component
function Particle({ delay, duration, x, size, color }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: 0,
        background: color,
        filter: "blur(1px)",
      }}
      animate={{
        y: [0, -120, -200],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.3],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 3,
        ease: "easeOut",
      }}
    />
  );
}

// Rank badge component for the table
function RankBadge({ rank }) {
  if (rank === 1) {
    return (
      <div className="relative inline-flex">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-400 to-orange-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center font-black text-black text-sm">
          1
        </div>
        <div className="absolute -top-1.5 -right-1.5">
          <Crown className="w-4 h-4 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_4px_rgba(253,224,71,0.8)]" />
        </div>
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.4)] flex items-center justify-center font-black text-slate-800 text-sm">
        2
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 shadow-[0_0_12px_rgba(180,83,9,0.5)] flex items-center justify-center font-black text-amber-100 text-sm">
        3
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-zinc-500 text-xs">
      {rank}
    </div>
  );
}

// Avatar with level tier border ring / glow
function Avatar({ name, level = 1, size = "md" }) {
  const initials = name ? name[0].toUpperCase() : "?";

  const sizeMap = {
    sm: "w-9 h-9 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
    xl: "w-20 h-20 text-lg",
    "2xl": "w-24 h-24 text-xl",
  };

  const levelInfo = getLevelInfo(level || 1);
  const tierStyle = getTierGradient(levelInfo.tier);

  return (
    <div className="relative flex-shrink-0">
      <div
        className={`${sizeMap[size]} rounded-2xl flex items-center justify-center font-black text-white relative z-10 border border-zinc-900 shadow-lg`}
        style={{
          boxShadow: `0 0 12px ${tierStyle.glow}`,
          background: `linear-gradient(135deg, #111 0%, #1a1a26 100%)`
        }}
      >
        <span className={`bg-gradient-to-br ${tierStyle.gradient} bg-clip-text text-transparent`}>
          {initials}
        </span>
      </div>
      
      {/* Outer Glow Ring */}
      <div
        className="absolute inset-[-1.5px] rounded-[18px] opacity-45 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${levelInfo.color}, transparent)`,
        }}
      />
    </div>
  );
}

// Podium card for top 3
function PodiumCard({ user, position, sortBy }) {
  const configs = {
    1: {
      height: "h-52 sm:h-64",
      avatarSize: "2xl",
      nameSize: "text-lg sm:text-xl",
      textColor: "text-amber-300",
      borderColor: "border-amber-400/50",
      bgGlow: "from-amber-500/15 via-yellow-500/5 to-transparent",
      topLine: "from-amber-300 via-yellow-400 to-amber-500",
      glowShadow: "shadow-[0_-20px_60px_-10px_rgba(245,158,11,0.25),0_0_40px_rgba(245,158,11,0.1)]",
      rankText: "text-amber-400",
      order: "order-2",
      topOffset: "",
      badgeSize: 20,
    },
    2: {
      height: "h-36 sm:h-44",
      avatarSize: "xl",
      nameSize: "text-sm sm:text-base",
      textColor: "text-slate-300",
      borderColor: "border-slate-400/40",
      bgGlow: "from-slate-500/10 via-slate-600/5 to-transparent",
      topLine: "from-slate-300 via-slate-400 to-slate-500",
      glowShadow: "shadow-[0_-10px_40px_-10px_rgba(148,163,184,0.2)]",
      rankText: "text-slate-400",
      order: "order-1",
      topOffset: "mt-16",
      badgeSize: 16,
    },
    3: {
      height: "h-28 sm:h-36",
      avatarSize: "lg",
      nameSize: "text-sm",
      textColor: "text-amber-600",
      borderColor: "border-amber-700/40",
      bgGlow: "from-amber-700/10 via-orange-800/5 to-transparent",
      topLine: "from-amber-600 via-orange-700 to-amber-800",
      glowShadow: "shadow-[0_-10px_30px_-10px_rgba(180,83,9,0.2)]",
      rankText: "text-amber-600",
      order: "order-3",
      topOffset: "mt-24",
      badgeSize: 14,
    },
  };

  const c = configs[position];

  const particles =
    position === 1
      ? [
          { delay: 0, duration: 2.5, x: 20, size: 4, color: "rgba(251,191,36,0.7)" },
          { delay: 0.8, duration: 3, x: 45, size: 3, color: "rgba(245,158,11,0.5)" },
          { delay: 1.5, duration: 2, x: 70, size: 5, color: "rgba(253,224,71,0.6)" },
          { delay: 0.3, duration: 3.5, x: 85, size: 2, color: "rgba(251,191,36,0.4)" },
        ]
      : [];

  return (
    <motion.div
      className={`flex flex-col items-center ${c.order} ${c.topOffset}`}
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: position === 1 ? 0 : position === 2 ? 0.15 : 0.25, ease: [0.34, 1.56, 0.64, 1] }}
    >
      {/* Crown for #1 */}
      {position === 1 && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-2"
        >
          <Crown className="w-10 h-10 text-amber-300 fill-amber-400/30 drop-shadow-[0_0_15px_rgba(253,224,71,0.7)]" />
        </motion.div>
      )}

      {/* Avatar */}
      <motion.div
        animate={position === 1 ? { y: [0, -4, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mb-3"
      >
        <Avatar name={user.name} level={user.level || 1} size={c.avatarSize} />
      </motion.div>

      {/* Name & username */}
      <p className={`${c.nameSize} font-black text-zinc-100 truncate max-w-[110px] sm:max-w-[140px] mb-0.5 text-center`}>
        {user.name}
      </p>
      <p className="text-[11px] text-zinc-500 truncate max-w-[100px] sm:max-w-[130px] mb-2 text-center">
        @{user.username}
      </p>

      {/* Badges */}
      {user.badgesCount > 0 && (
        <div className="flex items-center justify-center gap-0.5 mb-3 flex-wrap">
          {STREAK_MILESTONES.slice(0, user.badgesCount).map((days) => (
            <div key={days} className="hover:scale-125 transition-transform" title={`${days}-day badge`}>
              <CustomBadgeSvg days={days} size={c.badgeSize} isUnlocked={true} />
            </div>
          ))}
        </div>
      )}

      {/* Pedestal Column */}
      <div
        className={`relative w-full min-w-[100px] sm:min-w-[140px] ${c.height} bg-gradient-to-t ${c.bgGlow} border-t border-x ${c.borderColor} rounded-t-3xl overflow-hidden ${c.glowShadow} flex flex-col items-center justify-center gap-1`}
      >
        {/* Top glow line */}
        <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${c.topLine}`} />
        {/* Subtle shimmer sweep */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, delay: position * 0.8, ease: "linear", repeatDelay: 2 }}
        />

        {/* Particles for #1 */}
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}

        <span className={`text-4xl sm:text-5xl font-black ${c.rankText} drop-shadow-[0_0_20px_currentColor] z-10`}>
          {position}
        </span>

        <div className="z-10 text-center px-2">
          {sortBy === "xp" ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] sm:text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                Lvl {user.level}
              </span>
              <span className="text-[10px] font-semibold text-zinc-400">{user.xp.toLocaleString()} XP</span>
            </div>
          ) : (
            <span className={`text-[10px] sm:text-xs font-bold text-amber-400 flex items-center gap-1 justify-center`}>
              <Flame className="w-3 h-3 fill-amber-500" />
              {user.currentStreak}d streak
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const dispatch = useDispatch();
  const { rankings, currentUser, isLoading, error } = useSelector((s) => s.LeaderboardSlice);
  const authUser = useSelector((s) => s.UserSlice);

  const [sortBy, setSortBy] = useState("xp");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState("rank");

  useEffect(() => {
    dispatch(fetchLeaderboardData(sortBy)).unwrap().catch((err) => toast.error(`${err}`));
  }, [dispatch, sortBy]);

  const handleRefresh = () => {
    dispatch(fetchLeaderboardData(sortBy))
      .unwrap()
      .then(() => toast.success("🏆 Leaderboard refreshed!"))
      .catch((err) => toast.error(`${err}`));
  };

  const filteredRankings = rankings.filter((user) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return user.name?.toLowerCase().includes(q) || user.username?.toLowerCase().includes(q);
  });

  const top3 = rankings.slice(0, 3);
  // Reorder: [2nd, 1st, 3rd]
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

  const getStatValue = (user) =>
    sortBy === "xp" ? `${user.xp.toLocaleString()} XP` : `${user.currentStreak}d streak`;

  return (
    <div className="min-h-screen text-zinc-100 font-sans relative overflow-x-hidden">
      <BackgroundLayer />
      <Header />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-amber-500/6 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/2 w-72 h-72 bg-purple-700/7 rounded-full blur-[90px]" />
      </div>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-24 pb-36 relative z-10">

        {/* ── HERO HEADER ─────────────────────────────────── */}
        <div className="relative mb-12">
          {/* Subtle top accent line */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left — Title block */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 mb-3"
              >
                <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-violet-400">
                  Arena Mode • Season 1
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3"
              >
                <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                  Community
                </span>
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Leaderboard
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-base text-zinc-400 max-w-sm leading-relaxed"
              >
                Rise through the ranks. Complete tasks, maintain streaks, and claim your glory.
              </motion.p>
            </div>

            {/* Right — Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              {/* Sort Toggle — pill style */}
              <div className="relative flex items-center bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-1.5 gap-1 shadow-xl backdrop-blur-md">
                {/* Animated pill indicator */}
                <motion.div
                  className="absolute top-1.5 bottom-1.5 rounded-xl bg-gradient-to-r from-violet-600/30 to-purple-600/20 border border-violet-500/30"
                  animate={{ left: sortBy === "xp" ? "6px" : "50%", right: sortBy === "xp" ? "50%" : "6px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />

                <button
                  onClick={() => setSortBy("xp")}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    sortBy === "xp" ? "text-violet-300" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Level / XP
                </button>
                <button
                  onClick={() => setSortBy("streak")}
                  className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    sortBy === "streak" ? "text-amber-300" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${sortBy === "streak" ? "fill-amber-500 text-amber-400" : ""}`} />
                  Active Streak
                </button>
              </div>

              {/* Refresh btn */}
              <motion.button
                whileTap={{ scale: 0.93, rotate: 360 }}
                transition={{ duration: 0.5 }}
                onClick={handleRefresh}
                className="p-3 bg-zinc-900/70 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800 rounded-xl transition-all cursor-pointer text-zinc-400 hover:text-zinc-100 shadow-lg"
                title="Refresh leaderboard"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* ── ERROR STATE ─────────────────────────────────── */}
        {error && (
          <div className="mb-8 p-4 bg-red-950/30 border border-red-500/30 rounded-2xl text-red-300 text-sm flex items-center gap-3">
            <Zap className="w-4 h-4 text-red-400 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* ── PODIUM ──────────────────────────────────────── */}
        {!searchQuery && top3.length > 0 && (
          <div className="relative mb-16">
            {/* Section divider glow */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            </div>

            {/* Podium container */}
            <div className="flex items-end justify-center gap-3 sm:gap-6 pb-0 pt-4">
              {/* Always render as [2nd, 1st, 3rd] order visually */}
              {top3[1] && <PodiumCard user={top3[1]} position={2} sortBy={sortBy} />}
              {top3[0] && <PodiumCard user={top3[0]} position={1} sortBy={sortBy} />}
              {top3[2] && <PodiumCard user={top3[2]} position={3} sortBy={sortBy} />}
            </div>
          </div>
        )}

        {/* ── SEARCH + COUNT ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-950/60 border border-zinc-800/70 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 backdrop-blur-md transition-all"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold sm:ml-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {filteredRankings.length} players ranked
          </div>
        </div>

        {/* ── RANKINGS TABLE ──────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800/60 bg-zinc-950/40 backdrop-blur-xl shadow-2xl">
          {/* Top border glow */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

          {/* Table header */}
          <div className="grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center px-5 py-3.5 border-b border-zinc-800/60 bg-zinc-900/30">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold w-14">Rank</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Player</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right pr-4 hidden sm:block">Badges</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right pr-4">Streak</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold text-right">XP</div>
          </div>

          {/* Empty / loading state */}
          {filteredRankings.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-violet-400 animate-spin" />
                  </div>
                  <p className="text-sm text-zinc-500">Loading champions...</p>
                </>
              ) : (
                <>
                  <Trophy className="w-10 h-10 text-zinc-700" />
                  <p className="text-sm text-zinc-600">No players found</p>
                </>
              )}
            </div>
          )}

          {/* Rows */}
          <div className="divide-y divide-zinc-900/50">
            {filteredRankings.map((user, idx) => {
              const isSelf = user.username === authUser.username;
              const isTop3 = user.rank <= 3;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02, duration: 0.3 }}
                  onHoverStart={() => setHoveredRow(user.id)}
                  onHoverEnd={() => setHoveredRow(null)}
                  className={`relative grid grid-cols-[auto_1fr_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center px-5 py-3.5 transition-all cursor-default
                    ${isSelf
                      ? "bg-violet-950/20 border-l-2 border-l-violet-500"
                      : hoveredRow === user.id
                      ? "bg-zinc-900/30"
                      : ""}
                  `}
                >
                  {/* Hover shimmer */}
                  {hoveredRow === user.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-violet-500/3 via-transparent to-transparent pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}

                  {/* Rank */}
                  <div className="w-14 flex items-center">
                    <RankBadge rank={user.rank} />
                  </div>

                  {/* Player info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={user.name} level={user.level || 1} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-bold truncate ${
                            isSelf ? "text-violet-300" : "text-zinc-200"
                          }`}
                        >
                          {user.name}
                        </span>
                        {isSelf && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/25 flex-shrink-0">
                            <Star className="w-2 h-2 fill-violet-400" /> You
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 font-semibold flex-shrink-0">
                          Lvl {user.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-600">@{user.username}</span>
                        {/* Mobile badges */}
                        {user.badgesCount > 0 && (
                          <div className="sm:hidden flex items-center gap-0.5">
                            {STREAK_MILESTONES.slice(0, Math.min(user.badgesCount, 3)).map((days) => (
                              <CustomBadgeSvg key={days} days={days} size={14} isUnlocked={true} />
                            ))}
                            {user.badgesCount > 3 && (
                              <span className="text-[9px] text-zinc-500 font-bold">+{user.badgesCount - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges — desktop */}
                  <div className="hidden sm:flex items-center gap-0.5 pr-4 justify-end">
                    {user.badgesCount > 0 ? (
                      <>
                        {STREAK_MILESTONES.slice(0, Math.min(user.badgesCount, 4)).map((days) => (
                          <div key={days} className="hover:scale-125 transition-transform" title={`${days}d badge`}>
                            <CustomBadgeSvg days={days} size={18} isUnlocked={true} />
                          </div>
                        ))}
                        {user.badgesCount > 4 && (
                          <span className="text-[10px] text-zinc-600 font-bold ml-0.5">+{user.badgesCount - 4}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-zinc-800 text-xs">—</span>
                    )}
                  </div>

                  {/* Streak */}
                  <div className="pr-4 text-right">
                    {user.currentStreak > 0 ? (
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                        sortBy === "streak"
                          ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                          : "text-amber-500"
                      }`}>
                        <Flame className="w-3 h-3 fill-amber-500" />
                        {user.currentStreak}d
                      </div>
                    ) : (
                      <span className="text-zinc-700 text-xs">—</span>
                    )}
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <span className={`text-sm font-black font-mono ${
                      sortBy === "xp" ? "text-violet-300" : "text-zinc-400"
                    }`}>
                      {user.xp.toLocaleString()}
                    </span>
                    <div className="text-[9px] text-zinc-700 font-semibold">XP</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom glow */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
        </div>

        {/* ── FLOATING SELF CARD ───────────────────────────── */}
        <AnimatePresence>
          {currentUser && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 260, damping: 25 }}
              className="fixed bottom-5 left-0 right-0 z-50 px-4 sm:px-6 pointer-events-none"
            >
              <div className="max-w-7xl mx-auto pointer-events-auto">
                <div className="relative rounded-2xl bg-zinc-950/95 border border-violet-500/30 backdrop-blur-2xl shadow-[0_20px_60px_rgba(139,92,246,0.2),0_0_0_1px_rgba(139,92,246,0.1)] overflow-hidden">
                  {/* Top shimmer line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
                  {/* Ambient glow */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/5 to-purple-600/5 blur-xl" />

                  <div className="relative flex items-center justify-between gap-4 px-5 py-3.5 flex-wrap sm:flex-nowrap">
                    {/* Left — rank + label */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/25 to-purple-600/15 border border-violet-400/30 flex items-center justify-center font-black text-violet-300 text-base shadow-[0_0_12px_rgba(139,92,246,0.3)]">
                          #{currentUser.rank}
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 text-left">
                          <span className="text-sm font-black text-zinc-100">Your Rank</span>
                          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                        <div className="text-xs text-zinc-500 text-left">Complete more tasks to climb!</div>
                      </div>
                    </div>

                    {/* Right — stats */}
                    <div className="flex items-center gap-3 sm:gap-5 flex-wrap sm:flex-nowrap justify-end">
                      {currentUser.badgesCount > 0 && (
                        <div className="hidden sm:flex flex-col items-end gap-0.5">
                          <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Badges</span>
                          <div className="flex items-center gap-0.5">
                            {STREAK_MILESTONES.slice(0, currentUser.badgesCount).map((days) => (
                              <CustomBadgeSvg key={days} days={days} size={14} isUnlocked={true} />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col items-end">
                        <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Streak</span>
                        <span className="text-sm font-black text-amber-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          {currentUser.currentStreak}d
                        </span>
                      </div>

                      {/* Gamification Bar */}
                      <div className="pl-3 sm:pl-4 border-l border-zinc-800/80 flex items-center justify-end">
                        <GamificationBar xp={currentUser.xp || 0} streak={currentUser.currentStreak || 0} size="sm" showStreak={false} className="w-24 sm:w-32" />
                      </div>

                      {/* Share button */}
                      <button
                        onClick={() => {
                          setShareType("rank");
                          setShowShareModal(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-[10px] uppercase tracking-wider transition-colors cursor-pointer shadow-md flex items-center gap-1.5 flex-shrink-0"
                      >
                        <Share2 size={11} />
                        <span className="hidden sm:inline">Share Rank</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showShareModal && currentUser && (
          <ShareCardModal
            type={shareType}
            data={{
              name: authUser.name || currentUser.name,
              username: authUser.username || currentUser.username,
              rank: currentUser.rank,
              level: currentUser.level,
              xp: currentUser.xp,
              currentStreak: currentUser.currentStreak,
              longestStreak: currentUser.longestStreak || currentUser.currentStreak,
            }}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </main>
    </div>
  );
}
