import React from "react";
import { useBackground } from "../hooks/useBackground";
import { Link, useLocation } from "react-router-dom";
import { Palette } from "lucide-react";

export default function BackgroundLayer() {
  const { image, settings } = useBackground();
  const location = useLocation();

  const getTintOverlayClass = () => {
    switch (settings.tint) {
      case "dark":
        return "bg-black/60";
      case "purple":
        return "bg-purple-950/25";
      case "blue":
        return "bg-blue-950/25";
      case "warm":
        return "bg-amber-950/20";
      default:
        return "bg-transparent";
    }
  };

  const isProfilePage = location.pathname === "/profile";

  return (
    <>
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 transition-all duration-300">
        {image ? (
          <>
            {/* Custom Background Image */}
            <div
              className="absolute inset-0 transition-all duration-500 scale-[1.02]"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: "cover",
                backgroundPosition: settings.position || "center",
                backgroundRepeat: "no-repeat",
                opacity: settings.opacity,
                filter: settings.blur > 0 ? `blur(${settings.blur}px)` : "none",
              }}
            />
            {/* Tint Overlay */}
            <div className={`absolute inset-0 ${getTintOverlayClass()} transition-colors duration-300`} />
          </>
        ) : (
          <>
            {/* Default ambient flow background */}
            <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
            <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
          </>
        )}
      </div>

      {/* Floating Action Button to Customize Background - Hidden on mobile/tablet to avoid overlapping bottom navigation */}
      {!isProfilePage && (
        <Link
          to="/profile?tab=appearance"
          className="hidden lg:flex fixed bottom-6 right-6 z-30 items-center gap-2 p-3 rounded-full bg-zinc-950/85 border border-purple-500/35 text-purple-300 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.55)] hover:bg-purple-950/20 hover:border-purple-500/60 hover:text-purple-200 hover:scale-[1.05] transition-all duration-300 cursor-pointer active:scale-95 group focus:outline-none"
          title="Customize Background"
        >
          <Palette size={18} className="animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-350 ease-out whitespace-nowrap text-[10px] font-extrabold uppercase tracking-wider">
            Change BG
          </span>
        </Link>
      )}
    </>
  );
}
