import { Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaEnvelope, FaXTwitter } from "react-icons/fa6";
import { useState } from "react";

function Footer() {
  const [emailCopied, setEmailCopied] = useState(false);

  const handleEmailCopy = () => {
    navigator.clipboard.writeText("dev.techdeveloper@gmail.com");
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.02)_1px,transparent_0)] [background-size:20px_20px]"></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

      <div className="relative px-6 md:px-12 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <Link to="/" className="group inline-block">
                <div className="flex items-center mb-6 text-5xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    to
                  </span>
                  <span className="bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent ml-1 group-hover:from-violet-300 group-hover:via-purple-400 group-hover:to-indigo-400 transition-all duration-300">
                    do
                  </span>
                  <span className="text-gray-300 ml-1">.</span>
                </div>
              </Link>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-sm">
                Elevate your productivity with intelligent task management.
                Crafted for professionals who demand excellence.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>Trusted by 10K+ users</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg relative">
                Navigation
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {[
                  { to: "/home", label: "Dashboard" },
                  { to: "/profile", label: "Profile" },
                  { to: "/login", label: "Sign In" },
                  { to: "/sign-up", label: "Get Started" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block relative group"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -mx-2 px-2 py-1 rounded"></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg relative">
                Legal
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              </h4>
              <ul className="space-y-3">
                {[
                  {
                    to: "/legal/terms-and-conditions",
                    label: "Terms of Service",
                  },
                  { to: "/legal/privacy-policy", label: "Privacy Policy" },
                  { to: "/legal/cookie-policy", label: "Cookie Policy" },
                  { to: "/legal/accessibility", label: "Accessibility" },
                  { to: "/legal/refund-policy", label: "Refund Policy" },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-400 hover:text-white transition-all duration-300 hover:translate-x-1 inline-block relative group text-sm"
                    >
                      <span className="relative z-10">{link.label}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -mx-2 px-2 py-1 rounded"></div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Connect */}
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg relative">
                Connect
                <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"></div>
              </h4>

              <div className="mb-6">
                <p className="text-gray-400 mb-3 text-sm">
                  Ready to get started?
                </p>
                <button
                  onClick={handleEmailCopy}
                  className="group relative bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white px-4 py-2 rounded-lg transition-all duration-300 border border-slate-600 hover:border-slate-500 text-sm font-medium"
                >
                  <span className="flex items-center space-x-2">
                    <FaEnvelope className="text-violet-400" />
                    <span>{emailCopied ? "Email Copied!" : "Contact Us"}</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </button>
              </div>

              <div>
                <p className="text-gray-400 mb-4 text-sm">Follow our journey</p>
                <div className="flex space-x-4">
                  {[
                    {
                      href: "https://github.com/dev-kant-kumar",
                      icon: FaGithub,
                      label: "GitHub",
                    },
                    {
                      href: "https://linkedin.com/in/devkantkumar",
                      icon: FaLinkedin,
                      label: "LinkedIn",
                    },
                    {
                      href: "https://x.com/dev_kant_kumar",
                      icon: FaXTwitter,
                      label: "Twitter",
                    },
                    {
                      href: "mailto:dev.techdeveloper@gmail.com",
                      icon: FaEnvelope,
                      label: "Email",
                    },
                  ].map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="group relative p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:scale-110"
                      aria-label={label}
                    >
                      <Icon className="text-xl text-gray-400 group-hover:text-violet-400 transition-colors duration-300" />
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent"></div>

          {/* Bottom section */}
          <div className="mt-12 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-sm">
                © {currentYear}{" "}
                <span className="font-medium text-gray-400">todo</span> by{" "}
                <span className="font-medium bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  Dev Kant Kumar
                </span>
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Crafted with precision • All rights reserved
              </p>
            </div>

            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <Link
                to="/legal/terms-and-conditions"
                className="hover:text-gray-400 transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/legal/privacy-policy"
                className="hover:text-gray-400 transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/legal/delete-my-data"
                className="hover:text-gray-400 transition-colors"
              >
                Data Rights
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent"></div>
    </footer>
  );
}

export default Footer;
