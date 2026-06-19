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
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-650">
        <p>© {new Date().getFullYear()} todo. All rights reserved.</p>
        <div className="flex items-center gap-3.5">
          <a href="https://x.com/dev_kant_kumar" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-zinc-500 hover:text-purple-400 transition-colors duration-200">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
          </a>
          <span className="text-zinc-800">|</span>
          <p className="flex items-center gap-1">
            Made with <span className="text-purple-500/80">♥</span> for developers & creators
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
