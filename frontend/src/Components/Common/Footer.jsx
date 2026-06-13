import React from "react";
import { Link } from "react-router-dom";

function Footer({ minimal = false }) {
  const handleScroll = (e, id) => {
    const element = document.getElementById(id);
    if (element) {
      e.preventDefault();
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (minimal) {
    return (
      <footer className="relative z-10 border-t border-zinc-900/40 bg-zinc-950/20 backdrop-blur-sm py-6 text-zinc-500 text-xs w-full">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} todo. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <span className="text-purple-500/80">♥</span> for developers & creators
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/60 backdrop-blur-sm pt-16 pb-8 text-zinc-400 text-sm w-full">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 text-left">
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
            <a href="https://github.com/dev-kant-kumar" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 hover:text-purple-400 flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
            </a>
          </div>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-xs tracking-wider uppercase">Navigation</h4>
          <ul className="flex flex-col gap-2 text-zinc-500">
            <li><Link to="/#features" onClick={(e) => handleScroll(e, "features")} className="hover:text-white transition-colors">Features</Link></li>
            <li><Link to="/#stats" onClick={(e) => handleScroll(e, "stats")} className="hover:text-white transition-colors">Stats</Link></li>
            <li><Link to="/#preview" onClick={(e) => handleScroll(e, "preview")} className="hover:text-white transition-colors">Live Preview</Link></li>
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
  );
}

export default Footer;
