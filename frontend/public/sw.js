/* ============================================================
   todo. — Background Notification Service Worker
   Fires OS-level task-due alerts even when the tab is closed.
   ============================================================ */

'use strict';

const SW_VERSION  = '1.0.0';
const DB_NAME     = 'todo-sw-v1';
const STORE_NAME  = 'data';

// ── IndexedDB helpers ──────────────────────────────────────────────────────

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) =>
      e.target.result.createObjectStore(STORE_NAME);
    req.onsuccess  = (e) => resolve(e.target.result);
    req.onerror    = (e) => reject(e.target.error);
  });
}

async function dbPut(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}

async function dbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

// ── Notification helpers ───────────────────────────────────────────────────

// shownIds persists in IDB so it survives SW restarts
async function getShownIds() {
  return new Set((await dbGet('shown_ids')) || []);
}
async function saveShownIds(set) {
  await dbPut('shown_ids', [...set]);
}

async function checkAndNotify(tasks) {
  if (!tasks || !tasks.length) return;

  const now          = Date.now();
  const endOfToday   = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const endOfTodayMs = endOfToday.getTime();

  const shownIds = await getShownIds();
  let changed    = false;

  for (const task of tasks) {
    if (!task.dueDate || task.completed || task.deleted) continue;
    if (shownIds.has(task._id)) continue;

    const dueMs    = new Date(task.dueDate).getTime();
    const isOverdue  = dueMs < now;
    const isDueToday = dueMs >= now && dueMs <= endOfTodayMs;

    if (!isOverdue && !isDueToday) continue;

    const title = isOverdue
      ? '⚠️ Overdue Task — todo.'
      : '🔔 Task Due Today — todo.';

    await self.registration.showNotification(title, {
      body    : task.task,
      icon    : '/list.png',
      badge   : '/list.png',
      tag     : `task-notif-${task._id}`,   // deduplicates identical notifs
      renotify: false,
      data    : { taskId: task._id },
      vibrate : isOverdue ? [200, 100, 200] : [100],
      actions : [
        { action: 'open',    title: 'Open Task' },
        { action: 'dismiss', title: 'Dismiss'   },
      ],
    });

    shownIds.add(task._id);
    changed = true;
  }

  if (changed) await saveShownIds(shownIds);
}

// ── Periodic background check ──────────────────────────────────────────────
// setInterval / setTimeout are valid in SW scope; the browser may suspend the
// SW between ticks but Chrome/Edge keep it alive for ~30 s after the last
// event.  The waitUntil calls below extend that window significantly.

let checkTimer = null;

function scheduleNextCheck(tasks, delayMs = 60_000) {
  clearTimeout(checkTimer);
  checkTimer = setTimeout(() => {
    // Wrap in a promise so the browser knows we have pending work.
    // This keeps the SW alive long enough to fire the notification.
    self.registration.active &&
      Promise.resolve().then(async () => {
        const stored = tasks || (await dbGet('tasks')) || [];
        await checkAndNotify(stored);
        scheduleNextCheck(stored, 60_000);
      });
  }, delayMs);
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      await self.clients.claim();
      // Restore tasks from IDB and run an immediate check
      const tasks = await dbGet('tasks');
      if (tasks && tasks.length) {
        await checkAndNotify(tasks);
        scheduleNextCheck(tasks);
      }
    })()
  );
});

// ── Messages from the page ────────────────────────────────────────────────

self.addEventListener('message', (e) => {
  if (!e.data) return;

  // Page sends the full (relevant) task list whenever it changes
  if (e.data.type === 'TASKS_UPDATE') {
    const tasks = e.data.tasks || [];
    e.waitUntil(
      (async () => {
        await dbPut('tasks', tasks);
        await checkAndNotify(tasks);
        scheduleNextCheck(tasks, 60_000);
      })()
    );
  }

  // Page marks a task as completed → remove from shownIds so if the user
  // un-completes it later the notification fires again
  if (e.data.type === 'TASK_COMPLETED') {
    e.waitUntil(
      (async () => {
        const shownIds = await getShownIds();
        shownIds.delete(e.data.taskId);
        await saveShownIds(shownIds);
      })()
    );
  }
});

// ── Notification interaction ──────────────────────────────────────────────

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  if (e.action === 'dismiss') return;

  e.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus an existing todo. tab if one is open
        for (const client of clientList) {
          if (client.url.includes('/home') && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open a new tab
        return self.clients.openWindow('/home');
      })
  );
});
