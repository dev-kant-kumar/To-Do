import React, { useRef, useState } from "react";
import { useBackground } from "../hooks/useBackground";
import { Upload, Trash2, Sliders, Palette, AlertTriangle, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Move } from "lucide-react";

const PRESETS = [
  {
    id: "aurora",
    name: "Glass Aurora",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.28, blur: 15, tint: "none" }
  },
  {
    id: "space",
    name: "Earth Horizon",
    url: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.28, blur: 0, tint: "none" }
  },
  {
    id: "mountains",
    name: "Starry Ridge",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.20, blur: 0, tint: "none" }
  },
  {
    id: "abstract",
    name: "Dark Marble",
    url: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.16, blur: 6, tint: "none" }
  },
  {
    id: "neon",
    name: "Cyber Street",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.24, blur: 3, tint: "purple" }
  },
  {
    id: "fog",
    name: "Mist Forest",
    url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.18, blur: 8, tint: "blue" }
  },
  {
    id: "nebula",
    name: "Blue Planet",
    url: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.24, blur: 0, tint: "none" }
  },
  {
    id: "fluid",
    name: "Fluid Flow",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.20, blur: 10, tint: "none" }
  },
  {
    id: "tokyo",
    name: "Cyber Tokyo",
    url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.25, blur: 3, tint: "blue" }
  },
  {
    id: "sunset",
    name: "Pastel Sunset",
    url: "https://images.unsplash.com/photo-1532767153582-b1a0e5145009?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.24, blur: 5, tint: "warm" }
  },
  {
    id: "dunes",
    name: "Moody Dunes",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5edd0cd9?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.20, blur: 0, tint: "dark" }
  },
  {
    id: "obsidian",
    name: "Obsidian Waves",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.18, blur: 8, tint: "none" }
  }
];

const TINTS = [
  { id: "none", name: "None", color: "transparent", glow: "rgba(168,85,247,0.25)" },
  { id: "dark", name: "Charcoal", color: "#09090b", glow: "rgba(255,255,255,0.08)" },
  { id: "purple", name: "Royal", color: "#581c87", glow: "rgba(168,85,247,0.4)" },
  { id: "blue", name: "Ocean", color: "#1e3a8a", glow: "rgba(59,130,246,0.4)" },
  { id: "warm", name: "Amber", color: "#78350f", glow: "rgba(245,158,11,0.3)" },
];

const POSITIONS = [
  { id: "left", name: "Left", icon: ArrowLeft, span: "col-span-2" },
  { id: "center", name: "Center", icon: Move, span: "col-span-2" },
  { id: "right", name: "Right", icon: ArrowRight, span: "col-span-2" },
  { id: "top", name: "Top", icon: ArrowUp, span: "col-span-3" },
  { id: "bottom", name: "Bottom", icon: ArrowDown, span: "col-span-3" },
];

export default function BackgroundPicker() {
  const {
    image,
    activeKey,
    settings,
    isUploading,
    error,
    customImages,
    uploadImage,
    selectCustomImage,
    deleteCustomImage,
    removeImage,
    updateSetting,
    setPreset,
  } = useBackground();

  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadImage(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await uploadImage(e.target.files[0]);
    }
  };

  const handlePresetClick = (preset) => {
    setPreset(preset.url);
    if (preset.defaultSettings) {
      Object.entries(preset.defaultSettings).forEach(([key, val]) => {
        updateSetting(key, val);
      });
    }
  };

  const handleResetToDefault = () => {
    removeImage();
  };

  // Render a premium styled slider
  const renderSlider = (label, value, min, max, unit, settingKey, hint) => {
    const percent = ((value - min) / (max - min)) * 100;
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest">{label}</label>
          <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20 shadow-inner">
            {value}{unit}
          </span>
        </div>
        <div className="relative flex items-center h-6">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => updateSetting(settingKey, parseFloat(e.target.value) / (settingKey === "opacity" ? 100 : 1))}
            disabled={!image}
            style={{
              background: `linear-gradient(to right, #a855f7 0%, #d946ef ${percent}%, #27272a ${percent}%, #27272a 100%)`
            }}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed outline-none transition-all duration-300
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4.5 [&::-webkit-slider-thumb]:h-4.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-purple-500 [&::-webkit-slider-thumb]:shadow-[0_0_12px_rgba(217,70,239,0.7)] [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&::-webkit-slider-thumb]:hover:scale-120 [&::-webkit-slider-thumb]:active:scale-95 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:disabled:cursor-not-allowed"
          />
        </div>
        {hint && (
          <span className="text-[10px] text-zinc-500 leading-relaxed font-medium">{hint}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side: Upload & Presets */}
        <div className="flex flex-col gap-6">
          {/* Upload Zone */}
          <div className="flex flex-col gap-2">
            <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Custom Upload</h4>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-28 border border-dashed rounded-3xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-300 ${
                dragActive
                  ? "border-purple-500 bg-purple-500/5 shadow-[0_0_20px_rgba(168,85,247,0.1)]"
                  : "border-zinc-800 bg-zinc-950/20 hover:border-zinc-700/80 hover:bg-zinc-900/10"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-purple-400">Compressing & storing image...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                  <Upload size={18} className="text-zinc-500 mb-0.5" />
                  <p className="text-xs font-extrabold text-zinc-300">Drag & drop your image or click</p>
                  <p className="text-[9px] text-zinc-500 font-medium">Supports JPEG, PNG, WebP (Auto-optimized to fit local cache)</p>
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400 bg-red-950/15 border border-red-900/30 p-3 rounded-2xl">
                <AlertTriangle size={13} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Custom Uploads Gallery */}
          {customImages && customImages.length > 0 && (
            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Your Uploads</h4>
              <div className="grid grid-cols-3 gap-2">
                {customImages.map((custom) => {
                  const isActive = activeKey === `custom://${custom.id}`;
                  return (
                    <div
                      key={custom.id}
                      onClick={() => selectCustomImage(custom.id)}
                      className={`group relative h-16 rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer text-left focus:outline-none ${
                        isActive
                          ? "border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-950/20 scale-[1.02]"
                          : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                      }`}
                    >
                      <img
                        src={custom.url}
                        alt={custom.name}
                        className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-[1.06] transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent flex items-end p-2">
                        <span className="text-[9px] font-black text-zinc-300 truncate w-[70%] tracking-tight">
                          {custom.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCustomImage(custom.id);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-zinc-950/90 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 transition-all opacity-0 group-hover:opacity-100 focus:outline-none cursor-pointer"
                        title="Delete custom image"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Presets Grid */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Curated Presets</h4>
              {image && (
                <button
                  onClick={handleResetToDefault}
                  className="text-[10px] font-bold text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 focus:outline-none cursor-pointer"
                >
                  <Trash2 size={11} />
                  Remove Background
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className={`relative h-16 rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer text-left focus:outline-none group ${
                    activeKey === preset.url
                      ? "border-purple-500 ring-2 ring-purple-500/30 shadow-lg shadow-purple-950/20 scale-[1.02]"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/20"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-[1.06] transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[9px] font-black text-zinc-300 truncate w-full tracking-tight">
                      {preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Settings Adjustments */}
        <div className="flex flex-col gap-6 bg-zinc-950/30 border border-zinc-800/80 p-6 rounded-[2rem] backdrop-blur-md shadow-2xl relative overflow-hidden">
          {/* Decorative subtle radial background glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2.5 border-b border-zinc-800/40 pb-3">
            <Sliders size={14} className="text-purple-400" />
            <h4 className="text-xs font-black uppercase tracking-widest text-zinc-300">Adjust Appearance</h4>
          </div>

          {/* Opacity Slider */}
          {renderSlider(
            "Background Opacity",
            Math.round(settings.opacity * 100),
            0,
            100,
            "%",
            "opacity",
            "Controls how vibrant the image appears. Use lower values to maximize readability."
          )}

          {/* Blur Slider */}
          {renderSlider(
            "Ambient Blur",
            settings.blur,
            0,
            40,
            "px",
            "blur",
            "Smooths out background details to maintain high text contrast."
          )}

          {/* Background Position Selector */}
          <div className="flex flex-col gap-2.5 border-t border-zinc-800/40 pt-5">
            <div className="flex items-center gap-1.5">
              <Move size={13} className="text-purple-400" />
              <label className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest">Image Alignment</label>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {POSITIONS.map((pos) => {
                const IconComponent = pos.icon;
                const isActive = settings.position === pos.id || (!settings.position && pos.id === "center");
                return (
                  <button
                    key={pos.id}
                    disabled={!image}
                    onClick={() => updateSetting("position", pos.id)}
                    className={`${pos.span} flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-[10px] font-extrabold transition-all duration-350 cursor-pointer focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed ${
                      isActive
                        ? "border-purple-500 bg-purple-500/10 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.1)]"
                        : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                    title={`Align ${pos.name}`}
                  >
                    <IconComponent size={12} />
                    <span>{pos.name}</span>
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-zinc-500 leading-relaxed font-medium">
              Positions the anchor of the background image for optimal visual focus.
            </span>
          </div>

          {/* Color Tint Palette Picker */}
          <div className="flex flex-col gap-2.5 border-t border-zinc-800/40 pt-5">
            <div className="flex items-center gap-1.5">
              <Palette size={13} className="text-purple-400" />
              <label className="text-xs font-extrabold text-zinc-300 uppercase tracking-widest">Contrast Color Tint</label>
            </div>
            
            <div className="grid grid-cols-5 gap-2 mt-1">
              {TINTS.map((tint) => {
                const isActive = settings.tint === tint.id;
                return (
                  <button
                    key={tint.id}
                    disabled={!image}
                    onClick={() => updateSetting("tint", tint.id)}
                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300 cursor-pointer focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed group ${
                      isActive
                        ? "border-purple-500 bg-purple-500/10 shadow-[0_0_18px_rgba(168,85,247,0.15)] scale-[1.03]"
                        : "border-zinc-800/80 bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-900/20"
                    }`}
                  >
                    {/* Swatch circle with its color and glow */}
                    <div
                      className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-transform group-hover:scale-105 shadow-inner"
                      style={{
                        backgroundColor: tint.color === "transparent" ? "#27272a" : tint.color,
                        boxShadow: isActive ? `0 0 12px ${tint.glow}` : "none"
                      }}
                    >
                      {isActive && (
                        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md animate-pulse" />
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold text-zinc-400 mt-2.5 group-hover:text-zinc-200 transition-colors">
                      {tint.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-zinc-500 leading-relaxed font-medium mt-1">
              Applies a subtle glass color layer over the background to ensure accessible text contrast.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
