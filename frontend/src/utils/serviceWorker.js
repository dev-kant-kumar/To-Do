/**
 * serviceWorker.js
 * Handles SW registration and messaging between the app and the background SW.
 */

// ── Register ──────────────────────────────────────────────────────────────

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
    return reg;
  } catch (err) {
    console.error('[SW] Registration failed:', err);
    return null;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────

async function getActiveSW() {
  if (!('serviceWorker' in navigator)) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.active || null;
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Syncs the current task list to the service worker.
 * The SW stores them in IndexedDB and uses them for background notifications.
 * @param {Array} tasks - Full todo list from the Redux store
 */
export async function syncTasksToSW(tasks) {
  const sw = await getActiveSW();
  if (!sw) return;

  // Only send tasks that have a due date and are not completed/deleted
  const relevant = (tasks || []).filter(
    (t) => !t.completed && !t.deleted && t.dueDate
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
