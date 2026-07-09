/**
 * serviceWorker.js
 * Handles SW registration, update detection, and messaging between the app
 * and the background SW.
 */

// ── Register ──────────────────────────────────────────────────────────────────

export async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[SW] Service Workers not supported in this browser.');
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

    if (import.meta.env.DEV) {
      console.log('[SW] Registered — scope:', reg.scope);
    }

    // ── Handle SW updates ───────────────────────────────────────────────────
    // When a new SW is waiting, activate it immediately so users always get
    // the latest app shell on the next navigation.
    reg.addEventListener('updatefound', () => {
      const newWorker = reg.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // A new SW is ready — tell it to skip waiting and take over
          newWorker.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    });

    // ── Reload the page when the SW controller changes ──────────────────────
    // This ensures users immediately use the new cache after an update.
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        // Only auto-reload in production; in dev it can be disruptive
        if (!import.meta.env.DEV) {
          window.location.reload();
        }
      }
    });

    // ── Trigger an immediate update check ───────────────────────────────────
    // So that if a new SW was deployed between visits, it gets activated
    // without waiting for the default 24h browser update check.
    try {
      await reg.update();
    } catch (_) {
      // Ignore network errors on the update check
    }

    return reg;
  } catch (err) {
    console.error('[SW] Registration failed:', err);
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getActiveSW() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.active || null;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Syncs the current task list to the service worker.
 * The SW stores them in IndexedDB and uses them for background notifications.
 * @param {Array} tasks - Full todo list from the Redux store
 */
export async function syncTasksToSW(tasks) {
  const sw = await getActiveSW();
  if (!sw) return;

  // Only send tasks that need a background notification (a due date or an
  // explicit reminder) and are not completed/deleted.
  const relevant = (tasks || []).filter(
    (t) => !t.completed && !t.deleted && (t.dueDate || t.reminderAt)
  );
  sw.postMessage({ type: 'TASKS_UPDATE', tasks: relevant });
}

/**
 * Tells the SW that a task was completed so it can clear its notified state.
 * This allows re-notification if the task is un-completed later.
 * @param {string} taskId
 */
export async function notifyTaskCompleted(taskId) {
  const sw = await getActiveSW();
  if (sw) sw.postMessage({ type: 'TASK_COMPLETED', taskId });
}
