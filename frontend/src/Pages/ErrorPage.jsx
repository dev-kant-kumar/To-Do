import { Link } from "react-router-dom";
import ImgPageNotFound from "../assets/errorpage.png";

function ErrorPage() {
  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

      {/* Minimalistic Header */}
      <header className="relative z-10 w-full border-b border-zinc-900 bg-zinc-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group select-none">
            <span className="w-6 h-6 rounded bg-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
              ✓
            </span>
            <span className="font-extrabold text-white text-lg tracking-tight group-hover:text-purple-400 transition-colors duration-200">
              todo<span className="text-purple-500">.</span>
            </span>
          </Link>
          
          <Link 
            to="/home" 
            className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-purple-400 transition-colors duration-250 select-none"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-grow max-w-lg w-full mx-auto px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="relative group w-full">
          {/* Glowing Aura Effect (Solid purple glow, no gradient) */}
          <div className="absolute -inset-0.5 bg-purple-600/10 rounded-2xl blur-xl opacity-100 transition duration-700" />
          
          <div className="relative bg-zinc-950/50 border border-zinc-800/80 backdrop-blur-md rounded-2xl p-8 sm:p-12 shadow-2xl w-full flex flex-col items-center gap-6">
            <div className="relative">
              {/* Subtle back glowing ring */}
              <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl scale-125" />
              <img
                src={ImgPageNotFound}
                alt="Page not found"
                className="relative h-44 sm:h-48 w-auto opacity-90 filter drop-shadow-[0_12px_24px_rgba(168,85,247,0.25)] select-none pointer-events-none transition-transform duration-500 hover:scale-[1.03]"
              />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/10 border border-purple-500/20 text-purple-300">
                Error 404
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Page Not Found
              </h1>
              <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
              </p>
            </div>

            <Link
              to="/home"
              className="mt-2 py-3 px-8 bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/30 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 border border-purple-500/20 focus:outline-none"
            >
              Return to Safety
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ErrorPage;
