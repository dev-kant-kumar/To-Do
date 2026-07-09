import axios from "axios";
import { getToken } from "./auth";
import { toast } from "react-toastify";

const DB_NAME = "todo-app-offline-v1";
const STORE_NAME = "offline_store";

// Module-level map to translate temporary task IDs to database ObjectIds in real-time
const tempIdMap = {};

// ── IndexedDB Helpers ────────────────────────────────────────────────────────

let dbPromise = null;
let dbInstance = null;

function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (e) => {
      dbInstance = e.target.result;
      resolve(dbInstance);
    };
    request.onerror = (e) => {
      dbPromise = null; // reset to allow retries if failed
      reject(e.target.error);
    };
  });

  return dbPromise;
}

export async function dbPut(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function dbGet(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

// ── Sync State & Listeners ───────────────────────────────────────────────────

let isOnline = navigator.onLine;
let isSyncing = false;
let syncListeners = [];
let connectionListeners = [];

export function getOnlineStatus() {
  return isOnline;
}

export function isSyncingInProgress() {
  return isSyncing;
}

export function addSyncListener(cb) {
  syncListeners.push(cb);
  cb(isSyncing);
}

export function removeSyncListener(cb) {
  syncListeners = syncListeners.filter((l) => l !== cb);
}

function notifySyncStatusListeners() {
  syncListeners.forEach((cb) => cb(isSyncing));
}

export function addConnectionListener(cb) {
  connectionListeners.push(cb);
  cb(isOnline);
}

export function removeConnectionListener(cb) {
  connectionListeners = connectionListeners.filter((l) => l !== cb);
}

function notifyConnectionListeners() {
  connectionListeners.forEach((cb) => cb(isOnline));
}

// ── Offline Reads & Writes Handlers ──────────────────────────────────────────

async function recalculateOfflineCounts(tasks) {
  const allCount = tasks.filter((t) => !t.deleted).length;
  const starredCount = tasks.filter((t) => t.starred && !t.deleted).length;
  const completedCount = tasks.filter((t) => t.completed && !t.deleted).length;
  const pendingCount = tasks.filter((t) => !t.completed && !t.deleted).length;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayCount = tasks.filter((t) => {
    if (t.deleted) return false;
    
    const createdDate = t.date ? new Date(t.date) : new Date(t.createdAt || Date.now());
    const isCreatedToday = createdDate >= startOfDay && createdDate <= endOfDay;
    
    const completedDate = t.completedAt ? new Date(t.completedAt) : null;
    const isCompletedToday = t.completed && completedDate && completedDate >= startOfDay && completedDate <= endOfDay;
    
    const dueDate = t.dueDate ? new Date(t.dueDate) : null;
    const isPendingAndDueTodayOrOverdue = !t.completed && dueDate && dueDate <= endOfDay;

    return isCreatedToday || isCompletedToday || isPendingAndDueTodayOrOverdue;
  }).length;

  const deletedCount = tasks.filter((t) => t.deleted).length;

  const newCounts = {
    allCount,
    starredCount,
    completedCount,
    pendingCount,
    todayCount,
    deletedCount,
  };

  await dbPut("counts", newCounts);
}

async function handleOfflineRead(endpoint, payload) {
  const tasks = (await dbGet("tasks")) || [];

  if (endpoint === "filters/counts") {
    const counts = await dbGet("counts");
    if (counts) return counts;

    // Fallback dynamic calculation
    const allCount = tasks.filter((t) => !t.deleted).length;
    const starredCount = tasks.filter((t) => t.starred && !t.deleted).length;
    const completedCount = tasks.filter((t) => t.completed && !t.deleted).length;
    const pendingCount = tasks.filter((t) => !t.completed && !t.deleted).length;

    const startOfDay = payload.startOfDay ? new Date(payload.startOfDay) : new Date();
    const endOfDay = payload.endOfDay ? new Date(payload.endOfDay) : new Date();
    if (!payload.startOfDay) {
      startOfDay.setHours(0, 0, 0, 0);
    }
    if (!payload.endOfDay) {
      endOfDay.setHours(23, 59, 59, 999);
    }

    const todayCount = tasks.filter((t) => {
      if (t.deleted) return false;
      
      const createdDate = t.date ? new Date(t.date) : new Date(t.createdAt || Date.now());
      const isCreatedToday = createdDate >= startOfDay && createdDate <= endOfDay;
      
      const completedDate = t.completedAt ? new Date(t.completedAt) : null;
      const isCompletedToday = t.completed && completedDate && completedDate >= startOfDay && completedDate <= endOfDay;
      
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;
      const isPendingAndDueTodayOrOverdue = !t.completed && dueDate && dueDate <= endOfDay;

      return isCreatedToday || isCompletedToday || isPendingAndDueTodayOrOverdue;
    }).length;

    const deletedCount = tasks.filter((t) => t.deleted).length;

    return {
      allCount,
      starredCount,
      completedCount,
      pendingCount,
      todayCount,
      deletedCount,
    };
  }

  if (endpoint === "filters/activity") {
    const activity = await dbGet("activity");
    return activity || { status: true, activity: {}, totalCompleted: 0 };
  }

  // Handle standard filters
  let filtered = [];
  if (endpoint === "filters/all") {
    filtered = tasks.filter((t) => !t.deleted);
  } else if (endpoint === "filters/completed") {
    filtered = tasks.filter((t) => t.completed && !t.deleted);
  } else if (endpoint === "filters/starred") {
    filtered = tasks.filter((t) => t.starred && !t.deleted);
  } else if (endpoint === "filters/deleted") {
    filtered = tasks.filter((t) => t.deleted);
  } else if (endpoint === "filters/today") {
    const startOfDay = payload.startOfDay ? new Date(payload.startOfDay) : new Date();
    const endOfDay = payload.endOfDay ? new Date(payload.endOfDay) : new Date();
    if (!payload.startOfDay) {
      startOfDay.setHours(0, 0, 0, 0);
    }
    if (!payload.endOfDay) {
      endOfDay.setHours(23, 59, 59, 999);
    }
    filtered = tasks.filter((t) => {
      if (t.deleted) return false;
      
      const createdDate = t.date ? new Date(t.date) : new Date(t.createdAt || Date.now());
      const isCreatedToday = createdDate >= startOfDay && createdDate <= endOfDay;
      
      const completedDate = t.completedAt ? new Date(t.completedAt) : null;
      const isCompletedToday = t.completed && completedDate && completedDate >= startOfDay && completedDate <= endOfDay;
      
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;
      const isPendingAndDueTodayOrOverdue = !t.completed && dueDate && dueDate <= endOfDay;

      return isCreatedToday || isCompletedToday || isPendingAndDueTodayOrOverdue;
    });
  } else if (endpoint === "filters/week") {
    // Show all tasks created within the last 7 days (inclusive of today)
    let startOf7DaysAgo = payload.startOf7DaysAgo ? new Date(payload.startOf7DaysAgo) : null;
    let endOfToday = payload.endOfToday ? new Date(payload.endOfToday) : null;
    if (!startOf7DaysAgo || !endOfToday) {
      const now = new Date();
      startOf7DaysAgo = new Date(now);
      startOf7DaysAgo.setDate(now.getDate() - 6); // 6 + today = 7 full days
      startOf7DaysAgo.setHours(0, 0, 0, 0);
      endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);
    }

    filtered = tasks.filter((t) => {
      if (t.deleted) return false;
      
      const createdDate = t.date ? new Date(t.date) : new Date(t.createdAt || Date.now());
      const isCreatedToday = createdDate >= startOf7DaysAgo && createdDate <= endOfToday;
      
      const completedDate = t.completedAt ? new Date(t.completedAt) : null;
      const isCompletedToday = t.completed && completedDate && completedDate >= startOf7DaysAgo && completedDate <= endOfToday;
      
      const dueDate = t.dueDate ? new Date(t.dueDate) : null;
      const isPendingAndDueTodayOrOverdue = !t.completed && dueDate && dueDate <= endOfToday;

      return isCreatedToday || isCompletedToday || isPendingAndDueTodayOrOverdue;
    });
  }

  if (filtered.length === 0) {
    return {
      status: false,
      message: "No tasks found.",
      length: 0,
    };
  }

  return filtered;
}

async function handleOfflineWrite(endpoint, payload, headers) {
  const queue = (await dbGet("queue")) || [];
  const queueId = "queue_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

  const queueItem = {
    id: queueId,
    url: `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
    method: "POST",
    data: payload,
    headers: headers || {},
    timestamp: Date.now(),
  };

  const tasks = (await dbGet("tasks")) || [];
  let responseData = { status: true };

  if (endpoint === "todo/addTask") {
    const tempId = "temp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    const newTask = {
      _id: tempId,
      userId: payload.userId,
      task: payload.task || "",
      description: payload.description || "",
      priority: payload.priority || "none",
      dueDate: payload.dueDate || null,
      startDate: payload.startDate || null,
      completed: false,
      starred: false,
      deleted: false,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(payload.recurrence ? { recurrence: payload.recurrence } : {}),
    };

    queueItem.tempId = tempId;
    tasks.push(newTask);
    responseData = { status: true, todo: newTask };
  } else if (endpoint === "todo/updateTask") {
    const taskIndex = tasks.findIndex((t) => t._id === payload.taskID);
    if (taskIndex !== -1) {
      const task = tasks[taskIndex];
      if (payload.task !== undefined) task.task = payload.task;
      if (payload.description !== undefined) task.description = payload.description;
      if (payload.priority !== undefined) task.priority = payload.priority;
      if (payload.dueDate !== undefined) task.dueDate = payload.dueDate;
      if (payload.startDate !== undefined) task.startDate = payload.startDate;
      if (payload.endDate !== undefined) task.endDate = payload.endDate;
      if (payload.starred !== undefined) task.starred = payload.starred;
      if (payload.completed !== undefined) task.completed = payload.completed;
      if (payload.completedAt !== undefined) task.completedAt = payload.completedAt;
      if (payload.rankIndex !== undefined) task.rankIndex = payload.rankIndex;
      task.updatedAt = new Date().toISOString();
    }
  } else if (endpoint === "todo/deleteTask") {
    const taskIndex = tasks.findIndex((t) => t._id === payload.taskID);
    if (taskIndex !== -1) {
      if (payload.taskID.startsWith("temp_")) {
        tasks.splice(taskIndex, 1);
        // Optimize: remove corresponding addTask and all update/starred/completion toggles for this tempId from the queue
        const filteredQueue = queue.filter(
          (item) => {
            if (item.url.includes("todo/addTask") && item.tempId === payload.taskID) {
              return false;
            }
            if (item.data && item.data.taskID === payload.taskID) {
              return false;
            }
            return true;
          }
        );
        await dbPut("queue", filteredQueue);
        await dbPut("tasks", tasks);
        await recalculateOfflineCounts(tasks);
        return { status: true, message: "Task deleted successfully" };
      } else {
        tasks[taskIndex].deleted = true;
      }
    }
  } else if (endpoint === "todo/undoDelete") {
    const taskIndex = tasks.findIndex((t) => t._id === payload.taskID);
    if (taskIndex !== -1) {
      tasks[taskIndex].deleted = false;
      // Optimize: remove corresponding deleteTask from queue if it hasn't synced
      const filteredQueue = queue.filter(
        (item) => !(item.url.includes("todo/deleteTask") && item.data && item.data.taskID === payload.taskID)
      );
      if (filteredQueue.length < queue.length) {
        await dbPut("queue", filteredQueue);
        await dbPut("tasks", tasks);
        await recalculateOfflineCounts(tasks);
        return { status: true, message: "Task restored successfully" };
      }
    }
  } else if (endpoint === "todo/deleteall") {
    const activeTasks = tasks.filter((t) => !t.deleted);
    await dbPut("tasks", activeTasks);
    queue.push(queueItem);
    await dbPut("queue", queue);
    await recalculateOfflineCounts(activeTasks);
    return { status: true, message: "All tasks deleted successfully." };
  } else if (endpoint === "todo/markComplete" || endpoint === "todo/unMarkComplete") {
    const isComplete = endpoint === "todo/markComplete";
    const taskIndex = tasks.findIndex((t) => t._id === payload.taskID);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = isComplete;

      // Update activity map
      const activityData = (await dbGet("activity")) || {
        status: true,
        activity: {},
        totalCompleted: 0,
      };
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      const todayKey = `${y}-${m}-${d}`;

      if (!activityData.activity) activityData.activity = {};
      if (isComplete) {
        activityData.totalCompleted = (activityData.totalCompleted || 0) + 1;
        activityData.activity[todayKey] = (activityData.activity[todayKey] || 0) + 1;
      } else {
        activityData.totalCompleted = Math.max(0, (activityData.totalCompleted || 0) - 1);
        if (activityData.activity[todayKey]) {
          activityData.activity[todayKey] = Math.max(0, activityData.activity[todayKey] - 1);
        }
      }
      await dbPut("activity", activityData);
    }
  } else if (endpoint === "todo/markStarred" || endpoint === "todo/unMarkStarred") {
    const isStarred = endpoint === "todo/markStarred";
    const taskIndex = tasks.findIndex((t) => t._id === payload.taskID);
    if (taskIndex !== -1) {
      tasks[taskIndex].starred = isStarred;
    }
  }

  if (endpoint !== "todo/deleteall") {
    queue.push(queueItem);
    await dbPut("queue", queue);
  }

  await dbPut("tasks", tasks);
  await recalculateOfflineCounts(tasks);

  return responseData;
}

// ── Queue Synchronization ────────────────────────────────────────────────────

export async function syncOfflineQueue() {
  const token = getToken();
  if (!token) return; // Do not attempt sync if logged out

  if (!navigator.onLine || isSyncing) return;

  const queue = (await dbGet("queue")) || [];
  if (queue.length === 0) return;

  isSyncing = true;
  notifySyncStatusListeners();

  let processedCount = 0;

  try {
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];

      // Reconcile temporary IDs
      if (item.data) {
        if (item.data.taskID && tempIdMap[item.data.taskID]) {
          item.data.taskID = tempIdMap[item.data.taskID];
        }
      }

      const token = getToken();
      const headers = { ...item.headers };
      if (token) {
        headers["X-Authorization"] = `Bearer ${token}`;
      }

      try {
        const response = await axios({
          method: item.method,
          url: item.url,
          data: item.data,
          headers: headers,
          _bypassOfflineInterceptor: true,
        });

        // Map tempId to server realId
        if (item.url.includes("todo/addTask") && response.data?.todo?._id) {
          const tempId = item.tempId;
          const realId = response.data.todo._id;
          if (tempId) {
            tempIdMap[tempId] = realId;
            const tasks = (await dbGet("tasks")) || [];
            const updatedTasks = tasks.map((t) => {
              if (t._id === tempId) {
                return { ...t, _id: realId };
              }
              return t;
            });
            await dbPut("tasks", updatedTasks);
          }
        }
        processedCount++;
      } catch (err) {
        if (!err.response) {
          throw err; // Stop syncing and retry later on network issue
        }
        console.error(`[Sync] Request failed (skipping): ${item.url}`, err);
        processedCount++;
      }
    }

    // Done syncing
    const currentQueue = (await dbGet("queue")) || [];
    const remainingQueue = currentQueue.slice(processedCount);
    await dbPut("queue", remainingQueue);

    isSyncing = false;
    notifySyncStatusListeners();

    window.dispatchEvent(new CustomEvent("todo-offline-synced"));
    toast.success("Offline updates synchronized successfully!");

    // If more tasks were queued concurrently while this sync loop was running, process them now
    if (remainingQueue.length > 0) {
      syncOfflineQueue();
    }
  } catch (err) {
    console.error("[Sync] Paused due to network error.", err);
    isSyncing = false;
    notifySyncStatusListeners();

    const currentQueue = (await dbGet("queue")) || [];
    const remaining = queue.slice(processedCount);
    const reconciledRemaining = remaining.map((item) => {
      if (item.data && item.data.taskID && tempIdMap[item.data.taskID]) {
        return {
          ...item,
          data: { ...item.data, taskID: tempIdMap[item.data.taskID] },
        };
      }
      return item;
    });

    const finalQueue = [...reconciledRemaining, ...currentQueue.slice(queue.length)];
    await dbPut("queue", finalQueue);
    toast.error("Offline sync paused. Connection lost.");
  }
}

// ── Connection Recovery Polling ──────────────────────────────────────────────

let pingTimer = null;

export function startPingInterval() {
  if (pingTimer) return;

  pingTimer = setInterval(async () => {
    if (isOnline) {
      clearInterval(pingTimer);
      pingTimer = null;
      return;
    }

    const apiUrl = import.meta.env.VITE_API_BASE_URL;
    try {
      const token = getToken();
      const headers = {};
      if (token) {
        headers["X-Authorization"] = `Bearer ${token}`;
      }

      await axios({
        method: "POST",
        url: `${apiUrl}filters/counts`,
        data: { userId: "ping" },
        headers: headers,
        _bypassOfflineInterceptor: true,
        timeout: 4000,
      });

      // If ping succeeds, restore connection
      isOnline = true;
      notifyConnectionListeners();
      window.dispatchEvent(new CustomEvent("todo-connection-changed", { detail: { isOnline: true } }));
      syncOfflineQueue();

      clearInterval(pingTimer);
      pingTimer = null;
    } catch (err) {
      // If we got a response (e.g. 401 Unauthorized or 400 Bad Request),
      // it means the server is reachable and we are online!
      if (err.response) {
        isOnline = true;
        notifyConnectionListeners();
        window.dispatchEvent(new CustomEvent("todo-connection-changed", { detail: { isOnline: true } }));
        syncOfflineQueue();

        clearInterval(pingTimer);
        pingTimer = null;
      }
    }
  }, 10000); // Check every 10 seconds when offline
}

// ── Global Interceptor Initialization ────────────────────────────────────────

export function initSyncManager() {
  window.addEventListener("online", () => {
    isOnline = true;
    notifyConnectionListeners();
    window.dispatchEvent(new CustomEvent("todo-connection-changed", { detail: { isOnline } }));
    syncOfflineQueue();
  });

  window.addEventListener("offline", () => {
    isOnline = false;
    notifyConnectionListeners();
    window.dispatchEvent(new CustomEvent("todo-connection-changed", { detail: { isOnline } }));
    startPingInterval(); // Start pinging to detect connection recovery
  });

  axios.interceptors.request.use(
    async (config) => {
      if (config._bypassOfflineInterceptor) {
        return config;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const isApiRequest = config.url && config.url.startsWith(apiUrl);
      if (!isApiRequest) {
        return config;
      }

      const endpoint = config.url.substring(apiUrl.length);

      // ── Handle Temporary IDs Online / Offline ──
      // If a write request targets a task with a temporary ID (starts with temp_),
      // we must handle it by:
      // A) Substituting the real ObjectId if the sync manager has already mapped it.
      // B) Routing the write to handleOfflineWrite (queuing it) if the mapping is not yet available,
      //    preventing backend database CastErrors.
      let payload = null;
      let targetTempId = null;

      if (endpoint.startsWith("todo/")) {
        if (config.data) {
          try {
            payload = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
            if (payload && payload.taskID && payload.taskID.startsWith("temp_")) {
              targetTempId = payload.taskID;
            }
          } catch (_) {
            payload = null;
          }
        }
      }

      if (targetTempId) {
        if (tempIdMap[targetTempId]) {
          // A) Substitution: Mapping exists
          payload.taskID = tempIdMap[targetTempId];
          config.data = typeof config.data === "string" ? JSON.stringify(payload) : payload;
        } else {
          // B) Queue: Mapping not yet available, treat as offline write
          config.adapter = async () => {
            const data = await handleOfflineWrite(
              endpoint,
              payload || {},
              config.headers
            );
            return {
              data,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          };
          return config;
        }
      }

      if (!isOnline || !navigator.onLine) {
        try {
          // ── Intercept Auth: return cached user identity offline ──
          if (endpoint === "user/getUserData") {
            config.adapter = async () => {
              const cached = await dbGet("user_cache");
              if (cached && cached._id) {
                return {
                  data: { status: true, data: cached },
                  status: 200,
                  statusText: "OK",
                  headers: {},
                  config,
                };
              }
              // No cached user — let it propagate so the auth layer uses localStorage fallback
              throw new Error("No cached user available offline");
            };
            return config;
          }

          // ── Intercept Reads ──
          if (endpoint.startsWith("filters/")) {
            config.adapter = async () => {
              const data = await handleOfflineRead(
                endpoint,
                config.data
                  ? typeof config.data === "string"
                    ? JSON.parse(config.data)
                    : config.data
                  : {}
              );
              return {
                data,
                status: 200,
                statusText: "OK",
                headers: {},
                config,
              };
            };
            return config;
          }

          // Intercept Writes (standard writes when offline)
          if (endpoint.startsWith("todo/")) {
            config.adapter = async () => {
              const data = await handleOfflineWrite(
                endpoint,
                payload || (config.data
                  ? typeof config.data === "string"
                    ? JSON.parse(config.data)
                    : config.data
                  : {}),
                config.headers
              );
              return {
                data,
                status: 200,
                statusText: "OK",
                headers: {},
                config,
              };
            };
            return config;
          }
        } catch (interceptErr) {
          console.error("[SyncManager] Request interception failed:", interceptErr);
          return config;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  axios.interceptors.response.use(
    async (response) => {
      const config = response.config;
      if (config._bypassOfflineInterceptor) {
        return response;
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const isApiRequest = config.url && config.url.startsWith(apiUrl);
      if (!isApiRequest) {
        return response;
      }

      const endpoint = config.url.substring(apiUrl.length);

      if (response.status === 200 && response.data) {
        try {
          // ── Cache user identity for offline auth ──
          if (endpoint === "user/getUserData" && response.data?.data?._id) {
            await dbPut("user_cache", response.data.data);
          }

          if (endpoint === "filters/all") {
            const activeTasks = Array.isArray(response.data) ? response.data : [];
            const currentTasks = (await dbGet("tasks")) || [];
            const deletedTasks = currentTasks.filter((t) => t.deleted);
            const tempTasks = currentTasks.filter((t) => t._id.startsWith("temp_"));

            const merged = [...activeTasks, ...deletedTasks, ...tempTasks];
            const unique = [];
            const seen = new Set();
            for (const t of merged) {
              if (!seen.has(t._id)) {
                seen.add(t._id);
                unique.push(t);
              }
            }
            await dbPut("tasks", unique);
            // Recalculate counts from freshly fetched tasks
            await recalculateOfflineCounts(unique);
          } else if (endpoint === "filters/deleted") {
            const deletedTasks = Array.isArray(response.data)
              ? response.data.map((t) => ({ ...t, deleted: true }))
              : [];
            const currentTasks = (await dbGet("tasks")) || [];
            const activeTasks = currentTasks.filter((t) => !t.deleted);
            const tempTasks = currentTasks.filter((t) => t._id.startsWith("temp_"));

            const merged = [...activeTasks, ...deletedTasks, ...tempTasks];
            const unique = [];
            const seen = new Set();
            for (const t of merged) {
              if (!seen.has(t._id)) {
                seen.add(t._id);
                unique.push(t);
              }
            }
            await dbPut("tasks", unique);
          } else if (endpoint === "filters/starred") {
            // Merge starred tasks into the central task store
            const starredTasks = Array.isArray(response.data)
              ? response.data.map((t) => ({ ...t, starred: true }))
              : [];
            const currentTasks = (await dbGet("tasks")) || [];
            const starredIds = new Set(starredTasks.map((t) => t._id));
            // Update starred flag on existing tasks, add new ones
            const updatedTasks = currentTasks.map((t) =>
              starredIds.has(t._id) ? { ...t, starred: true } : t
            );
            const existingIds = new Set(updatedTasks.map((t) => t._id));
            starredTasks.forEach((t) => { if (!existingIds.has(t._id)) updatedTasks.push(t); });
            await dbPut("tasks", updatedTasks);
          } else if (endpoint === "filters/today") {
            // Merge today's tasks into the central task store
            const todayTasks = Array.isArray(response.data) ? response.data : [];
            const currentTasks = (await dbGet("tasks")) || [];
            const todayIds = new Set(todayTasks.map((t) => t._id));
            const updatedTasks = currentTasks.map((t) =>
              todayIds.has(t._id) ? { ...todayTasks.find((td) => td._id === t._id) } : t
            );
            const existingIds = new Set(updatedTasks.map((t) => t._id));
            todayTasks.forEach((t) => { if (!existingIds.has(t._id)) updatedTasks.push(t); });
            await dbPut("tasks", updatedTasks);
          } else if (endpoint === "filters/week") {
            // Merge this week's tasks into the central task store
            const weekTasks = Array.isArray(response.data) ? response.data : [];
            const currentTasks = (await dbGet("tasks")) || [];
            const weekIds = new Set(weekTasks.map((t) => t._id));
            const updatedTasks = currentTasks.map((t) =>
              weekIds.has(t._id) ? { ...weekTasks.find((wt) => wt._id === t._id) } : t
            );
            const existingIds = new Set(updatedTasks.map((t) => t._id));
            weekTasks.forEach((t) => { if (!existingIds.has(t._id)) updatedTasks.push(t); });
            await dbPut("tasks", updatedTasks);
          } else if (endpoint === "filters/counts") {
            await dbPut("counts", response.data);
          } else if (endpoint === "filters/activity") {
            await dbPut("activity", response.data);
          }
        } catch (cacheErr) {
          console.error("[SyncManager] Cache update failed:", cacheErr);
        }
      }

      return response;
    },
    async (error) => {
      const config = error.config;
      if (config && config._bypassOfflineInterceptor) {
        return Promise.reject(error);
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const isApiRequest = config && config.url && config.url.startsWith(apiUrl);
      const isNetworkError = !error.response;

      if (isApiRequest && isNetworkError) {
        try {
          // Automatically switch connection status internally to offline
          if (isOnline) {
            isOnline = false;
            notifyConnectionListeners();
            window.dispatchEvent(new CustomEvent("todo-connection-changed", { detail: { isOnline: false } }));
            toast.warning("Network connection lost. Running in Offline Mode.");
            startPingInterval(); // Start polling to detect recovery
          }

          const endpoint = config.url.substring(apiUrl.length);

          // ── AUTH (mid-flight network drop) ──
          // If the user identity call fails due to network loss, return cached identity
          if (endpoint === "user/getUserData") {
            const cached = await dbGet("user_cache");
            if (cached && cached._id) {
              return {
                data: { status: true, data: cached },
                status: 200,
                statusText: "OK",
                headers: {},
                config,
              };
            }
            // No cache — let AuthenticationPage handle it via localStorage fallback
            return Promise.reject(error);
          }

          // ── READS ──
          if (endpoint.startsWith("filters/")) {
            const data = await handleOfflineRead(
              endpoint,
              config.data
                ? typeof config.data === "string"
                  ? JSON.parse(config.data)
                  : config.data
                : {}
            );
            return {
              data,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          }

          // ── WRITES ──
          if (endpoint.startsWith("todo/")) {
            const data = await handleOfflineWrite(
              endpoint,
              config.data
                ? typeof config.data === "string"
                  ? JSON.parse(config.data)
                  : config.data
                : {},
              config.headers
            );
            return {
              data,
              status: 200,
              statusText: "OK",
              headers: {},
              config,
            };
          }
        } catch (recoverErr) {
          console.error("[SyncManager] Recovery from network error failed:", recoverErr);
        }
      }

      return Promise.reject(error);
    }
  );

  // Initial sync & recovery setup
  if (navigator.onLine) {
    syncOfflineQueue();
  } else {
    isOnline = false;
    notifyConnectionListeners();
    startPingInterval();
  }
}

export async function clearOfflineData() {
  // 1. Send CLEAR_USER_DATA message to active service worker
  try {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "CLEAR_USER_DATA" });
      console.log("[SyncManager] Dispatched CLEAR_USER_DATA to service worker.");
    }
  } catch (err) {
    console.error("[SyncManager] Failed to message service worker:", err);
  }

  // 2. Close existing client IndexedDB connection
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  dbPromise = null;

  // 3. Delete client database
  await new Promise((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => {
      console.log(`[SyncManager] Deleted database: ${DB_NAME}`);
      resolve();
    };
    req.onerror = (e) => {
      console.error(`[SyncManager] Failed to delete database: ${DB_NAME}`, e.target.error);
      resolve();
    };
    req.onblocked = () => {
      console.warn(`[SyncManager] Database deletion blocked: ${DB_NAME}`);
      resolve();
    };
  });

  // 4. Delete service worker database
  await new Promise((resolve) => {
    const req = indexedDB.deleteDatabase("todo-sw-v1");
    req.onsuccess = () => {
      console.log("[SyncManager] Deleted database: todo-sw-v1");
      resolve();
    };
    req.onerror = (e) => {
      console.error("[SyncManager] Failed to delete database: todo-sw-v1", e.target.error);
      resolve();
    };
    req.onblocked = () => {
      console.warn("[SyncManager] Database deletion blocked: todo-sw-v1");
      resolve();
    };
  });

  // 5. Clear runtime caches
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        if (key.includes("todo-runtime")) {
          await caches.delete(key);
          console.log(`[SyncManager] Deleted runtime cache: ${key}`);
        }
      }
    }
  } catch (err) {
    console.error("[SyncManager] Failed to clear runtime caches:", err);
  }
}
