import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Star,
  ListFilter,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  ListTodo,
  TrendingUp,
  LayoutDashboard,
  Plus,
  Trash2,
  ChevronDown,
  HelpCircle,
  Lock,
  LogIn,
  Calendar,
  Flame,
  SlidersHorizontal
} from "lucide-react";
import { getToken } from "../../utils/auth";

// Reusable scroll-triggered fade-in component
function FadeInWhenVisible({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Interactive Live Mock Dashboard States
  const [mockTasks, setMockTasks] = useState([
    { id: 1, text: "Refactor route protection layout", description: "Improve routing validation logic", starred: true, completed: false, time: "10:45 AM" },
    { id: 2, text: "Add form loading states and spinner", description: "Add UX state loaders", starred: false, completed: false, time: "09:15 AM" },
    { id: 3, text: "Draft landing page layout mockup", description: "Wireframe landing design", starred: false, completed: true, time: "08:00 AM" }
  ]);
  const [mockActiveTab, setMockActiveTab] = useState("all");
  const [newMockText, setNewMockText] = useState("");

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState(null);

  // Bento Interactive Features State
  const [bentoStarred, setBentoStarred] = useState(true);
  const [bentoFilter, setBentoFilter] = useState("active");

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const token = getToken();
    setIsLoggedIn(!!token);

    const handleScrollEvent = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScrollEvent);
    return () => window.removeEventListener("scroll", handleScrollEvent);
  }, []);

  const handleScroll = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Live mockup handlers
  const handleToggleMockStarred = (id) => {
    setMockTasks(prev => prev.map(t => t.id === id ? { ...t, starred: !t.starred } : t));
  };

  const handleToggleMockCompleted = (id) => {
    setMockTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteMockTask = (id) => {
    setMockTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddMockTask = (e) => {
    e.preventDefault();
    if (!newMockText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newMockText.trim(),
      description: "Added live on preview",
      starred: false,
      completed: false,
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    };
    setMockTasks(prev => [...prev, newTask]);
    setNewMockText("");
  };

  const filteredMockTasks = mockTasks.filter(t => {
    if (mockActiveTab === "starred") return t.starred;
    if (mockActiveTab === "completed") return t.completed;
    return true; // show all
  });

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 font-sans bg-grid-pattern-glow overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse duration-[6000ms]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/15 blur-[160px] animate-pulse duration-[8000ms]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[130px]" />
      </div>

      {/* Header */}
      <header className={`fixed left-1/2 -translate-x-1/2 z-50 max-w-6xl w-full px-4 sm:px-6 transition-all duration-500 ease-in-out ${isScrolled ? "top-2 scale-[0.99]" : "top-4"}`}>
        <div className={`w-full flex items-center justify-between rounded-2xl border transition-all duration-500 ease-in-out premium-glow-border ${
          isScrolled 
            ? "h-14 px-5 bg-zinc-950/90 backdrop-blur-xl border-purple-500/25 shadow-[0_0_30px_rgba(168,85,247,0.15)]" 
            : "h-16 px-6 bg-zinc-950/70 backdrop-blur-xl border-zinc-800/80 shadow-xl shadow-purple-900/5"
        }`}>
          <Link to={isLoggedIn ? "/home" : "/"} className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center font-extrabold text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-all duration-200">
              ✓
            </span>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-purple-400 transition-colors">
              todo<span className="text-purple-500">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <a href="#features" onClick={(e) => handleScroll(e, "features")} className="px-1 py-1 text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-200 nav-link-hover">Features</a>
            <a href="#stats" onClick={(e) => handleScroll(e, "stats")} className="px-1 py-1 text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-200 nav-link-hover">Stats</a>
            <a href="#preview" onClick={(e) => handleScroll(e, "preview")} className="px-1 py-1 text-sm font-semibold text-zinc-400 hover:text-white transition-colors duration-200 nav-link-hover">Preview</a>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                to="/home"
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 duration-200"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors nav-link-hover"
                >
                  Log In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 md:pt-36 pb-24">
        <div className="text-center max-w-3xl mx-auto relative">
          {/* Neon Radial Glow behind Hero Content */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none select-none z-0" />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 tracking-wide mb-8 shadow-[0_0_15px_rgba(168,85,247,0.05)] select-none"
          >
            <Sparkles size={12} className="animate-spin duration-[6000ms] text-purple-400" />
            <span>Focus on what matters, stress less</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight"
          >
            Master Your Day, <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 animate-pulse-slow">
              One Task at a Time.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 text-lg text-zinc-400 mb-10 leading-relaxed"
          >
            Experience a beautifully designed, lightning-fast productivity tracker. Organize your thoughts, highlight daily priorities, track completed milestones, and stay ahead of your schedule with ease.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            {isLoggedIn ? (
              <Link
                to="/home"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-xl shadow-purple-500/35 hover:shadow-purple-500/50 transition-all hover:-translate-y-0.5 duration-200"
              >
                Go to Your Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link
                  to="/sign-up"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-xl shadow-purple-500/35 hover:shadow-purple-500/50 transition-all hover:-translate-y-0.5 duration-200"
                >
                  Get Started for Free
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 duration-200 backdrop-blur-sm"
                >
                  <LogIn size={18} />
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* Dashboard Mock Preview */}
        <motion.section
          id="preview"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto rounded-2xl border border-zinc-800/50 bg-[#0d0d16]/40 shadow-[0_0_50px_rgba(168,85,247,0.1)] overflow-hidden backdrop-blur-md p-4 sm:p-6 mb-24 hover:shadow-[0_0_70px_rgba(168,85,247,0.15)] transition-shadow duration-500 premium-glow-border premium-glow-border-hover"
        >
          {/* Top macbook-style dots */}
          <div className="flex items-center justify-between border-b border-zinc-900/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <div className="text-[10px] text-zinc-500 font-mono tracking-widest bg-zinc-950/40 px-2 py-0.5 rounded border border-zinc-900/60 uppercase">
              Interactive Preview
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {/* Left Sidebar Mock */}
            <div className="bg-zinc-950/60 border border-zinc-900/80 rounded-xl p-4 flex flex-col gap-4 select-none">
              <div className="font-bold text-zinc-400 tracking-wider text-[10px] uppercase px-2 text-left">Filters</div>
              <ul className="flex flex-col gap-1.5">
                <li 
                  onClick={() => setMockActiveTab("all")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
                    mockActiveTab === "all" 
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-300" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                  }`}
                >
                  <span className="flex items-center gap-2"><ListTodo size={14} /> All Tasks</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    mockActiveTab === "all" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>{mockTasks.length}</span>
                </li>
                <li 
                  onClick={() => setMockActiveTab("starred")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
                    mockActiveTab === "starred" 
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-300" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                  }`}
                >
                  <span className="flex items-center gap-2"><Star size={14} /> Starred</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    mockActiveTab === "starred" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>{mockTasks.filter(t => t.starred).length}</span>
                </li>
                <li 
                  onClick={() => setMockActiveTab("completed")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
                    mockActiveTab === "completed" 
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-300" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/30"
                  }`}
                >
                  <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Completed</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    mockActiveTab === "completed" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                  }`}>{mockTasks.filter(t => t.completed).length}</span>
                </li>
              </ul>
            </div>

            {/* Main Content Mock */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between select-none">
                <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Active Tasks ({mockActiveTab})</h3>
                <span className="text-[10px] text-zinc-400 font-mono">Today</span>
              </div>

              {/* Tasks List */}
              <div className="flex flex-col gap-2.5 max-h-[185px] overflow-y-auto pr-1 scrollbar-none">
                {filteredMockTasks.length === 0 ? (
                  <div className="py-8 text-center text-zinc-600 text-xs border border-zinc-900 rounded-xl bg-zinc-950/20">
                    No tasks in this filter view. Add one below!
                  </div>
                ) : (
                  filteredMockTasks.map(task => (
                    <div 
                      key={task.id} 
                      className={`flex items-center justify-between px-4 py-3 bg-zinc-900/20 border border-zinc-900/80 hover:border-zinc-800 rounded-xl transition-all duration-205 animate-fade-slide-up ${
                        task.completed ? "opacity-45" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox trigger */}
                        <button 
                          onClick={() => handleToggleMockCompleted(task.id)}
                          className="w-4 h-4 rounded border border-zinc-700 flex items-center justify-center text-purple-400 hover:border-purple-500 transition-colors bg-transparent cursor-pointer"
                        >
                          {task.completed && <span className="w-2 h-2 rounded bg-purple-500 animate-scale-up"></span>}
                        </button>
                        {/* Star trigger */}
                        <button 
                          onClick={() => handleToggleMockStarred(task.id)}
                          className={`cursor-pointer transition-colors ${task.starred ? "text-amber-400 hover:text-amber-300" : "text-zinc-600 hover:text-zinc-500"}`}
                        >
                          <Star size={14} fill={task.starred ? "currentColor" : "none"} />
                        </button>
                        <span className={`font-semibold text-xs text-left truncate max-w-[150px] sm:max-w-[280px] strike-through-animate transition-all duration-300 ${
                          task.completed ? "completed text-zinc-500" : "text-zinc-200"
                        }`}>
                          {task.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-zinc-600 font-mono">{task.time}</span>
                        <button 
                          onClick={() => handleDeleteMockTask(task.id)}
                          className="text-zinc-400 hover:text-red-400 p-0.5 rounded hover:bg-zinc-900/50 transition-all duration-150"
                          title="Delete Task"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Mock Task Input */}
              <form onSubmit={handleAddMockTask} className="flex gap-2 mt-1">
                <input 
                  type="text" 
                  value={newMockText}
                  onChange={(e) => setNewMockText(e.target.value)}
                  placeholder="Type a task and press Enter (e.g. Try starring me)..."
                  className="flex-grow px-3 py-2 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800/80 focus:border-purple-500/30 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:bg-zinc-950/20 transition-all duration-200"
                />
                <button 
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/40 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
                >
                  <Plus size={12} className="stroke-[3]" />
                  <span>Add</span>
                </button>
              </form>
            </div>
          </div>
        </motion.section>

        {/* Bento Grid Features Section */}
        <section id="features" className="pt-8 pb-24 border-t border-zinc-900/30">
          <FadeInWhenVisible>
          <div className="text-center max-w-2xl mx-auto mb-16 select-none">
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight leading-normal">
              Built to Optimize Your Focus
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto">
              A minimalist environment designed to eliminate cognitive clutter, keep deadlines simple, and track progress effortlessly.
            </p>
          </div>
          </FadeInWhenVisible>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-2">
            {/* Card 1: Command Planner (Wide - Col-span 2) */}
            <FadeInWhenVisible delay={0} className="md:col-span-2 h-full">
            <div className="group relative overflow-hidden bg-zinc-950/40 backdrop-blur-xl border border-zinc-900/80 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(168,85,247,0.08)] flex flex-col justify-between min-h-[260px] h-full premium-glow-border premium-glow-border-hover">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div>
                <div className="text-purple-400 mb-6 group-hover:scale-105 transition-transform flex items-center justify-start">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Calendar size={20} className="text-amber-400" />
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 text-left">Command Planner</h3>
                <p className="text-zinc-400 text-xs sm:text-sm text-left leading-relaxed max-w-md">
                  Plan your week and month tasks visually on a modern calendar. Columns in Week View expand smoothly on hover to showcase task titles and details at a glance.
                </p>
              </div>

              {/* Mini Interactive Column Accordion Row Widget */}
              <div className="mt-6 flex gap-2 select-none">
                {["Mon", "Tue", "Wed", "Thu (Today)", "Fri"].map((day) => {
                  const isToday = day.includes("Today");
                  return (
                    <div 
                      key={day}
                      className={`flex-grow p-2.5 rounded-xl border text-center transition-all duration-300 flex flex-col gap-1 cursor-pointer min-w-[50px] hover:flex-[1.8] ${
                        isToday 
                          ? "border-amber-500/40 bg-amber-500/5 text-amber-400 font-extrabold" 
                          : "border-zinc-800/80 bg-zinc-900/10 text-zinc-400"
                      }`}
                    >
                      <span className="text-[9px] uppercase tracking-wider">{day}</span>
                      <span className="text-[10px] text-zinc-100 font-semibold">{isToday ? "2 tasks" : "Empty"}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            </FadeInWhenVisible>

            {/* Card 2: Smarter Workflows (Tall - 1 Column) */}
            <FadeInWhenVisible delay={0.1} className="h-full">
            <div className="group relative overflow-hidden bg-zinc-950/40 backdrop-blur-xl border border-zinc-900/80 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(168,85,247,0.08)] flex flex-col justify-between min-h-[380px] h-full premium-glow-border premium-glow-border-hover">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div>
                <div className="text-purple-400 mb-6 group-hover:scale-105 transition-transform flex items-center justify-start">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <ListFilter size={20} />
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 text-left">Smarter Workflows</h3>
                <p className="text-zinc-400 text-xs sm:text-sm text-left leading-relaxed">
                  Switch categories instantly. View your overall list, focus on starred favorites, review today's deadlines, or restore previously deleted items in one click.
                </p>
              </div>

              {/* Mini Interactive Sidebar Tab widget */}
              <div className="mt-8 flex flex-col gap-2 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-3 select-none">
                <div 
                  onClick={() => setBentoFilter("all")}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    bentoFilter === "all" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><ListTodo size={12} /> All Tasks</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-900">12</span>
                </div>
                <div 
                  onClick={() => setBentoFilter("active")}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    bentoFilter === "active" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Star size={12} fill={bentoFilter === "active" ? "currentColor" : "none"} /> Starred</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-900">4</span>
                </div>
                <div 
                  onClick={() => setBentoFilter("deleted")}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    bentoFilter === "deleted" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Trash2 size={12} /> Deleted</span>
                  <span className="text-[10px] text-zinc-400 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-900">2</span>
                </div>
              </div>
            </div>
            </FadeInWhenVisible>

            {/* Card 3: Gamified Streaks (Square - Col-span 1) */}
            <FadeInWhenVisible delay={0.2} className="h-full">
            <div className="group relative overflow-hidden bg-zinc-950/40 backdrop-blur-xl border border-zinc-900/80 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(168,85,247,0.08)] flex flex-col justify-between min-h-[260px] h-full premium-glow-border premium-glow-border-hover">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div>
                <div className="text-purple-400 mb-6 group-hover:scale-105 transition-transform flex items-center justify-start">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Flame size={20} className="text-amber-500 animate-pulse" />
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 text-left">Gamified Streaks</h3>
                <p className="text-zinc-400 text-xs sm:text-sm text-left leading-relaxed">
                  Stay motivated. Track your consecutive active days, unlock achievement sparks, and maintain your momentum with streak stats and milestone badges.
                </p>
              </div>

              {/* Dynamic Streak Badge visual widget */}
              <div className="mt-4 flex items-center justify-between bg-zinc-900/20 border border-zinc-900 rounded-xl p-3 select-none">
                <div className="flex items-center gap-2">
                  <Flame size={15} className="text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-zinc-300">5 Day Streak!</span>
                </div>
                <span className="text-[9px] font-black bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </div>
            </div>
            </FadeInWhenVisible>

            {/* Card 4: Drag & Drop Scheduling (Wide - Col-span 2) */}
            <FadeInWhenVisible delay={0.15} className="md:col-span-2 h-full">
            <div className="group relative overflow-hidden bg-zinc-950/40 backdrop-blur-xl border border-zinc-900/80 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_20px_50px_rgba(168,85,247,0.08)] flex flex-col justify-between min-h-[260px] h-full premium-glow-border premium-glow-border-hover">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div>
                <div className="text-purple-400 mb-6 group-hover:scale-105 transition-transform flex items-center justify-start">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <SlidersHorizontal size={20} />
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 text-left">Backlog Drawer & Drag-to-Plan</h3>
                <p className="text-zinc-400 text-xs sm:text-sm text-left leading-relaxed max-w-md">
                  Keep unplanned tasks in your backlog drawer and schedule them instantly by dragging them onto the calendar columns, complete with smart protection from past planning.
                </p>
              </div>

              {/* Secure Drag visual mock row */}
              <div className="mt-6 flex items-center justify-between px-4 py-3 bg-zinc-900/20 border border-zinc-900 rounded-xl max-w-md select-none">
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-xs text-zinc-300 font-semibold truncate max-w-[200px]">Implement OAuth flows</span>
                </div>
                <div className="text-[10px] text-purple-400 font-extrabold uppercase bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 animate-pulse">
                  Drag to Calendar
                </div>
              </div>
            </div>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Stats Section */}
        <FadeInWhenVisible>
        <section id="stats" className="py-20 border-t border-zinc-900/40 bg-zinc-950/20 rounded-3xl p-8 sm:p-12 mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500 mb-2">
                10K+
              </div>
              <div className="text-zinc-400 text-sm font-medium">Tasks Logged & Completed</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500 mb-2">
                99.9%
              </div>
              <div className="text-zinc-400 text-sm font-medium">Uptime Availability</div>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-500 mb-2">
                Instant
              </div>
              <div className="text-zinc-400 text-sm font-medium">Real-time Cloud Sync</div>
            </div>
          </div>
        </section>
        </FadeInWhenVisible>

        {/* FAQ Section */}
        <FadeInWhenVisible>
        <section id="faq" className="py-20 border-t border-zinc-900/30">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16 select-none">
              <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight leading-normal flex items-center justify-center gap-2">
                <HelpCircle size={28} className="text-purple-400" />
                Frequently Asked Questions
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm">
                Got questions? We've got answers. Explore details about synchronization, privacy, and how we handle your task data.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  q: "How does todo. keep my tasks in sync?",
                  a: "todo. automatically syncs your tasks across all your devices in real-time. Any changes you make are saved instantly, so you can access your up-to-date checklist on any device."
                },
                {
                  q: "Is this application free to use?",
                  a: "Yes, todo. is completely free to use. Create an account, manage your lists, and enjoy all task management features with zero subscriptions."
                },
                {
                  q: "Can I access my tasks offline?",
                  a: "Your active session is stored securely in your browser so you can view tasks on the go. An active connection is needed to save new tasks and sync updates to your other devices."
                },
                {
                  q: "How do I request complete erasure of my data?",
                  a: "We take privacy seriously. You can navigate to settings or the dedicated data removal request page (/legal/delete-my-data) to permanently erase your profile, credentials, and all tasks from our servers."
                }
              ].map((faq, idx) => (
                <div 
                  key={idx}
                  className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-zinc-200 hover:text-white font-semibold text-sm cursor-pointer select-none transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown 
                      size={16} 
                      className={`text-zinc-500 transition-transform duration-300 ${
                        activeFaq === idx ? "rotate-180 text-purple-400" : ""
                      }`}
                    />
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      activeFaq === idx ? "max-h-[300px] bg-zinc-900/10" : "max-h-0 pointer-events-none"
                    } overflow-hidden`}
                  >
                    <p className="p-5 text-xs sm:text-sm text-zinc-400 leading-relaxed text-left border-t border-zinc-900">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        </FadeInWhenVisible>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/60 backdrop-blur-sm pt-16 pb-8 text-zinc-400 text-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Info */}
          <div className="flex flex-col gap-4">
            <Link to={isLoggedIn ? "/home" : "/"} className="flex items-center gap-2 group self-start">
              <span className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
                ✓
              </span>
              <span className="font-extrabold text-white text-lg">todo.</span>
            </Link>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
              Beautifully simple task tracking. Organize your thought process, track daily highlights, and achieve your goals with ease.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Navigation</h4>
            <ul className="flex flex-col gap-2 text-zinc-500">
              <li><a href="#features" onClick={(e) => handleScroll(e, "features")} className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#stats" onClick={(e) => handleScroll(e, "stats")} className="hover:text-white transition-colors">Stats</a></li>
              <li><a href="#preview" onClick={(e) => handleScroll(e, "preview")} className="hover:text-white transition-colors">Live Preview</a></li>
            </ul>
          </div>

          {/* Column 3: Legal Pages */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Legal</h4>
            <ul className="flex flex-col gap-2 text-zinc-500">
              <li><Link to="/legal/terms-and-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Support</h4>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
              Have questions or need assistance? Reach out to our support team directly.
            </p>
            <a 
              href="mailto:todo@devkantkumar.com" 
              className="text-purple-400 hover:text-purple-300 font-semibold text-xs sm:text-sm transition-colors duration-200 mt-1 self-start"
            >
              todo@devkantkumar.com
            </a>
          </div>
        </div>

        {/* Separator Border */}
        <div className="max-w-6xl mx-auto px-6 border-t border-zinc-900/80 my-6"></div>

        {/* Bottom Bar */}
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} todo. All rights reserved.</p>
          <div className="flex items-center gap-3.5">
            <a href="https://x.com/dev_kant_kumar" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-zinc-500 hover:text-purple-400 transition-colors duration-200">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
            <span className="text-zinc-800">|</span>
            <p className="flex items-center gap-1">
              Made with <span className="text-purple-500/80">♥</span> for everyone
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
