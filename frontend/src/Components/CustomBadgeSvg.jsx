import React from "react";

export function CustomBadgeSvg({ days, size = 120, isUnlocked = false }) {
  const grayscaleFilter = !isUnlocked ? "saturate(0.05) brightness(0.65)" : "none";
  
  if (days === 3) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_12px_rgba(245,158,11,0.25)]">
        <defs>
          <linearGradient id="bronzeBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#cd7f32" />
            <stop offset="50%" stopColor="#b87333" />
            <stop offset="100%" stopColor="#8c5222" />
          </linearGradient>
          <linearGradient id="bronzeInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#4a2e16" />
            <stop offset="100%" stopColor="#1a0f07" />
          </linearGradient>
          <linearGradient id="sparkGrad" x1="50" y1="20" x2="50" y2="80">
            <stop offset="0%" stopColor="#fff5e6" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="45" stroke="url(#bronzeBorder)" strokeWidth="4" fill="url(#bronzeInner)" />
        <circle cx="50" cy="50" r="38" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
        <g className="origin-center animate-[pulse_3s_ease-in-out_infinite]">
          <path d="M50 20 L53 42 L75 45 L53 48 L50 70 L47 48 L25 45 L47 42 Z" fill="url(#sparkGrad)" />
          <circle cx="50" cy="45" r="4" fill="#ffffff" className="animate-ping" style={{ animationDuration: '3s' }} />
        </g>
        <text x="50" y="80" textAnchor="middle" fill="#fef3c7" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">3d</text>
      </svg>
    );
  }
  
  if (days === 7) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
        <defs>
          <linearGradient id="silverBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="silverInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="emeraldGrad" x1="50" y1="30" x2="50" y2="70">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        <polygon points="50,6 81,19 94,50 81,81 50,94 19,81 6,50 19,19" stroke="url(#silverBorder)" strokeWidth="4" fill="url(#silverInner)" />
        <polygon points="50,12 76,23 87,50 76,77 50,88 24,77 13,50 24,23" stroke="#64748b" strokeWidth="1" opacity="0.5" />
        <path d="M15,45 Q28,30 40,40 M85,45 Q72,30 60,40" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        <path d="M18,52 Q28,42 38,48 M82,52 Q72,42 62,48" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <g transform="translate(38, 28) scale(1.1)">
          <path d="M5,2 L19,2 L19,8 C19,12 16,15 12,15 C8,15 5,12 5,8 Z" fill="url(#emeraldGrad)" />
          <path d="M5,4 H2 Q1,4 1,7 Q1,10 5,9 M19,4 H22 Q23,4 23,7 Q23,10 19,9" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12,15 V19 M8,19 H16" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
        </g>
        <text x="50" y="80" textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">7d</text>
      </svg>
    );
  }
  
  if (days === 14) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]">
        <defs>
          <linearGradient id="purpleBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="purpleInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#0f052d" />
          </linearGradient>
          <linearGradient id="boltGrad" x1="50" y1="20" x2="50" y2="70">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" stroke="url(#purpleBorder)" strokeWidth="4" fill="url(#purpleInner)" />
        <polygon points="50,13 81,31 81,69 50,87 19,69 19,31" stroke="#8b5cf6" strokeWidth="1" opacity="0.4" />
        <g transform="translate(13, 0)">
          <path d="M28,22 L40,40 L32,44 L44,68 L24,44 L32,40 Z" fill="url(#boltGrad)" className="animate-pulse" />
          <path d="M46,22 L58,40 L50,44 L62,68 L42,44 L50,40 Z" fill="url(#boltGrad)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        </g>
        <text x="50" y="82" textAnchor="middle" fill="#f3e8ff" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">14d</text>
      </svg>
    );
  }
  
  if (days === 30) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_18px_rgba(6,182,212,0.35)]">
        <defs>
          <linearGradient id="cyanBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#083344" />
          </linearGradient>
          <linearGradient id="cyanInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#083344" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="gemGrad" x1="50" y1="28" x2="50" y2="62">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <polygon points="50,5 88,43 50,95 12,43" stroke="url(#cyanBorder)" strokeWidth="4" fill="url(#cyanInner)" />
        <polygon points="50,14 80,44 50,86 20,44" stroke="#0891b2" strokeWidth="1" opacity="0.4" />
        <g className="origin-center animate-[pulse_4s_ease-in-out_infinite]">
          <polygon points="50,25 35,35 65,35" fill="url(#gemGrad)" />
          <polygon points="35,35 22,45 35,50" fill="#0891b2" opacity="0.8" />
          <polygon points="65,35 78,45 65,50" fill="#0891b2" opacity="0.8" />
          <polygon points="35,35 50,25 35,50 M65,35 50,25 65,50" stroke="#083344" strokeWidth="0.5" />
          <polygon points="35,50 50,70 65,50" fill="url(#gemGrad)" opacity="0.9" />
          <polygon points="22,45 50,70 35,50" fill="#06b6d4" opacity="0.7" />
          <polygon points="78,45 50,70 65,50" fill="#06b6d4" opacity="0.7" />
        </g>
        <text x="50" y="85" textAnchor="middle" fill="#ecfeff" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">30d</text>
      </svg>
    );
  }
  
  if (days === 100) {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_20px_rgba(236,72,153,0.3)]">
        <defs>
          <linearGradient id="platBorder" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="50%" stopColor="#d1d5db" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
          <linearGradient id="platInner" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>
          <linearGradient id="goldTrident" x1="50" y1="20" x2="50" y2="65">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <path d="M20,10 H80 V45 C80,68 50,90 50,90 C50,90 20,68 20,45 Z" stroke="url(#platBorder)" strokeWidth="4" fill="url(#platInner)" />
        <path d="M25,15 H75 V45 C75,64 50,82 50,82 C50,82 25,64 25,45 Z" stroke="#9ca3af" strokeWidth="1" opacity="0.3" />
        <g stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
          <path d="M12,25 Q6,50 20,75 M88,25 Q94,50 80,75" />
          <circle cx="10" cy="35" r="1.5" fill="#9ca3af" />
          <circle cx="8" cy="50" r="1.5" fill="#9ca3af" />
          <circle cx="12" cy="65" r="1.5" fill="#9ca3af" />
          <circle cx="90" cy="35" r="1.5" fill="#9ca3af" />
          <circle cx="92" cy="50" r="1.5" fill="#9ca3af" />
          <circle cx="88" cy="65" r="1.5" fill="#9ca3af" />
        </g>
        <g transform="translate(0, 4)">
          <line x1="50" y1="28" x2="50" y2="62" stroke="url(#goldTrident)" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M40,25 Q50,42 60,25" stroke="url(#goldTrident)" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50,18 L50,28 M40,20 L40,27 M60,20 L60,27" stroke="url(#goldTrident)" strokeWidth="3" strokeLinecap="round" />
        </g>
        <text x="50" y="80" textAnchor="middle" fill="#f9fafb" fontSize="13" fontWeight="900" fontFamily="monospace" letterSpacing="0.5">100d</text>
      </svg>
    );
  }
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: grayscaleFilter }} className="drop-shadow-[0_0_25px_rgba(251,191,36,0.45)]">
      <defs>
        <linearGradient id="goldBorder" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="30%" stopColor="#eab308" />
          <stop offset="70%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <linearGradient id="goldInner" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#451a03" />
          <stop offset="100%" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id="rubyGrad" x1="50" y1="30" x2="50" y2="70">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <path d="M30,15 L36,25 L50,18 L64,25 L70,15 L62,30 H38 Z" fill="url(#goldBorder)" stroke="#ca8a04" strokeWidth="1" />
      <circle cx="30" cy="14" r="1.5" fill="#fde047" />
      <circle cx="50" cy="17" r="1.5" fill="#fde047" />
      <circle cx="70" cy="14" r="1.5" fill="#fde047" />
      <path d="M22,25 H78 V50 C78,72 50,92 50,92 C50,92 22,72 22,50 Z" stroke="url(#goldBorder)" strokeWidth="4.5" fill="url(#goldInner)" />
      <path d="M27,29 H73 V50 C73,67 50,84 50,84 C50,84 27,67 27,50 Z" stroke="#ca8a04" strokeWidth="1.5" opacity="0.4" />
      <path d="M50,30 L55,44 L70,44 L58,52 L62,66 L50,58 L38,66 L42,52 L30,44 L45,44 Z" fill="url(#rubyGrad)" stroke="url(#goldBorder)" strokeWidth="1.5" className="origin-center animate-[pulse_2.5s_ease-in-out_infinite]" />
      <text x="50" y="82" textAnchor="middle" fill="#fef9c3" fontSize="12" fontWeight="950" fontFamily="monospace" letterSpacing="0.5">365d</text>
    </svg>
  );
}
