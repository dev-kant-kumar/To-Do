function LoadingPage() {
  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-100 flex flex-col items-center justify-center font-sans overflow-hidden">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
        {/* Logo with pulsing glow */}
        <div className="flex items-center gap-2.5 animate-pulse select-none">
          <span className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-xl shadow-purple-500/30">
            ✓
          </span>
          <span className="font-extrabold text-white text-2xl tracking-tight">
            todo<span className="text-purple-500">.</span>
          </span>
        </div>

        {/* Premium Spinner */}
        <div className="relative w-12 h-12">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/10" />
          {/* Glowing Spinning Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 border-r-purple-500/80 animate-spin shadow-[0_0_15px_rgba(168,85,247,0.25)]" />
        </div>

        {/* Loading status text */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Loading
          </p>
          <p className="text-[11px] text-zinc-600">
            Setting up your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoadingPage;
