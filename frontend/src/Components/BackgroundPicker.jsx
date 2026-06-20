import React, { useRef, useState } from "react";
import { useBackground } from "../hooks/useBackground";
import { Upload, Trash2, Sliders, Palette, Image as ImageIcon, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";

const PRESETS = [
  {
    id: "aurora",
    name: "Glass Aurora",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.28, blur: 15, tint: "none" }
  },
  {
    id: "space",
    name: "Deep Space",
    url: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1920&q=85",
    defaultSettings: { opacity: 0.22, blur: 2, tint: "dark" }
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
  }
];

const TINTS = [
  { id: "none", name: "Transparent", class: "bg-zinc-800 border-zinc-700" },
  { id: "dark", name: "Charcoal Black", class: "bg-black border-zinc-900" },
  { id: "purple", name: "Royal Purple", class: "bg-purple-950/60 border-purple-900/50" },
  { id: "blue", name: "Ocean Blue", class: "bg-blue-950/60 border-blue-900/50" },
  { id: "warm", name: "Warm Amber", class: "bg-amber-950/40 border-amber-900/40" },
];

export default function BackgroundPicker() {
  const {
    image,
    settings,
    isUploading,
    error,
    uploadImage,
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
    // Apply recommended settings for that preset
    if (preset.defaultSettings) {
      Object.entries(preset.defaultSettings).forEach(([key, val]) => {
        updateSetting(key, val);
      });
    }
  };

  const handleResetToDefault = () => {
    removeImage();
  };

  const getTintOverlayStyle = () => {
    switch (settings.tint) {
      case "dark": return "rgba(0,0,0,0.6)";
      case "purple": return "rgba(88,28,135,0.25)";
      case "blue": return "rgba(30,58,138,0.25)";
      case "warm": return "rgba(120,53,4,0.2)";
      default: return "transparent";
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* Mini Mockup Preview */}
      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Live Mockup Preview</h4>
        <div className="relative h-44 rounded-2xl border border-zinc-800/80 bg-[#05050a] overflow-hidden flex items-center justify-center shadow-inner">
          {/* Mock background layer */}
          {image ? (
            <>
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  backgroundImage: `url(${image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: settings.opacity,
                  filter: settings.blur > 0 ? `blur(${settings.blur}px)` : "none",
                }}
              />
              <div className="absolute inset-0 transition-colors duration-300" style={{ backgroundColor: getTintOverlayStyle() }} />
            </>
          ) : (
            <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
              <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[50px]" />
              <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[60px]" />
            </div>
          )}

          {/* Dummy UI elements to show contrast */}
          <div className="relative z-10 w-full max-w-xs p-4 rounded-xl border border-zinc-800/60 bg-[#0e0e11]/80 backdrop-blur-md shadow-lg flex flex-col gap-2 scale-90 sm:scale-100">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
              <div className="h-3.5 w-24 bg-purple-500/20 rounded-md border border-purple-500/30 flex items-center px-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1 animate-pulse" />
                <div className="h-1.5 w-12 bg-purple-400/40 rounded" />
              </div>
              <div className="h-3 w-10 bg-zinc-800 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-900/60" />
              <div className="h-2 w-28 bg-zinc-300/80 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-zinc-700 bg-zinc-900/60" />
              <div className="h-2 w-36 bg-zinc-500/80 rounded" />
            </div>
          </div>

          <div className="absolute bottom-2 right-3 text-[9px] font-medium text-zinc-500 bg-zinc-950/60 px-2 py-0.5 rounded border border-zinc-900">
            Mockup Preview
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Upload & Presets */}
        <div className="flex flex-col gap-5">
          {/* Upload Zone */}
          <div className="flex flex-col gap-2">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Custom Upload</h4>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`h-28 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? "border-purple-500 bg-purple-950/10"
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/10"
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
                  <span className="text-xs font-medium text-purple-400">Compressing & storing image...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                  <Upload size={20} className="text-zinc-500 mb-0.5" />
                  <p className="text-xs font-extrabold text-zinc-300">Drag & drop your image or click</p>
                  <p className="text-[10px] text-zinc-500">Supports JPEG, PNG, WebP (Auto-optimized to fit local cache)</p>
                </div>
              )}
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-red-400 bg-red-950/10 border border-red-900/30 p-2.5 rounded-xl">
                <AlertTriangle size={13} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Presets Grid */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Curated Presets</h4>
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
                  className={`relative h-16 rounded-xl overflow-hidden border transition-all cursor-pointer text-left focus:outline-none group ${
                    image === preset.url
                      ? "border-purple-500 ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/20"
                      : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
                    <span className="text-[9px] font-extrabold text-zinc-200 truncate w-full tracking-tight">
                      {preset.name}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Settings Adjustments */}
        <div className="flex flex-col gap-5 bg-zinc-900/20 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-2.5">
            <Sliders size={15} className="text-purple-400" />
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">Adjust Appearance</h4>
          </div>

          {/* Opacity Range Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-400">Background Opacity</label>
              <span className="text-xs font-extrabold text-purple-400">{Math.round(settings.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(settings.opacity * 100)}
              onChange={(e) => updateSetting("opacity", parseFloat(e.target.value) / 100)}
              disabled={!image}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <span className="text-[9px] text-zinc-500">How vivid the image is. Use lower opacity for better readability.</span>
          </div>

          {/* Blur Range Slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-400">Ambient Blur</label>
              <span className="text-xs font-extrabold text-purple-400">{settings.blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={settings.blur}
              onChange={(e) => updateSetting("blur", parseInt(e.target.value))}
              disabled={!image}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
            />
            <span className="text-[9px] text-zinc-500">Smooth out background detail to maintain high contrast with text layers.</span>
          </div>

          {/* Color Tint Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <Palette size={13} className="text-purple-400" />
              <label className="text-xs font-bold text-zinc-400">Contrast Color Tint</label>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-0.5">
              {TINTS.map((tint) => (
                <button
                  key={tint.id}
                  disabled={!image}
                  onClick={() => updateSetting("tint", tint.id)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold transition-all cursor-pointer focus:outline-none flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed ${
                    settings.tint === tint.id
                      ? "border-purple-500 bg-purple-650/15 text-purple-300 shadow-md shadow-purple-950/15"
                      : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                  title={tint.name}
                >
                  <span className={`w-2.5 h-2.5 rounded-full border border-white/10 ${tint.class}`} />
                  <span>{tint.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
            <span className="text-[9px] text-zinc-500">Applies a subtle color tint over the background for consistent contrast.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
