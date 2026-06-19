import { useMemo, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Timer,
} from "lucide-react";
import { setFocusTask } from "../Store/Reducers/TodoFilterSlice";
import { syncTasksToSW } from "../utils/serviceWorker";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getRelativeTime(date) {
  const diffMs = date - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  const absMins = Math.abs(diffMins);
  if (absMins < 1) return "just now";
  if (absMins < 60) return diffMins < 0 ? `${absMins}m ago` : `in ${absMins}m`;
  const hours = Math.floor(absMins / 60);
  if (hours < 24) return diffMins < 0 ? `${hours}h ago` : `in ${hours}h`;
  const days = Math.floor(hours / 24);
  return diffMins < 0 ? `${days}d ago` : `in ${days}d`;
}

function PriorityDot({ priority }) {
  const colors = { high: "bg-red-500", medium: "bg-amber-400", low: "bg-emerald-500" };
  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-[3px] ${
        colors[priority] || "bg-zinc-500"
      }`}
    />
  );
}

function SectionLabel({ icon, label, color }) {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest select-none ${color}`}
    >
      {icon}
      {label}
    </div>
  );
}

function NotificationItem({ task, onClick }) {
  const due = new Date(task.dueDate);
  const isOverdue = due < Date.now() && !task.completed;

  return (
    <button
      onClick={() => onClick(task)}
      className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-white/[0.04] transition-colors text-left group"
    >
      <PriorityDot priority={task.priority} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-200 truncate leading-tight group-hover:text-white transition-colors">
          {task.task}
        </p>
        <span
          className={`text-[10px] font-medium mt-0.5 block ${
            isOverdue ? "text-red-400" : "text-zinc-500"
          }`}
        >
          {getRelativeTime(due)}
        </span>
      </div>
      <ChevronRight
        size={13}
        className="flex-shrink-0 text-zinc-700 group-hover:text-purple-400 transition-colors mt-0.5"
      />
    </button>
  );
}

// ─── main export ─────────────────────────────────────────────────────────────

export default function NotificationBell({ onTaskClick }) {
  const dispatch = useDispatch();
  const todos = useSelector((state) => state.TodoFilterSlice.todo);

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // ── categorise ───────────────────────────────────────────────────────────
  const { overdue, dueToday, comingSoon, urgentCount } = useMemo(() => {
    const now = Date.now();
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const in3Days = new Date(now + 3 * 24 * 60 * 60 * 1000);

    const candidates = (todos || []).filter(
      (t) => !t.completed && !t.deleted && t.dueDate
    );

    const overdue = [];
    const dueToday = [];
    const comingSoon = [];

    for (const t of candidates) {
      const due = new Date(t.dueDate);
      if (due < now) overdue.push(t);
      else if (due <= endOfToday) dueToday.push(t);
      else if (due <= in3Days) comingSoon.push(t);
    }

    const byDue = (a, b) => new Date(a.dueDate) - new Date(b.dueDate);
    overdue.sort(byDue);
    dueToday.sort(byDue);
    comingSoon.sort(byDue);

    return {
      overdue,
      dueToday,
      comingSoon,
      urgentCount: overdue.length + dueToday.length,
    };
  }, [todos]);

  const hasNotifications =
    overdue.length + dueToday.length + comingSoon.length > 0;

  // ── Sync tasks to the Service Worker ────────────────────────────────────
  // The SW persists them in IndexedDB and fires notifications even when
  // the tab is closed (browser must be running for SW to be active).
  useEffect(() => {
    if (todos && todos.length) {
      syncTasksToSW(todos);
    }
  }, [todos]);

  // ── Request browser notification permission once ──────────────────────
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ── outside-click closes dropdown ───────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handle = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  // ── notification item clicked ────────────────────────────────────────────
  const handleItemClick = (task) => {
    setOpen(false);
    dispatch(setFocusTask(task._id));
    if (onTaskClick) onTaskClick(task);
  };

  return (
    <div className="relative">
      {/* ── Bell button ─────────────────────────────────────────────────── */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer focus:outline-none ${
          open
            ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
            : "bg-zinc-900/20 border-zinc-900 hover:border-zinc-800 text-zinc-400 hover:text-zinc-200"
        }`}
        title="Task notifications"
        aria-label="Open notifications"
      >
        {hasNotifications ? (
          <Bell
            size={16}
            className={
              urgentCount > 0 ? "animate-[wiggle_2s_ease-in-out_infinite]" : ""
            }
          />
        ) : (
          <BellOff size={16} />
        )}

        {urgentCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-lg shadow-red-900/40 select-none border-2 border-zinc-950">
            {urgentCount > 9 ? "9+" : urgentCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            key="notif-panel"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 z-50 w-80 bg-zinc-950 border border-zinc-800/70 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden origin-top-right"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/60 bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <Bell size={13} className="text-purple-400" />
                <span className="text-xs font-extrabold text-zinc-100 tracking-tight">
                  Notifications
                </span>
              </div>
              {urgentCount > 0 && (
                <span className="text-[10px] font-bold text-red-400 bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded-full">
                  {urgentCount} urgent
                </span>
              )}
              {urgentCount === 0 && hasNotifications && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-950/30 border border-amber-900/40 px-2 py-0.5 rounded-full">
                  {comingSoon.length} upcoming
                </span>
              )}
            </div>

            {/* Panel body */}
            <div className="max-h-[320px] overflow-y-auto">
              {!hasNotifications ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 size={22} className="text-emerald-500/70" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-300">All caught up!</p>
                    <p className="text-[10px] text-zinc-600 mt-1 leading-relaxed">
                      No tasks due soon. Set a due date on a task to see it here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-1.5">
                  {/* Overdue */}
                  {overdue.length > 0 && (
                    <div className="mb-0.5">
                      <SectionLabel
                        icon={<AlertTriangle size={10} />}
                        label={`Overdue · ${overdue.length}`}
                        color="text-red-400/80"
                      />
                      {overdue.map((t) => (
                        <NotificationItem
                          key={t._id}
                          task={t}
                          onClick={handleItemClick}
                        />
                      ))}
                    </div>
                  )}

                  {/* Due Today */}
                  {dueToday.length > 0 && (
                    <div className="mb-0.5">
                      <SectionLabel
                        icon={<Clock size={10} />}
                        label={`Due Today · ${dueToday.length}`}
                        color="text-amber-400/80"
                      />
                      {dueToday.map((t) => (
                        <NotificationItem
                          key={t._id}
                          task={t}
                          onClick={handleItemClick}
                        />
                      ))}
                    </div>
                  )}

                  {/* Coming Up */}
                  {comingSoon.length > 0 && (
                    <div>
                      <SectionLabel
                        icon={<Timer size={10} />}
                        label={`Coming Up · ${comingSoon.length}`}
                        color="text-purple-400/80"
                      />
                      {comingSoon.map((t) => (
                        <NotificationItem
                          key={t._id}
                          task={t}
                          onClick={handleItemClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {hasNotifications && (
              <div className="border-t border-zinc-800/60 px-4 py-2 bg-zinc-900/20">
                <p className="text-[10px] text-zinc-600 text-center">
                  Click any task to open its details
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
