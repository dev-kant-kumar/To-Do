import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LogIn
} from "lucide-react";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
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
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 overflow-hidden font-sans bg-grid-pattern-glow">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse duration-[6000ms]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/15 blur-[160px] animate-pulse duration-[8000ms]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-blue-900/10 blur-[130px]" />
      </div>

      {/* Header */}
      <header className="sticky top-4 z-50 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="w-full h-16 px-6 flex items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl shadow-xl shadow-purple-900/5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-fuchsia-500 flex items-center justify-center font-extrabold text-white shadow-md shadow-purple-500/20 group-hover:scale-105 transition-all duration-200">
              ✓
            </span>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-purple-400 transition-colors">
              todo<span className="text-purple-500">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <a href="#features" onClick={(e) => handleScroll(e, "features")} className="px-3 py-1.5 text-sm font-semibold text-zinc-400 hover:text-purple-400 transition-colors duration-200">Features</a>
            <a href="#stats" onClick={(e) => handleScroll(e, "stats")} className="px-3 py-1.5 text-sm font-semibold text-zinc-400 hover:text-purple-400 transition-colors duration-200">Stats</a>
            <a href="#preview" onClick={(e) => handleScroll(e, "preview")} className="px-3 py-1.5 text-sm font-semibold text-zinc-400 hover:text-purple-400 transition-colors duration-200">Preview</a>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                to="/home"
                className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105 duration-200"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg shadow-purple-500/20 transition-all hover:scale-105 duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-28 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 tracking-wide mb-8 animate-fade-slide-up shadow-[0_0_15px_rgba(168,85,247,0.05)] select-none">
            <Sparkles size={12} className="animate-spin duration-[6000ms] text-purple-400" />
            <span>Focus on what matters, stress less</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Master Your Day, <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500 animate-pulse-slow">
              One Task at a Time.
            </span>
          </h1>

          <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
            Experience a beautifully designed, lightning-fast productivity tracker. Organize your thoughts, highlight daily priorities, track completed milestones, and stay ahead of your schedule with ease.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
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
          </div>
        </div>

        {/* Dashboard Mock Preview */}
        <section id="preview" className="relative max-w-4xl mx-auto rounded-2xl border border-zinc-800/80 bg-[#0d0d16]/40 shadow-[0_0_50px_rgba(168,85,247,0.1)] overflow-hidden backdrop-blur-md p-4 sm:p-6 mb-24 transition-transform hover:scale-[1.005] duration-300">
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
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-905/30"
                  }`}
                >
                  <span className="flex items-center gap-2"><ListTodo size={14} /> All Tasks</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    mockActiveTab === "all" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-650"
                  }`}>{mockTasks.length}</span>
                </li>
                <li 
                  onClick={() => setMockActiveTab("starred")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
                    mockActiveTab === "starred" 
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-300" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-905/30"
                  }`}
                >
                  <span className="flex items-center gap-2"><Star size={14} /> Starred</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    mockActiveTab === "starred" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-650"
                  }`}>{mockTasks.filter(t => t.starred).length}</span>
                </li>
                <li 
                  onClick={() => setMockActiveTab("completed")}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-all duration-200 ${
                    mockActiveTab === "completed" 
                      ? "bg-purple-500/10 border border-purple-500/20 text-purple-300" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-905/30"
                  }`}
                >
                  <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Completed</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                    mockActiveTab === "completed" ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-zinc-900 border-zinc-800 text-zinc-650"
                  }`}>{mockTasks.filter(t => t.completed).length}</span>
                </li>
              </ul>
            </div>

            {/* Main Content Mock */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between select-none">
                <h3 className="font-bold text-zinc-300 uppercase tracking-wider text-[10px]">Active Tasks ({mockActiveTab})</h3>
                <span className="text-[10px] text-zinc-550 font-mono">Today</span>
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
                          className="text-zinc-650 hover:text-red-400 p-0.5 rounded hover:bg-zinc-900/50 transition-all duration-150"
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
                  className="flex-grow px-3 py-2 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800/80 focus:border-purple-500/30 rounded-xl text-xs text-zinc-200 placeholder-zinc-650 focus:outline-none focus:bg-zinc-950/20 transition-all duration-200"
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
        </section>

        {/* Bento Grid Features Section */}
        <section id="features" className="pt-8 pb-24 border-t border-zinc-900/30">
          <div className="text-center max-w-2xl mx-auto mb-16 select-none">
            <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight leading-normal">
              Built to Optimize Your Focus
            </h2>
            <p className="text-zinc-400 text-xs sm:text-sm max-w-lg mx-auto">
              A minimalist environment designed to eliminate cognitive clutter, keep deadlines simple, and track progress effortlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-2">
            {/* Card 1: Priority Starring (Wide - Col-span 2) */}
            <div className="md:col-span-2 group relative overflow-hidden bg-zinc-950/45 border border-zinc-900 hover:border-purple-500/30 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_40px_rgba(168,85,247,0.06)] flex flex-col justify-between min-h-[260px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div>
                <div className="text-purple-400 mb-6 group-hover:scale-105 transition-transform flex items-center justify-start">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <Star size={20} fill={bentoStarred ? "currentColor" : "none"} className={bentoStarred ? "text-amber-400" : ""} />
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 text-left">Priority Starring</h3>
                <p className="text-zinc-400 text-xs sm:text-sm text-left leading-relaxed max-w-md">
                  Keep critical items front-and-center. Pinning a task highlights it on your dashboard, keeping your focus on what moves the needle most. Try it on the interactive row below:
                </p>
              </div>

              {/* Mini Interactive Starring Row Widget */}
              <div 
                onClick={() => setBentoStarred(!bentoStarred)}
                className="mt-6 flex items-center justify-between px-4 py-3 bg-zinc-900/20 border border-zinc-900 rounded-xl cursor-pointer hover:border-zinc-800 transition-colors max-w-md select-none"
              >
                <div className="flex items-center gap-3">
                  <Star size={16} fill={bentoStarred ? "currentColor" : "none"} className={bentoStarred ? "text-amber-400 animate-star-pulse" : "text-zinc-650"} />
                  <span className="text-xs font-semibold text-zinc-300">Complete architectural audit checklist</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">High</span>
              </div>
            </div>

            {/* Card 2: Smarter Workflows (Tall - Row-span 2) */}
            <div className="md:row-span-2 group relative overflow-hidden bg-zinc-950/45 border border-zinc-900 hover:border-purple-500/30 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_40px_rgba(168,85,247,0.06)] flex flex-col justify-between min-h-[380px]">
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
                    bentoFilter === "all" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "text-zinc-505 hover:text-zinc-350"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><ListTodo size={12} /> All Tasks</span>
                  <span className="text-[10px] text-zinc-550 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-900">12</span>
                </div>
                <div 
                  onClick={() => setBentoFilter("active")}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    bentoFilter === "active" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "text-zinc-505 hover:text-zinc-350"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Star size={12} fill={bentoFilter === "active" ? "currentColor" : "none"} /> Starred</span>
                  <span className="text-[10px] text-zinc-550 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-900">4</span>
                </div>
                <div 
                  onClick={() => setBentoFilter("deleted")}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    bentoFilter === "deleted" ? "bg-purple-500/10 text-purple-300 border border-purple-500/20" : "text-zinc-550 hover:text-zinc-350"
                  }`}
                >
                  <span className="flex items-center gap-1.5"><Trash2 size={12} /> Deleted</span>
                  <span className="text-[10px] text-zinc-550 bg-zinc-950/40 px-1.5 py-0.5 rounded border border-zinc-900">2</span>
                </div>
              </div>
            </div>

            {/* Card 3: Real-Time Progress (Square - Col-span 1) */}
            <div className="group relative overflow-hidden bg-zinc-950/45 border border-zinc-900 hover:border-purple-500/30 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_40px_rgba(168,85,247,0.06)] flex flex-col justify-between min-h-[260px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div>
                <div className="text-purple-400 mb-6 group-hover:scale-105 transition-transform flex items-center justify-start">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <CheckCircle2 size={20} />
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 text-left">Real-Time Progress</h3>
                <p className="text-zinc-400 text-xs sm:text-sm text-left leading-relaxed">
                  Celebrate small wins. Keep tabs on your completion rates and watch your productivity ratio update as you check off items.
                </p>
              </div>

              {/* Dynamic Progress Indicator Ring */}
              <div className="mt-4 flex items-center gap-4 bg-zinc-900/10 border border-zinc-900 rounded-xl p-3 select-none">
                {/* SVG Progress Circle */}
                <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 transform -rotate-90">
                    <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-zinc-800" strokeWidth="3.5" fill="transparent" />
                    <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-purple-500 transition-all duration-500" strokeWidth="3.5" fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 16}`}
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - (mockTasks.filter(t => t.completed).length / mockTasks.length))}`} />
                  </svg>
                  <span className="absolute text-[9px] font-bold text-purple-400">
                    {Math.round((mockTasks.filter(t => t.completed).length / mockTasks.length) * 100)}%
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-extrabold text-zinc-350 uppercase tracking-widest">Progress</span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {mockTasks.filter(t => t.completed).length} of {mockTasks.length} tasks completed
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Your Space, Your Data (Wide - Col-span 2) */}
            <div className="md:col-span-2 group relative overflow-hidden bg-zinc-950/45 border border-zinc-900 hover:border-purple-500/30 p-8 rounded-3xl transition-all duration-300 hover:shadow-[0_15px_40px_rgba(168,85,247,0.06)] flex flex-col justify-between min-h-[260px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div>
                <div className="text-purple-400 mb-6 group-hover:scale-105 transition-transform flex items-center justify-start">
                  <span className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <ShieldCheck size={20} />
                  </span>
                </div>
                <h3 className="font-bold text-white text-lg mb-2 text-left">Your Space, Your Data</h3>
                <p className="text-zinc-400 text-xs sm:text-sm text-left leading-relaxed max-w-md">
                  We take privacy seriously. Your workspace, tasks, and data are entirely yours. No tracking pixels, no advertisement profiling, and complete data export rights.
                </p>
              </div>

              {/* Secure Lock visual mock row */}
              <div className="mt-6 flex items-center justify-between px-4 py-3 bg-zinc-900/20 border border-zinc-900 rounded-xl max-w-md select-none">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-bold tracking-wide">Data Encrypted & Private</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-semibold">
                  Zero Third-Party Tracking
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
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

        {/* FAQ Section */}
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
                  className="bg-zinc-950/45 border border-zinc-900 rounded-2xl overflow-hidden transition-all duration-300"
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
                      activeFaq === idx ? "max-h-[200px] border-t border-zinc-900 bg-zinc-900/10" : "max-h-0 pointer-events-none"
                    } overflow-hidden`}
                  >
                    <p className="p-5 text-xs sm:text-sm text-zinc-400 leading-relaxed text-left">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/60 backdrop-blur-sm pt-16 pb-8 text-zinc-400 text-sm">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Column 1: Brand & Info */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2 group self-start">
              <span className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-white text-xs">
                ✓
              </span>
              <span className="font-extrabold text-white text-lg">todo.</span>
            </Link>
            <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed">
              Beautifully simple task tracking. Organize your thought process, track daily highlights, and achieve your goals with ease.
            </p>
            <div className="flex items-center gap-3.5 mt-2">
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 hover:text-purple-400 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </a>
              <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 hover:text-purple-400 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              </a>
            </div>
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

          {/* Column 4: System Status */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-white text-xs tracking-wider uppercase">Status</h4>
            <div className="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-900/60 text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
            <p className="text-zinc-600 text-xs mt-1 leading-relaxed">
              We sync and update your tasks securely. Backed by automated server checks.
            </p>
          </div>
        </div>

        {/* Separator Border */}
        <div className="max-w-6xl mx-auto px-6 border-t border-zinc-900/80 my-6"></div>

        {/* Bottom Bar */}
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} todo. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-purple-500/80">♥</span> for developers & creators
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
