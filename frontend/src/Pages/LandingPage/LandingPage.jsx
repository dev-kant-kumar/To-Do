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
  LayoutDashboard
} from "lucide-react";

function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 overflow-hidden font-sans">
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

          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/40 p-1.5 rounded-xl border border-zinc-800/40">
            <a href="#features" onClick={(e) => handleScroll(e, "features")} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-all duration-200">Features</a>
            <a href="#stats" onClick={(e) => handleScroll(e, "stats")} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-all duration-200">Stats</a>
            <a href="#preview" onClick={(e) => handleScroll(e, "preview")} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/80 transition-all duration-200">Preview</a>
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-400 tracking-wide mb-8 animate-fade-in">
            <Sparkles size={12} className="animate-spin duration-3000" />
            <span>✨ Focus on what matters, stress less</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Master Your Day, <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-500">
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
                  className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 duration-200"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dashboard Mock Preview */}
        <section id="preview" className="relative max-w-4xl mx-auto rounded-2xl border border-zinc-800 bg-[#0d0d16]/70 shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-hidden backdrop-blur-sm p-4 sm:p-6 mb-24 transition-transform hover:scale-[1.01] duration-300">
          <div className="flex items-center justify-start gap-2 border-b border-zinc-800/80 pb-4 mb-6">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          {/* Dummy Dashboard Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {/* Left Sidebar Mock */}
            <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 flex flex-col gap-4">
              <div className="font-bold text-zinc-300 tracking-wide text-xs uppercase px-2">Filters</div>
              <ul className="flex flex-col gap-1.5">
                <li className="flex items-center justify-between px-3 py-2 bg-purple-900/20 border border-purple-500/30 rounded-lg text-purple-300 font-medium">
                  <span className="flex items-center gap-2"><ListTodo size={14} /> All Tasks</span>
                  <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-xs font-bold">4</span>
                </li>
                <li className="flex items-center justify-between px-3 py-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <span className="flex items-center gap-2"><Star size={14} /> Starred</span>
                  <span className="text-zinc-600 font-bold">1</span>
                </li>
                <li className="flex items-center justify-between px-3 py-2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  <span className="flex items-center gap-2"><CheckCircle2 size={14} /> Completed</span>
                  <span className="text-zinc-600 font-bold">2</span>
                </li>
              </ul>
            </div>

            {/* Main Content Mock */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-zinc-200">Active Tasks</h3>
                <span className="text-xs text-zinc-500">Today</span>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400"><Star size={16} fill="currentColor" /></span>
                    <span className="font-medium text-zinc-200">Refactor route protection layout</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">10:45 AM</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600"><Star size={16} /></span>
                    <span className="font-medium text-zinc-300">Add form loading states and spinner</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">09:15 AM</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/60 border border-zinc-800/80 rounded-xl opacity-50">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-700"><Star size={16} /></span>
                    <span className="font-medium text-zinc-400 line-through">Draft landing page layout mockup</span>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">08:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="pt-8 pb-20 border-t border-zinc-900/40">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white mb-4">
              Packed with Premium Features
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base">
              Everything you need to focus on tasks, structure daily milestones, and eliminate backlog.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="group bg-zinc-950/40 border border-zinc-800/60 hover:border-purple-500/40 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.08)]">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <Star size={20} className="fill-current" />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Priority Starring</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Highlight high-importance items instantly. Starred tasks stay front-and-center for focused execution.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-zinc-950/40 border border-zinc-800/60 hover:border-purple-500/40 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.08)]">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <ListFilter size={20} />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Instant Filters</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Filter tasks by Active, Starred, Today's schedule, and Deleted archive lists in one click.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-zinc-950/40 border border-zinc-800/60 hover:border-purple-500/40 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.08)]">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Status Tracking</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Track complete and pending tasks with real-time indicators and dynamic side-bar counts.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-zinc-950/40 border border-zinc-800/60 hover:border-purple-500/40 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(168,85,247,0.08)]">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">Secure & Private</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Rest easy knowing your tasks and personal agenda are protected by secure modern encryption.
              </p>
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
