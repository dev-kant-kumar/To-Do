import React from "react";

function renderLockOverlay(isUnlocked) {
  if (isUnlocked) return null;
  return (
    <g className="lock-overlay">
      {/* Center glass circle */}
      <circle cx="60" cy="60" r="20" fill="#09090b" fillOpacity="0.65" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" />
      {/* Padlock Shackle */}
      <path d="M55,56 V52 A5,5 0 0,1 65,52 V56" stroke="#ffffff" strokeWidth="1.75" fill="none" strokeLinecap="round" opacity="0.9" />
      {/* Padlock Body */}
      <rect x="51" y="55" width="18" height="13" rx="3.5" fill="#27272a" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />
      {/* Keyhole */}
      <circle cx="60" cy="61.5" r="1.5" fill="#ffffff" opacity="0.9" />
      <path d="M60,63 V65.5" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.9" />
    </g>
  );
}

/**
 * CustomBadgeSvg
 * ─────────────────────────────────────────────────────
 * Premium metallic streak badges — static SVG only.
 * No CSS animation classes so they render cleanly as
 * exported PNG images in the share-card flow.
 *
 * Badge tiers:
 *   3   days → Starter Spark   (bronze circle)
 *   7   days → Week Warrior    (silver shield)
 *   14  days → Fortnight Force (purple hexagon)
 *   30  days → Monthly Master  (cyan diamond)
 *   100 days → Century Centurion (platinum crest)
 *   365 days → Legendary Streak (gold crown shield)
 */
export function CustomBadgeSvg({ days, size = 120, isUnlocked = false }) {
  const opacity = isUnlocked ? 1 : 0.75;
  const saturation = "none";

  /* ── 3-day: Starter Spark — Bronze Circle ──────────────── */
  if (days === 3) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        style={{ filter: saturation, opacity }}
      >
        <defs>
          <radialGradient id="b3_body" cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e8945a" />
            <stop offset="45%" stopColor="#c4641c" />
            <stop offset="100%" stopColor="#7a3008" />
          </radialGradient>
          <radialGradient id="b3_rim" cx="50%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#f4b97a" />
            <stop offset="60%" stopColor="#a0500f" />
            <stop offset="100%" stopColor="#5c2800" />
          </radialGradient>
          <radialGradient id="b3_spark" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#fff7ed" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </radialGradient>
          <filter id="b3_glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="b3_shine" x1="25%" y1="15%" x2="75%" y2="85%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer rim */}
        <circle cx="60" cy="60" r="56" fill="url(#b3_rim)" />
        {/* Rim shadow line */}
        <circle cx="60" cy="60" r="56" stroke="#5c2800" strokeWidth="1" fill="none" opacity="0.6" />
        {/* Inner raised edge */}
        <circle cx="60" cy="60" r="50" fill="none" stroke="#f4b97a" strokeWidth="1.5" opacity="0.4" />
        {/* Body */}
        <circle cx="60" cy="60" r="48" fill="url(#b3_body)" />

        {/* Engraved ring detail */}
        <circle cx="60" cy="60" r="40" fill="none" stroke="#7a3008" strokeWidth="1.5" opacity="0.5" />
        <circle cx="60" cy="60" r="38" fill="none" stroke="#f4b97a" strokeWidth="0.75" opacity="0.25" />

        {/* Spark / star emblem */}
        <g filter="url(#b3_glow)">
          <path
            d="M60 28 L63.5 50 L85 53 L63.5 57 L60 79 L56.5 57 L35 53 L56.5 50 Z"
            fill="url(#b3_spark)"
            stroke="#fde68a"
            strokeWidth="0.75"
            strokeLinejoin="round"
          />
          {/* Center gem */}
          <circle cx="60" cy="53" r="5.5" fill="#fff7ed" opacity="0.85" />
          <circle cx="60" cy="53" r="3" fill="#fbbf24" />
        </g>

        {/* Shine overlay */}
        <circle cx="60" cy="60" r="48" fill="url(#b3_shine)" />
        {/* Top specular */}
        <ellipse cx="47" cy="38" rx="14" ry="8" fill="white" opacity="0.12" />

        {/* Label band */}
        <rect x="22" y="88" width="76" height="18" rx="9" fill="#5c2800" opacity="0.85" />
        <rect x="22" y="88" width="76" height="18" rx="9" fill="none" stroke="#f4b97a" strokeWidth="0.75" opacity="0.5" />
        <text x="60" y="101" textAnchor="middle" fill="#fde68a" fontSize="10" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">3 DAYS</text>
        {renderLockOverlay(isUnlocked)}
      </svg>
    );
  }

  /* ── 7-day: Week Warrior — Silver Shield ───────────────── */
  if (days === 7) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        style={{ filter: saturation, opacity }}
      >
        <defs>
          <linearGradient id="b7_body" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#d4dce8" />
            <stop offset="35%" stopColor="#8ea3b8" />
            <stop offset="70%" stopColor="#4a637a" />
            <stop offset="100%" stopColor="#1e2f3f" />
          </linearGradient>
          <linearGradient id="b7_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0f4f8" />
            <stop offset="50%" stopColor="#7a9ab0" />
            <stop offset="100%" stopColor="#2c4255" />
          </linearGradient>
          <radialGradient id="b7_trophy" cx="40%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#e8f5e8" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#065f46" />
          </radialGradient>
          <linearGradient id="b7_shine" x1="15%" y1="8%" x2="70%" y2="65%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shield outer rim */}
        <path d="M60 8 L104 26 L104 64 C104 88 60 112 60 112 C60 112 16 88 16 64 L16 26 Z"
          fill="url(#b7_rim)" />
        {/* Shadow edge */}
        <path d="M60 8 L104 26 L104 64 C104 88 60 112 60 112 C60 112 16 88 16 64 L16 26 Z"
          stroke="#0f2030" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Shield inner body */}
        <path d="M60 15 L98 30 L98 64 C98 84 60 106 60 106 C60 106 22 84 22 64 L22 30 Z"
          fill="url(#b7_body)" />
        {/* Inner detail border */}
        <path d="M60 22 L92 35 L92 63 C92 80 60 98 60 98 C60 98 28 80 28 63 L28 35 Z"
          fill="none" stroke="#c5d5e4" strokeWidth="1" opacity="0.35" />

        {/* Trophy cup emblem */}
        <g>
          {/* Cup body */}
          <path d="M46 38 L74 38 L74 62 C74 70 67 74 60 74 C53 74 46 70 46 62 Z"
            fill="url(#b7_trophy)" />
          {/* Cup handles */}
          <path d="M46 42 L38 42 Q34 42 34 50 Q34 58 46 57"
            stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M74 42 L82 42 Q86 42 86 50 Q86 58 74 57"
            stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Stem */}
          <rect x="56" y="74" width="8" height="10" rx="2" fill="#34d399" />
          <rect x="49" y="84" width="22" height="5" rx="2.5" fill="#34d399" />
        </g>

        {/* Shine overlay */}
        <path d="M60 15 L98 30 L98 64 C98 84 60 106 60 106 C60 106 22 84 22 64 L22 30 Z"
          fill="url(#b7_shine)" />
        {/* Specular */}
        <ellipse cx="46" cy="32" rx="16" ry="9" fill="white" opacity="0.15" transform="rotate(-20 46 32)" />

        {/* Label */}
        <rect x="26" y="90" width="68" height="16" rx="8" fill="#0f2030" opacity="0.9" />
        <text x="60" y="102" textAnchor="middle" fill="#d4dce8" fontSize="9.5" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">7 DAYS</text>
        {renderLockOverlay(isUnlocked)}
      </svg>
    );
  }

  /* ── 14-day: Fortnight Force — Purple Hexagon ──────────── */
  if (days === 14) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        style={{ filter: saturation, opacity }}
      >
        <defs>
          <linearGradient id="b14_body" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="40%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>
          <linearGradient id="b14_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="50%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#3b0764" />
          </linearGradient>
          <radialGradient id="b14_bolt" cx="40%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#fdf4ff" />
            <stop offset="45%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#9333ea" />
          </radialGradient>
          <linearGradient id="b14_shine" x1="15%" y1="5%" x2="65%" y2="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Hexagon outer rim */}
        <polygon points="60,6 104,30 104,90 60,114 16,90 16,30"
          fill="url(#b14_rim)" />
        <polygon points="60,6 104,30 104,90 60,114 16,90 16,30"
          stroke="#1e0050" strokeWidth="1" fill="none" opacity="0.4" />
        {/* Inner body */}
        <polygon points="60,13 98,34 98,86 60,107 22,86 22,34"
          fill="url(#b14_body)" />
        {/* Engraved hex detail */}
        <polygon points="60,22 90,39 90,79 60,96 30,79 30,39"
          fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.3" />

        {/* Dual lightning bolt emblem */}
        <g>
          {/* Left bolt */}
          <path d="M42 34 L54 56 L46 60 L62 86 L50 64 L58 60 Z"
            fill="url(#b14_bolt)"
            stroke="#e9d5ff" strokeWidth="0.75" strokeLinejoin="round" />
          {/* Right bolt */}
          <path d="M58 34 L70 56 L62 60 L78 86 L66 64 L74 60 Z"
            fill="url(#b14_bolt)"
            stroke="#e9d5ff" strokeWidth="0.75" strokeLinejoin="round" />
        </g>

        {/* Shine */}
        <polygon points="60,13 98,34 98,86 60,107 22,86 22,34"
          fill="url(#b14_shine)" />
        <ellipse cx="44" cy="32" rx="16" ry="9" fill="white" opacity="0.14" transform="rotate(-25 44 32)" />

        {/* Label */}
        <rect x="24" y="90" width="72" height="16" rx="8" fill="#1e0050" opacity="0.9" />
        <text x="60" y="102" textAnchor="middle" fill="#e9d5ff" fontSize="9" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">14 DAYS</text>
        {renderLockOverlay(isUnlocked)}
      </svg>
    );
  }

  /* ── 30-day: Monthly Master — Cyan Diamond ─────────────── */
  if (days === 30) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        style={{ filter: saturation, opacity }}
      >
        <defs>
          <linearGradient id="b30_body" x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="40%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#083344" />
          </linearGradient>
          <linearGradient id="b30_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f7fa" />
            <stop offset="55%" stopColor="#0e7490" />
            <stop offset="100%" stopColor="#042f3e" />
          </linearGradient>
          <linearGradient id="b30_gem_top" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
          <linearGradient id="b30_gem_side" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#0e4f60" />
          </linearGradient>
          <linearGradient id="b30_shine" x1="10%" y1="5%" x2="60%" y2="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer diamond rim */}
        <polygon points="60,5 115,55 60,115 5,55"
          fill="url(#b30_rim)" />
        <polygon points="60,5 115,55 60,115 5,55"
          stroke="#042f3e" strokeWidth="1" fill="none" opacity="0.5" />
        {/* Inner body */}
        <polygon points="60,14 106,55 60,106 14,55"
          fill="url(#b30_body)" />
        {/* Inner detail */}
        <polygon points="60,22 98,55 60,98 22,55"
          fill="none" stroke="#a5f3fc" strokeWidth="0.75" opacity="0.3" />

        {/* Multi-facet gem emblem */}
        <g>
          {/* Crown facets */}
          <polygon points="60,25 42,42 78,42" fill="url(#b30_gem_top)" opacity="0.95" />
          {/* Left facet */}
          <polygon points="42,42 26,55 42,68" fill="url(#b30_gem_side)" opacity="0.8" />
          {/* Right facet */}
          <polygon points="78,42 94,55 78,68" fill="url(#b30_gem_side)" opacity="0.7" />
          {/* Middle left */}
          <polygon points="42,42 60,55 42,68" fill="#0891b2" opacity="0.9" />
          {/* Middle right */}
          <polygon points="78,42 60,55 78,68" fill="#0e7490" opacity="0.85" />
          {/* Bottom facet */}
          <polygon points="42,68 60,90 78,68 60,55" fill="url(#b30_gem_top)" opacity="0.75" />
          {/* Top highlight line */}
          <line x1="42" y1="42" x2="78" y2="42" stroke="white" strokeWidth="1" opacity="0.4" />
          {/* Center sparkle */}
          <circle cx="60" cy="55" r="4" fill="white" opacity="0.65" />
        </g>

        {/* Shine */}
        <polygon points="60,14 106,55 60,106 14,55"
          fill="url(#b30_shine)" />
        <ellipse cx="44" cy="30" rx="15" ry="8" fill="white" opacity="0.18" transform="rotate(-30 44 30)" />

        {/* Label */}
        <rect x="22" y="88" width="76" height="16" rx="8" fill="#042f3e" opacity="0.9" />
        <text x="60" y="100" textAnchor="middle" fill="#a5f3fc" fontSize="9" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">30 DAYS</text>
        {renderLockOverlay(isUnlocked)}
      </svg>
    );
  }

  /* ── 100-day: Century Centurion — Platinum Crest ───────── */
  if (days === 100) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        style={{ filter: saturation, opacity }}
      >
        <defs>
          <linearGradient id="b100_body" x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%" stopColor="#e8ecf0" />
            <stop offset="30%" stopColor="#b0bcc8" />
            <stop offset="70%" stopColor="#6b7f8f" />
            <stop offset="100%" stopColor="#1a2833" />
          </linearGradient>
          <linearGradient id="b100_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5f7f9" />
            <stop offset="50%" stopColor="#8fa5b8" />
            <stop offset="100%" stopColor="#1a2833" />
          </linearGradient>
          <radialGradient id="b100_trident" cx="40%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
          <linearGradient id="b100_shine" x1="12%" y1="5%" x2="62%" y2="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Shield crest — flat top */}
        <path d="M18 10 H102 V62 C102 90 60 112 60 112 C60 112 18 90 18 62 Z"
          fill="url(#b100_rim)" />
        <path d="M18 10 H102 V62 C102 90 60 112 60 112 C60 112 18 90 18 62 Z"
          stroke="#0a1520" strokeWidth="1" fill="none" opacity="0.4" />
        {/* Inner body */}
        <path d="M24 16 H96 V62 C96 86 60 106 60 106 C60 106 24 86 24 62 Z"
          fill="url(#b100_body)" />
        {/* Inner detail border */}
        <path d="M30 22 H90 V62 C90 82 60 98 60 98 C60 98 30 82 30 62 Z"
          fill="none" stroke="#c8d5e0" strokeWidth="0.75" opacity="0.3" />

        {/* Crown decoration atop shield */}
        <path d="M32 12 L32 4 M50 12 L50 2 M68 12 L68 2 M86 12 L86 4"
          stroke="url(#b100_trident)" strokeWidth="3" strokeLinecap="round" />
        <rect x="30" y="10" width="60" height="5" rx="2.5" fill="url(#b100_trident)" />

        {/* Trident / centurion emblem */}
        <g>
          {/* Center prong */}
          <line x1="60" y1="34" x2="60" y2="78" stroke="url(#b100_trident)" strokeWidth="4.5" strokeLinecap="round" />
          {/* Left prong */}
          <line x1="46" y1="34" x2="46" y2="54" stroke="url(#b100_trident)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Right prong */}
          <line x1="74" y1="34" x2="74" y2="54" stroke="url(#b100_trident)" strokeWidth="3.5" strokeLinecap="round" />
          {/* Cross bar */}
          <line x1="43" y1="46" x2="77" y2="46" stroke="url(#b100_trident)" strokeWidth="3" strokeLinecap="round" />
          {/* Tips — arrowheads */}
          <polygon points="60,26 56,35 64,35" fill="url(#b100_trident)" />
          <polygon points="46,27 43,34 49,34" fill="url(#b100_trident)" />
          <polygon points="74,27 71,34 77,34" fill="url(#b100_trident)" />
        </g>

        {/* Shine */}
        <path d="M24 16 H96 V62 C96 86 60 106 60 106 C60 106 24 86 24 62 Z"
          fill="url(#b100_shine)" />
        <ellipse cx="44" cy="28" rx="18" ry="9" fill="white" opacity="0.16" transform="rotate(-15 44 28)" />

        {/* Label */}
        <rect x="20" y="88" width="80" height="16" rx="8" fill="#0a1520" opacity="0.9" />
        <text x="60" y="100" textAnchor="middle" fill="#e8ecf0" fontSize="8.5" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">100 DAYS</text>
        {renderLockOverlay(isUnlocked)}
      </svg>
    );
  }

  /* ── 365-day: Legendary Streak — Gold Crown Shield ─────── */
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      style={{ filter: saturation, opacity }}
    >
      <defs>
        <linearGradient id="b365_body" x1="15%" y1="0%" x2="85%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="30%" stopColor="#eab308" />
          <stop offset="65%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
        <linearGradient id="b365_rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef9c3" />
          <stop offset="45%" stopColor="#d97706" />
          <stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <radialGradient id="b365_ruby" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="40%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
        <radialGradient id="b365_crown_gem" cx="40%" cy="25%" r="65%">
          <stop offset="0%" stopColor="#fbcfe8" />
          <stop offset="50%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#9d174d" />
        </radialGradient>
        <linearGradient id="b365_shine" x1="12%" y1="4%" x2="60%" y2="52%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ── Crown atop shield ── */}
      {/* Crown points */}
      <polygon points="28,22 36,8 44,22" fill="url(#b365_rim)" />
      <polygon points="52,22 60,6 68,22" fill="url(#b365_rim)" />
      <polygon points="76,22 84,8 92,22" fill="url(#b365_rim)" />
      {/* Crown gems on tips */}
      <circle cx="36" cy="8" r="4.5" fill="url(#b365_crown_gem)" />
      <circle cx="60" cy="6" r="5.5" fill="url(#b365_crown_gem)" />
      <circle cx="84" cy="8" r="4.5" fill="url(#b365_crown_gem)" />
      {/* Crown base band */}
      <rect x="26" y="20" width="68" height="8" rx="2" fill="url(#b365_rim)" />

      {/* ── Shield body ── */}
      {/* Outer rim */}
      <path d="M22 26 H98 V68 C98 94 60 114 60 114 C60 114 22 94 22 68 Z"
        fill="url(#b365_rim)" />
      <path d="M22 26 H98 V68 C98 94 60 114 60 114 C60 114 22 94 22 68 Z"
        stroke="#431407" strokeWidth="1.25" fill="none" opacity="0.4" />
      {/* Inner body */}
      <path d="M28 30 H92 V68 C92 90 60 108 60 108 C60 108 28 90 28 68 Z"
        fill="url(#b365_body)" />
      {/* Engraved cross lines */}
      <line x1="60" y1="30" x2="60" y2="108" stroke="#431407" strokeWidth="1" opacity="0.2" />
      <line x1="28" y1="65" x2="92" y2="65" stroke="#431407" strokeWidth="1" opacity="0.2" />
      {/* Inner border */}
      <path d="M34 36 H86 V68 C86 86 60 102 60 102 C60 102 34 86 34 68 Z"
        fill="none" stroke="#fef08a" strokeWidth="0.75" opacity="0.35" />

      {/* ── Star emblem ── */}
      <path
        d="M60 38 L63.5 52 L78 53.5 L66.5 63 L70 77 L60 69 L50 77 L53.5 63 L42 53.5 L56.5 52 Z"
        fill="url(#b365_ruby)"
        stroke="#fef08a"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      {/* Star center gem */}
      <circle cx="60" cy="57" r="5" fill="#fca5a5" opacity="0.9" />
      <circle cx="60" cy="57" r="2.5" fill="white" opacity="0.8" />

      {/* Shine overlay */}
      <path d="M28 30 H92 V68 C92 90 60 108 60 108 C60 108 28 90 28 68 Z"
        fill="url(#b365_shine)" />
      {/* Specular highlight */}
      <ellipse cx="44" cy="40" rx="17" ry="9" fill="white" opacity="0.18" transform="rotate(-18 44 40)" />

      {/* Label */}
      <rect x="20" y="92" width="80" height="16" rx="8" fill="#431407" opacity="0.92" />
      <rect x="20" y="92" width="80" height="16" rx="8" fill="none" stroke="#fef08a" strokeWidth="0.75" opacity="0.45" />
      <text x="60" y="104" textAnchor="middle" fill="#fef9c3" fontSize="8.5" fontWeight="800" fontFamily="system-ui,sans-serif" letterSpacing="1">365 DAYS</text>
      {renderLockOverlay(isUnlocked)}
    </svg>
  );
}
