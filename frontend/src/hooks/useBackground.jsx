import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  saveCustomImage,
  getCustomImage,
  getAllCustomImages,
  deleteCustomImage as deleteDbImage
} from "../utils/backgroundDb";

const IMAGE_KEY    = "todo_bg_image_v1";
const SETTINGS_KEY = "todo_bg_settings_v1";

const DEFAULT_SETTINGS = {
  opacity: 0.18,   // 0–1: how visible the image is (low = subtle, high = vivid)
  blur:    0,      // px blur over the image
  tint:    "none", // "none" | "dark" | "purple" | "blue" | "warm"
  position: "center", // "center" | "top" | "bottom" | "left" | "right"
};

/** Resize + compress a File to a high-quality WebP Blob. */
function compressImage(file, maxWidth = 2560, quality = 0.92) {
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
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas conversion to Blob failed"));
        }
      }, "image/webp", quality);
    };
    img.onerror = reject;
    img.src = url;
  });
}

const BackgroundContext = createContext(null);

export function BackgroundProvider({ children }) {
  const [image, setImg] = useState(null);
  const [activeKey, setActiveKey] = useState(() => {
    try {
      return localStorage.getItem(IMAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [customImages, setCustomImages] = useState([]);
  const [isUploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [settings, setSets] = useState(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  });

  const activeObjectUrlRef = useRef(null);

  // Helper to safely set the active resolved image URL and revoke the old one
  const setActiveImageResolved = useCallback((resolvedUrl, isCustom = false) => {
    setImg((prev) => {
      if (activeObjectUrlRef.current && activeObjectUrlRef.current !== resolvedUrl) {
        URL.revokeObjectURL(activeObjectUrlRef.current);
        activeObjectUrlRef.current = null;
      }
      if (isCustom && resolvedUrl) {
        activeObjectUrlRef.current = resolvedUrl;
      }
      return resolvedUrl;
    });
  }, []);

  // Load all custom images from IndexedDB, mapping blobs to Object URLs
  const loadCustomImages = useCallback(async () => {
    try {
      const list = await getAllCustomImages();
      
      setCustomImages((prev) => {
        // Revoke all previous custom gallery object URLs to prevent memory leaks
        prev.forEach(item => {
          if (item.url) {
            URL.revokeObjectURL(item.url);
          }
        });

        return list.map(item => ({
          id: item.id,
          name: item.name,
          addedAt: item.addedAt,
          url: URL.createObjectURL(item.blob)
        }));
      });
    } catch (err) {
      console.error("[useBackground] Failed to load custom images:", err);
    }
  }, []);

  // Initialize active background image on mount
  useEffect(() => {
    const initActiveImage = async () => {
      try {
        const saved = localStorage.getItem(IMAGE_KEY);
        if (!saved) {
          setActiveImageResolved(null);
          setActiveKey(null);
        } else if (saved.startsWith("custom://")) {
          const id = saved.replace("custom://", "");
          const imgData = await getCustomImage(id);
          if (imgData && imgData.blob) {
            const url = URL.createObjectURL(imgData.blob);
            setActiveImageResolved(url, true);
            setActiveKey(saved);
          } else {
            // Background reference was broken or deleted
            setActiveImageResolved(null);
            setActiveKey(null);
            localStorage.removeItem(IMAGE_KEY);
          }
        } else {
          // Regular HTTPS preset URL or legacy base64
          setActiveImageResolved(saved);
          setActiveKey(saved);
        }
      } catch (err) {
        console.error("[useBackground] initActiveImage error:", err);
        setActiveImageResolved(null);
        setActiveKey(null);
      }
    };

    initActiveImage();
    loadCustomImages();

    return () => {
      // Cleanup active background object URL
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current);
      }
      // Cleanup all gallery Object URLs
      setCustomImages((prev) => {
        prev.forEach(item => {
          if (item.url) {
            URL.revokeObjectURL(item.url);
          }
        });
        return [];
      });
    };
  }, [setActiveImageResolved, loadCustomImages]);

  // Upload and compress a new custom image
  const uploadImage = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPEG, PNG, WebP, etc.).");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const compressedBlob = await compressImage(file);
      const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Save to IndexedDB
      await saveCustomImage(id, compressedBlob, file.name);
      
      // Reload gallery list to reflect new uploads
      await loadCustomImages();

      // Set as active background
      const key = `custom://${id}`;
      localStorage.setItem(IMAGE_KEY, key);
      setActiveKey(key);
      const activeUrl = URL.createObjectURL(compressedBlob);
      setActiveImageResolved(activeUrl, true);
    } catch (err) {
      setError("Failed to process the image. Please try a different file.");
      console.error("[useBackground] uploadImage error:", err);
    } finally {
      setUploading(false);
    }
  }, [loadCustomImages, setActiveImageResolved]);

  // Select a custom image from the gallery
  const selectCustomImage = useCallback(async (id) => {
    setError(null);
    try {
      const imgData = await getCustomImage(id);
      if (imgData && imgData.blob) {
        const key = `custom://${id}`;
        localStorage.setItem(IMAGE_KEY, key);
        setActiveKey(key);
        const activeUrl = URL.createObjectURL(imgData.blob);
        setActiveImageResolved(activeUrl, true);
      } else {
        setError("Selected image could not be loaded.");
      }
    } catch (err) {
      console.error("[useBackground] selectCustomImage error:", err);
      setError("Failed to apply selected background.");
    }
  }, [setActiveImageResolved]);

  // Delete a custom image
  const deleteCustomImage = useCallback(async (id) => {
    try {
      await deleteDbImage(id);
      
      // If it was the currently active background, remove active background state
      const saved = localStorage.getItem(IMAGE_KEY);
      if (saved === `custom://${id}`) {
        localStorage.removeItem(IMAGE_KEY);
        setActiveKey(null);
        setActiveImageResolved(null);
      }
      
      // Reload gallery list
      await loadCustomImages();
    } catch (err) {
      console.error("[useBackground] deleteCustomImage error:", err);
      setError("Failed to delete custom image.");
    }
  }, [loadCustomImages, setActiveImageResolved]);

  // Remove the active background image (revert to default)
  const removeImage = useCallback(() => {
    localStorage.removeItem(IMAGE_KEY);
    setActiveKey(null);
    setActiveImageResolved(null);
    setError(null);
  }, [setActiveImageResolved]);

  // Update a single appearance setting
  const updateSetting = useCallback((key, value) => {
    setSets((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // LocalStorage full, still update state
      }
      return next;
    });
  }, []);

  // Set a preset image
  const setPreset = useCallback((presetUrl) => {
    localStorage.setItem(IMAGE_KEY, presetUrl);
    setActiveKey(presetUrl);
    setActiveImageResolved(presetUrl, false);
    setError(null);
  }, [setActiveImageResolved]);

  const value = {
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

