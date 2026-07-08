/**
 * notificationSound.js
 * ─────────────────────────────────────────────────────────────────
 * Plays a short, pleasant two-tone chime for in-app notifications.
 *
 * The sound is synthesised with the Web Audio API instead of shipping
 * an audio file — this keeps the bundle small and sidesteps CSP/asset
 * concerns. A single AudioContext is lazily created and reused.
 *
 * A user mute preference is persisted in localStorage so the choice
 * survives reloads.
 */

const MUTE_KEY = "notif-sound-muted";

let audioCtx = null;

function getAudioContext() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

/** Returns true if the user has muted notification sounds. */
export function isNotificationSoundMuted() {
  try {
    return localStorage.getItem(MUTE_KEY) === "true";
  } catch (_) {
    return false;
  }
}

/** Persists the user's mute preference. */
export function setNotificationSoundMuted(muted) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? "true" : "false");
  } catch (_) {
    /* ignore storage failures (private mode, etc.) */
  }
}

/**
 * Plays the notification chime.
 * No-op if the user has muted sounds or the browser blocks audio
 * (e.g. AudioContext still suspended with no prior user gesture).
 * @param {boolean} [force] – play even if currently muted (used for previews)
 */
export function playNotificationSound(force = false) {
  if (!force && isNotificationSoundMuted()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Browsers start the context suspended until a user gesture occurs.
    // Try to resume; if it's blocked the notes simply won't sound.
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Rising two-note chime: A5 → D6.
    const notes = [
      { freq: 880.0, at: 0 },
      { freq: 1174.66, at: 0.12 },
    ];

    for (const { freq, at } of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = freq;

      const start = now + at;
      // Quick attack, smooth exponential decay — a soft "ding".
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.32);
    }
  } catch (_) {
    /* audio is best-effort; never let it break the UI */
  }
}
