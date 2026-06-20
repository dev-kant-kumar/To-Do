/* ============================================================
   todo. — Service Worker
   ─ App Shell Caching (Cache-First for assets / Network-First for navigation)
   ─ Background Notification Alerts (task due reminders)
   ============================================================ */

'use strict';

const SW_VERSION  = '2.0.0';

// ── Cache Names ────────────────────────────────────────────────────────────────
const SHELL_CACHE = `todo-shell-v${SW_VERSION}`;
const RUNTIME_CACHE = `todo-runtime-v${SW_VERSION}`;

/**
 * All URLs that make up the "app shell" — the minimum set of files needed
 * to render the UI from cache without any network access.
 *
 * NOTE: Vite hashes JS/CSS filenames on every build. We only pre-cache the
 * stable assets here. Hashed bundles are cached on first load via the runtime
 * strategy (stale-while-revalidate). This is the correct approach for Vite.
 */
const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/list.png',
];

// ── IndexedDB (for notification data) ────────────────────────────────────────

const DB_NAME     = 'todo-sw-v1';
const STORE_NAME  = 'data';

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

// ── Notification helpers ──────────────────────────────────────────────────────

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
      tag     : `task-notif-${task._id}`,
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

// ── Periodic background notification check ────────────────────────────────────

let checkTimer = null;

function scheduleNextCheck(tasks, delayMs = 60_000) {
  clearTimeout(checkTimer);
  checkTimer = setTimeout(() => {
    self.registration.active &&
      Promise.resolve().then(async () => {
        const stored = tasks || (await dbGet('tasks')) || [];
        await checkAndNotify(stored);
        scheduleNextCheck(stored, 60_000);
      });
  }, delayMs);
}

// ── SW Lifecycle ──────────────────────────────────────────────────────────────

self.addEventListener('install', (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Pre-cache each shell URL individually so one failure doesn't block all
      await Promise.allSettled(
        SHELL_URLS.map((url) =>
          cache.add(url).catch((err) =>
            console.warn(`[SW] Could not pre-cache ${url}:`, err)
          )
        )
      );
      // Take control immediately without waiting for old SW to stop
      await self.skipWaiting();
      console.log(`[SW] ${SW_VERSION} installed — app shell cached`);
    })()
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      // ── Delete old caches from previous SW versions ──────────────────
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== SHELL_CACHE && name !== RUNTIME_CACHE)
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );

      // Claim all open tabs so they use this SW immediately
      await self.clients.claim();
      console.log(`[SW] ${SW_VERSION} activated — controlling all clients`);

      // Restore notification schedule from IDB
      const tasks = await dbGet('tasks');
      if (tasks && tasks.length) {
        await checkAndNotify(tasks);
        scheduleNextCheck(tasks);
      }
    })()
  );
});

// ── Fetch Strategy ────────────────────────────────────────────────────────────

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // ── 1. Skip non-GET requests and non-http(s) requests ───────────────
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // ── 2. Skip cross-origin API requests — let them go through normally ─
  //    The axios syncManager handles offline interception for API calls.
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return;

  // ── 3. Navigation requests (HTML pages) — Network-First with shell fallback
  if (request.mode === 'navigate') {
    e.respondWith(
      (async () => {
        try {
          // Try network first so the latest index.html is served
          const networkRes = await fetch(request);
          // Cache a fresh copy of the HTML
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, networkRes.clone());
          return networkRes;
        } catch (_) {
          // Network failed — serve the cached shell
          const cached = await caches.match('/index.html') ||
                         await caches.match('/');
          if (cached) return cached;
          // Last resort — basic offline page
          return new Response(
            '<html><body><h1>You are offline</h1><p>Please reconnect and try again.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
      })()
    );
    return;
  }

  // ── 4. Static assets (JS, CSS, images, fonts) — Stale-While-Revalidate ──
  //    Serve from cache instantly, then refresh cache in background.
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/) ||
    url.pathname.startsWith('/assets/');

  if (isStaticAsset) {
    e.respondWith(
      (async () => {
        const cached = await caches.match(request);
        const fetchPromise = fetch(request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, networkRes.clone()));
          }
          return networkRes;
        }).catch(() => null);

        // Return cached version immediately; background fetch updates the cache
        return cached || await fetchPromise ||
          new Response('', { status: 503, statusText: 'Service Unavailable' });
      })()
    );
    return;
  }

  // ── 5. Everything else — Network-First with cache fallback ───────────
  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res && res.status === 200) {
          const cloned = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, cloned));
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response('', { status: 503, statusText: 'Offline' });
      })
  );
});

// ── Messages from the page ────────────────────────────────────────────────────

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

  // Clear all user task and notification data (called on logout/deletion)
  if (e.data.type === 'CLEAR_USER_DATA') {
    clearTimeout(checkTimer);
    checkTimer = null;
    e.waitUntil(
      (async () => {
        try {
          await dbPut('tasks', []);
          await dbPut('shown_ids', []);
          console.log('[SW] Cleared all user task and notification data.');
        } catch (err) {
          console.error('[SW] Failed to clear user data in SW db:', err);
        }
      })()
    );
  }

  // Force the SW to take control (used after update)
  if (e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Notification interaction ──────────────────────────────────────────────────

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
