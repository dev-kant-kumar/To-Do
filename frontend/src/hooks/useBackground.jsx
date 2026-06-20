import React, { createContext, useContext, useState, useCallback } from "react";

const IMAGE_KEY    = "todo_bg_image_v1";
const SETTINGS_KEY = "todo_bg_settings_v1";

const DEFAULT_SETTINGS = {
  opacity: 0.18,   // 0–1: how visible the image is (low = subtle, high = vivid)
  blur:    0,      // px blur over the image
  tint:    "none", // "none" | "dark" | "purple" | "blue" | "warm"
};

/** Resize + compress a File to a base64 JPEG string. */
function compressImage(file, maxWidth = 2560, quality = 0.90) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio  = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

const BackgroundContext = createContext(null);

export function BackgroundProvider({ children }) {
  // Load initially from storage
  const [image, setImg] = useState(() => {
    try {
      return localStorage.getItem(IMAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [settings, setSets] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  });

  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Upload a new image file
  const uploadImage = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("Image is too large. Please pick an image under 20 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      localStorage.setItem(IMAGE_KEY, dataUrl);
      setImg(dataUrl);
    } catch (err) {
      setError("Failed to process the image. Please try a different file.");
      console.error("[useBackground] compressImage error:", err);
    } finally {
      setUploading(false);
    }
  }, []);

  // Remove the background image
  const removeImage = useCallback(() => {
    localStorage.removeItem(IMAGE_KEY);
    setImg(null);
    setError(null);
  }, []);

  // Update a single setting (opacity, blur, tint)
  const updateSetting = useCallback((key, value) => {
    setSets((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // Storage full — still update in-memory
      }
      return next;
    });
  }, []);

  // Set a preset image (data URL or https URL)
  const setPreset = useCallback((dataUrl) => {
    localStorage.setItem(IMAGE_KEY, dataUrl);
    setImg(dataUrl);
    setError(null);
  }, []);

  const value = {
    image,
    settings,
    isUploading,
    error,
    uploadImage,
    removeImage,
    updateSetting,
    setPreset,
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
}
