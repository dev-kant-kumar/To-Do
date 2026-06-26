import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Award, 
  Lock, 
  ArrowLeft, 
  Trophy, 
  CheckCircle2, 
  Flame, 
  Shield 
} from "lucide-react";
import Header from "../Components/Header";
import BackgroundLayer from "../Components/BackgroundLayer";
import MobileNav from "../Components/MobileNav";
import { CustomBadgeSvg } from "../Components/CustomBadgeSvg";
import { fetchStreakData, STREAK_MILESTONES } from "../Store/Reducers/StreakSlice";

const getMilestoneCardStyle = (days) => {
  const styles = {
    3: {
      borderUnlocked: "border-amber-500/20 hover:border-amber-500/40",
      bgUnlocked: "bg-amber-500/[0.03] hover:bg-amber-500/[0.06]",
      shadowUnlocked: "shadow-[0_8px_30px_rgba(245,158,11,0.06)]",
      badgeGlow: "bg-amber-500/10 blur-xl",
      textColor: "text-amber-400"
    },
    7: {
      borderUnlocked: "border-emerald-500/20 hover:border-emerald-500/40",
      bgUnlocked: "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]",
      shadowUnlocked: "shadow-[0_8px_30px_rgba(16,185,129,0.06)]",
      badgeGlow: "bg-emerald-500/10 blur-xl",
      textColor: "text-emerald-400"
    },
    14: {
      borderUnlocked: "border-purple-500/20 hover:border-purple-500/40",
      bgUnlocked: "bg-purple-500/[0.03] hover:bg-purple-500/[0.06]",
      shadowUnlocked: "shadow-[0_8px_30px_rgba(168,85,247,0.06)]",
      badgeGlow: "bg-purple-500/10 blur-xl",
      textColor: "text-purple-400"
    },
    30: {
      borderUnlocked: "border-cyan-500/20 hover:border-cyan-500/40",
      bgUnlocked: "bg-cyan-500/[0.03] hover:bg-cyan-500/[0.06]",
      shadowUnlocked: "shadow-[0_8px_30px_rgba(6,182,212,0.06)]",
      badgeGlow: "bg-cyan-500/10 blur-xl",
      textColor: "text-cyan-400"
    },
    100: {
      borderUnlocked: "border-pink-500/20 hover:border-pink-500/40",
      bgUnlocked: "bg-pink-500/[0.03] hover:bg-pink-500/[0.06]",
      shadowUnlocked: "shadow-[0_8px_30px_rgba(236,72,153,0.06)]",
      badgeGlow: "bg-pink-500/10 blur-xl",
      textColor: "text-pink-400"
    },
    365: {
      borderUnlocked: "border-yellow-500/25 hover:border-yellow-500/55",
      bgUnlocked: "bg-yellow-500/[0.04] hover:bg-yellow-500/[0.08]",
      shadowUnlocked: "shadow-[0_8px_35px_rgba(234,179,8,0.1)]",
      badgeGlow: "bg-yellow-500/15 blur-2xl",
      textColor: "text-yellow-400"
    }
  };
  return styles[days] || styles[3];
};

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

export default function BadgesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.UserSlice);
  const { currentStreak, longestStreak } = useSelector((state) => state.StreakSlice);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    if (userInfo?.userId) {
      dispatch(fetchStreakData());
    }
  }, [userInfo?.userId, dispatch]);

  const { prevMilestone, nextMilestone } = useMemo(() => {
    return getMilestoneContext(currentStreak);
  }, [currentStreak]);

  // Count unlocked badges
  const unlockedCount = useMemo(() => {
    return STREAK_MILESTONES.filter(m => currentStreak >= m.days).length;
  }, [currentStreak]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-x-hidden font-sans pb-24 lg:pb-12">
      <BackgroundLayer />
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col gap-8 select-none mt-14 sm:mt-16">
        {/* Glow backdrop decoration */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] pointer-events-none rounded-full blur-[120px] opacity-70" 
          style={{ background: "radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, rgba(245, 158, 11, 0.04) 50%, transparent 100%)" }} 
        />

        {/* Navigation Pill Bar */}
        <div className="flex items-center relative z-10 mb-2">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-900/90 hover:scale-[1.02] transition-all text-xs font-black tracking-widest uppercase font-mono shadow-lg w-fit focus:outline-none cursor-pointer group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            <span>Dashboard</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Award className="text-amber-400" size={16} />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 font-mono">Consistency & Achievements</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 font-mono uppercase tracking-widest">
                Streak Badges
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-semibold mt-2 max-w-2xl leading-relaxed">
                Unlock ultra-premium metallic badges by keeping your task completion streak alive! Click any badge to inspect its requirements and download sharing cards.
              </p>
            </div>

            {/* Quick stats overview */}
            <div className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-4 self-start sm:self-center">
              <div className="text-center px-2">
                <div className="text-xs text-zinc-500 font-extrabold uppercase tracking-widest font-mono">Current</div>
                <div className="text-xl font-black text-amber-400 mt-1 font-mono">{currentStreak}d</div>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="text-center px-2">
                <div className="text-xs text-zinc-500 font-extrabold uppercase tracking-widest font-mono">Longest</div>
                <div className="text-xl font-black text-emerald-400 mt-1 font-mono">{longestStreak}d</div>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="text-center px-2">
                <div className="text-xs text-zinc-500 font-extrabold uppercase tracking-widest font-mono">Unlocked</div>
                <div className="text-xl font-black text-violet-400 mt-1 font-mono">{unlockedCount}/{STREAK_MILESTONES.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 w-full mt-2">
          {STREAK_MILESTONES.map((m) => {
            const isUnlocked = currentStreak >= m.days;
            const isNext = nextMilestone && nextMilestone.days === m.days;
            const tierStyle = getMilestoneCardStyle(m.days);
            
            let cardClass = "";
            if (isUnlocked) {
              cardClass = `bg-zinc-900/30 ${tierStyle.bgUnlocked} border ${tierStyle.borderUnlocked} ${tierStyle.shadowUnlocked}`;
            } else if (isNext) {
              cardClass = "bg-zinc-900/50 border-amber-500/35 hover:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.04)]";
            } else {
              cardClass = "bg-zinc-900/15 border-zinc-800/60 hover:border-zinc-800 hover:bg-zinc-900/30";
            }
            
            return (
              <motion.div 
                key={m.days} 
                onClick={() => {
                  setSelectedBadge(m);
                }}
                whileHover={{ scale: 1.03, y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`flex flex-col items-center gap-4 rounded-[28px] p-6 transition-all duration-300 cursor-pointer text-center relative select-none ${cardClass}`}
              >
                {/* Badge Svg inside the Grid cell */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative">
                  {isUnlocked && (
                    <div className={`absolute inset-0 rounded-full ${tierStyle.badgeGlow}`} />
                  )}
                  <CustomBadgeSvg days={m.days} size={96} isUnlocked={isUnlocked} />
                </div>

                <div className="flex flex-col gap-1 w-full mt-2">
                  <span className={`text-sm sm:text-base font-extrabold ${isUnlocked ? tierStyle.textColor : 'text-zinc-500'} font-mono uppercase tracking-wide`}>
                    {m.badge}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-zinc-500 font-mono tracking-widest uppercase">
                    {m.days} days streak
                  </span>
                </div>

                {/* Progress Bar for Locked/Next Badge */}
                {!isUnlocked && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between items-center text-[8px] font-black text-zinc-600 font-mono mb-1 uppercase tracking-widest">
                      <span>Progress</span>
                      <span>{currentStreak}/{m.days}d</span>
                    </div>
                    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900/40">
                      <div 
                        className={`h-full ${isNext ? 'bg-amber-500' : 'bg-zinc-700'} rounded-full`} 
                        style={{ width: `${Math.min((currentStreak / m.days) * 100, 100)}%` }} 
                      />
                    </div>
                  </div>
                )}

                {/* Status indicator tag */}
                <div className="mt-auto w-full pt-4 border-t border-zinc-900/80 flex items-center justify-center">
                  <span className={`text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider font-mono flex items-center gap-1.5 ${
                    isUnlocked 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : isNext
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                        : "bg-zinc-950 text-zinc-600 border border-zinc-900"
                  }`}>
                    {isUnlocked && <CheckCircle2 size={10} />}
                    {!isUnlocked && isNext && <Flame size={10} />}
                    {isUnlocked 
                      ? "Earned" 
                      : isNext
                        ? `Progress: ${currentStreak}/${m.days}d`
                        : `Locked`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

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
                className="absolute top-5 right-5 w-8.5 h-8.5 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer focus:outline-none"
              >
                ✕
              </button>

              {/* Header Status Tag */}
              <div className="mt-4">
                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest font-mono border ${
                  currentStreak >= selectedBadge.days 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]" 
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
              <div className="w-full bg-zinc-900/40 border border-zinc-800/85 rounded-2xl p-4 flex flex-col gap-2 mt-2">
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <MobileNav />
    </div>
  );
}
