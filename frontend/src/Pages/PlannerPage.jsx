import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle2, 
  Clock, 
  SlidersHorizontal,
  FolderMinus,
  Sparkles
} from "lucide-react";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import TaskDetailsModal from "../Components/TaskDetailsModal";
import CreateTask from "../Components/CreateTask";

// Helpers
function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function PlannerPage() {
  const userInfo = useSelector((state) => state.UserSlice);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // State
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState("week"); // "week" | "month"
  const [currentDate, setCurrentDate] = useState(new Date()); // Anchors calendar navigation
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [schedulingTaskId, setSchedulingTaskId] = useState(null); // ID of task currently choosing date for
  const [showBacklog, setShowBacklog] = useState(true);
  const [createTaskInitialDate, setCreateTaskInitialDate] = useState(null);

  // Fetch all user tasks (including planned and unplanned)
  const fetchAllTasks = useCallback(async () => {
    if (!userInfo?.userId) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${apiUrl}filters/all`, { userId: userInfo.userId });
      if (res.data && Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      toast.error("Failed to load planner tasks");
    } finally {
      setIsLoading(false);
    }
  }, [userInfo?.userId, apiUrl]);

  useEffect(() => {
    fetchAllTasks();
  }, [fetchAllTasks]);

  // Backlog tasks: tasks that have no startDate/endDate or dueDate scheduled
  const backlogTasks = useMemo(() => {
    return tasks.filter((t) => !t.deleted && !t.completed && !t.startDate && !t.dueDate);
  }, [tasks]);

  // Scheduled tasks: map dates to lists of tasks
  const scheduledTasksMap = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (t.deleted) return;
      
      // Check date key (prefers startDate, falls back to dueDate or date created)
      let dateKey = null;
      if (t.startDate) {
        dateKey = toDateKey(new Date(t.startDate));
      } else if (t.dueDate) {
        dateKey = toDateKey(new Date(t.dueDate));
      }
      
      if (dateKey) {
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(t);
      }
    });
    return map;
  }, [tasks]);

  // Navigate calendar time
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (activeView === "week") {
      next.setDate(currentDate.getDate() - 7);
    } else {
      next.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (activeView === "week") {
      next.setDate(currentDate.getDate() + 7);
    } else {
      next.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(next);
  };

  // Weekly Grid definition (Monday-anchored week of currentDate)
  const weekDays = useMemo(() => {
    const dayOfWeek = currentDate.getDay();
    const monday = new Date(currentDate);
    // Align to Monday
    monday.setDate(currentDate.getDate() - ((dayOfWeek + 6) % 7));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [currentDate]);

  // Monthly Grid definition (Full calendar matrix of currentDate month)
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sun=0, Mon=1, etc.
    const alignedFirstDay = (firstDayIndex + 6) % 7; // Monday-anchored start index
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    const cells = [];

    // Prev month padding cells
    for (let i = alignedFirstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      cells.push({ date: d, currentMonth: false });
    }

    // Current month cells
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      cells.push({ date: d, currentMonth: true });
    }

    // Next month padding cells to complete 6-row layout grid (42 cells)
    const paddingNeeded = 42 - cells.length;
    for (let i = 1; i <= paddingNeeded; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({ date: d, currentMonth: false });
    }

    return cells;
  }, [currentDate]);

  // Helper to check if a date is in the past
  const isPastDate = useCallback((dateStr) => {
    const todayStr = toDateKey(new Date());
    return dateStr < todayStr;
  }, []);

  // Schedule task API update
  const handleScheduleTask = async (taskID, dateStr) => {
    if (!taskID || !userInfo.userId) return;
    if (isPastDate(dateStr)) {
      toast.error("Cannot schedule tasks in the past");
      return;
    }
    const targetDate = new Date(dateStr);
    try {
      await axios.post(`${apiUrl}todo/updateTask`, {
        taskID,
        userId: userInfo.userId,
        startDate: targetDate.toISOString(),
        dueDate: targetDate.toISOString() // Align dueDate for filters
      });
      setSchedulingTaskId(null);
      toast.success("Task scheduled successfully!");
      fetchAllTasks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule task");
    }
  };

  // Unschedule task API update
  const handleUnscheduleTask = async (e, taskID) => {
    e.stopPropagation();
    if (!taskID || !userInfo.userId) return;
    try {
      await axios.post(`${apiUrl}todo/updateTask`, {
        taskID,
        userId: userInfo.userId,
        startDate: null,
        dueDate: null
      });
      toast.info("Task moved back to backlog");
      fetchAllTasks();
    } catch (err) {
      console.error(err);
      toast.error("Failed to unschedule task");
    }
  };

  const handleToggleStarred = async (e, taskID, status) => {
    e.stopPropagation();
    if (!taskID || !userInfo.userId) return;
    const endpoint = status ? "todo/unMarkStarred" : "todo/markStarred";
    try {
      await axios.post(`${apiUrl}${endpoint}`, { taskID, userId: userInfo.userId });
      fetchAllTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleComplete = async (e, taskID, status) => {
    e.stopPropagation();
    if (!taskID || !userInfo.userId) return;
    const endpoint = status ? "todo/unMarkComplete" : "todo/markComplete";
    try {
      await axios.post(`${apiUrl}${endpoint}`, { taskID, userId: userInfo.userId });
      fetchAllTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop handlers for scheduling
  const [draggedOverDate, setDraggedOverDate] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, dateStr) => {
    if (isPastDate(dateStr)) return;
    e.preventDefault();
  };

  const handleDragEnter = (e, dateStr) => {
    if (isPastDate(dateStr)) return;
    e.preventDefault();
    setDraggedOverDate(dateStr);
  };

  const handleDragLeave = (e, dateStr) => {
    if (draggedOverDate === dateStr) {
      setDraggedOverDate(null);
    }
  };

  const handleDropOnDay = async (e, dateStr) => {
    e.preventDefault();
    setDraggedOverDate(null);
    if (isPastDate(dateStr)) {
      toast.error("Cannot schedule tasks in the past");
      return;
    }
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    await handleScheduleTask(taskId, dateStr);
  };

  const handleCellClick = (date) => {
    const dateStr = toDateKey(date);
    if (isPastDate(dateStr)) {
      toast.warning("Cannot schedule tasks on past dates");
      return;
    }
    setCreateTaskInitialDate(dateStr);
    setShowCreateTask(true);
  };

  const weekHeaderLabel = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const options = { month: "short", day: "numeric" };
    return `${start.toLocaleDateString("en-US", options)} – ${end.toLocaleDateString("en-US", options)}, ${currentDate.getFullYear()}`;
  }, [weekDays, currentDate]);

  const monthHeaderLabel = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [currentDate]);

  return (
    <div className="relative min-h-screen bg-[#05050a] text-zinc-200 flex flex-col overflow-x-hidden font-sans">
      {/* Background Mesh Gradients */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-purple-900/10 blur-[130px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-fuchsia-950/10 blur-[160px]" />
      </div>

      <Header />

      <main className="relative z-10 flex-grow max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Planner Header toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-950/40 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center gap-3 text-left">
            <CalendarIcon size={20} className="text-amber-400" />
            <div>
              <h2 className="text-base font-extrabold text-zinc-100">Task Command Planner</h2>
              <p className="text-[10px] text-zinc-400 mt-0.5">Schedule tasks, structure columns, and coordinate priorities.</p>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-zinc-900/30 border border-zinc-800/60 p-1 rounded-xl">
              <button
                onClick={() => setActiveView("week")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                  activeView === "week"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Week View
              </button>
              <button
                onClick={() => setActiveView("month")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                  activeView === "month"
                    ? "bg-purple-600/20 text-purple-300 border border-purple-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Month View
              </button>
            </div>

            {/* Backlog Toggle */}
            <button
              onClick={() => setShowBacklog(!showBacklog)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all focus:outline-none cursor-pointer ${
                showBacklog
                  ? "bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
              title={showBacklog ? "Hide Backlog Drawer" : "Show Backlog Drawer"}
            >
              <FolderMinus size={13} />
              <span>Backlog</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                showBacklog ? "bg-purple-500/30 text-purple-200" : "bg-zinc-800 text-zinc-400"
              }`}>
                {backlogTasks.length}
              </span>
            </button>

            {/* Time anchors */}
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 cursor-pointer focus:outline-none">
                <ChevronLeft size={14} />
              </button>
              <span className="text-xs font-extrabold text-zinc-300 min-w-[120px]">
                {activeView === "week" ? weekHeaderLabel : monthHeaderLabel}
              </span>
              <button onClick={handleNext} className="p-2 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 cursor-pointer focus:outline-none">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Board / Backlog drawer layout split */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch w-full">
          
          {/* 1. Main Calendar Board (Left Column) */}
          <div className={`flex-grow flex flex-col transition-all duration-300 ${
            showBacklog ? "w-full lg:w-[70%]" : "w-full lg:w-full"
          }`}>
            
            {/* Week view board columns */}
            {activeView === "week" && (
              <div className="flex flex-col sm:flex-row gap-3 h-full min-h-[650px] w-full">
                {weekDays.map((day, i) => {
                  const dateStr = toDateKey(day);
                  const isToday = dateStr === toDateKey(new Date());
                  const isPast = dateStr < toDateKey(new Date());
                  const dayTasks = scheduledTasksMap[dateStr] || [];
                  const label = day.toLocaleDateString("en-US", { weekday: "short" });
                  const dateNum = day.getDate();

                  return (
                    <div 
                      key={i} 
                      onDragOver={(e) => handleDragOver(e, dateStr)}
                      onDragEnter={(e) => handleDragEnter(e, dateStr)}
                      onDragLeave={(e) => handleDragLeave(e, dateStr)}
                      onDrop={(e) => handleDropOnDay(e, dateStr)}
                      className={`flex flex-col border rounded-2xl p-3 shadow-sm min-h-[140px] sm:min-h-0 transition-all duration-350 ease-out sm:flex-1 sm:w-0 sm:min-w-[100px] sm:hover:flex-[2.2] sm:hover:min-w-[180px] group/col ${
                        dateStr === draggedOverDate
                          ? "border-purple-500 bg-purple-500/10 scale-[1.02] shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                          : isToday
                          ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                          : isPast
                          ? "border-zinc-900 bg-zinc-950/20 opacity-60"
                          : "border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/40 bg-zinc-900/30"
                      }`}
                    >
                      {/* Column day header */}
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-2.5 flex-shrink-0 transition-colors group-hover/col:border-zinc-700">
                        <span className={`text-[10px] font-black uppercase tracking-wider transition-colors ${isToday ? "text-amber-400" : "text-zinc-300 group-hover/col:text-zinc-100"}`}>{label}</span>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          isToday ? "bg-amber-400 text-black shadow-lg shadow-amber-400/20 group-hover/col:scale-110" : "text-zinc-200 group-hover/col:text-white group-hover/col:bg-zinc-800/50"
                        }`}>
                          {dateNum}
                        </span>
                      </div>

                      {/* Column planned tasks */}
                      <div className="flex flex-col gap-2 overflow-y-auto max-h-[560px] scrollbar-none flex-grow">
                        {dayTasks.map((t) => (
                          <div 
                            key={t._id}
                            onClick={() => setSelectedTask(t)}
                            className="p-2 rounded-xl bg-zinc-950/45 border border-zinc-800 hover:border-zinc-700 transition-all text-left cursor-pointer group flex flex-col gap-1"
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <span className={`text-[11px] font-semibold leading-snug break-all ${t.completed ? "line-through text-zinc-500" : "text-zinc-200"}`}>
                                {t.task}
                              </span>
                              <button 
                                onClick={(e) => handleUnscheduleTask(e, t._id)}
                                title="Unschedule task"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-red-400 flex-shrink-0"
                              >
                                &times;
                              </button>
                            </div>
                            
                            {/* Color priority dot */}
                            <div className="flex items-center gap-1.5 mt-0.5 flex-shrink-0">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                              }`} />
                              <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-wider">{t.priority}</span>
                            </div>
                          </div>
                        ))}
                        {dayTasks.length === 0 && (
                          <div 
                            className={`flex-grow flex flex-col items-center justify-center border border-dashed rounded-xl py-6 transition-colors ${
                              isPast 
                                ? "border-zinc-900/40 cursor-not-allowed" 
                                : "border-zinc-800 hover:bg-zinc-900/20 cursor-pointer"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isPast) return;
                              setCreateTaskInitialDate(dateStr);
                              setShowCreateTask(true);
                            }}
                          >
                            <span className="text-[9px] text-zinc-400 font-bold">Planned Empty</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Month view board cells */}
            {activeView === "month" && (
              <div className="bg-zinc-950/20 border border-zinc-800 rounded-2xl p-4 shadow-sm flex-grow min-h-[650px] flex flex-col">
                {/* Weekday titles */}
                <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-zinc-800 mb-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <span key={day} className="text-[10px] font-black uppercase tracking-wider text-zinc-300">{day}</span>
                  ))}
                </div>
                {/* 42 grid cells */}
                <div className="grid grid-cols-7 gap-2 flex-grow">
                  {monthDays.map((cell, idx) => {
                    const dateStr = toDateKey(cell.date);
                    const isToday = dateStr === toDateKey(new Date());
                    const isPast = dateStr < toDateKey(new Date());
                    const dayTasks = scheduledTasksMap[dateStr] || [];
                    const dateNum = cell.date.getDate();

                    return (
                      <div 
                        key={idx}
                        onDragOver={(e) => handleDragOver(e, dateStr)}
                        onDragEnter={(e) => handleDragEnter(e, dateStr)}
                        onDragLeave={(e) => handleDragLeave(e, dateStr)}
                        onDrop={(e) => handleDropOnDay(e, dateStr)}
                        className={`flex flex-col border rounded-xl p-1.5 text-left transition-all cursor-pointer ${
                          dateStr === draggedOverDate
                            ? "border-purple-500 bg-purple-500/10 scale-[1.02] shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                            : isToday && dateStr !== draggedOverDate
                            ? "border-amber-500/50 bg-amber-500/10" 
                            : isPast
                            ? "bg-zinc-950/40 text-zinc-500 opacity-50 border-zinc-900 cursor-not-allowed"
                            : cell.currentMonth 
                            ? "bg-zinc-900/10 text-zinc-200 border-zinc-800 hover:border-zinc-700/80 hover:bg-zinc-900/20" 
                            : "bg-zinc-950/30 text-zinc-500 opacity-60 border-zinc-800"
                        }`}
                        onClick={() => handleCellClick(cell.date)}
                      >
                        <div className="flex justify-between items-center mb-1 flex-shrink-0">
                          <span className={`text-[10px] font-black ${isToday ? "text-amber-400" : "text-zinc-300"}`}>{dateNum}</span>
                          {dayTasks.length > 0 && (
                            <span className="text-[8px] px-1 font-bold rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">{dayTasks.length}</span>
                          )}
                        </div>
                        {/* Compact list of month tasks */}
                        <div className="flex flex-col gap-1 overflow-y-auto max-h-[110px] scrollbar-none flex-grow">
                          {dayTasks.map((t) => (
                            <div 
                              key={t._id}
                              onClick={() => setSelectedTask(t)}
                              title={`${t.task} (${t.priority} priority)`}
                              className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 transition-colors flex items-center justify-between gap-1 cursor-pointer truncate"
                            >
                              <span className={`truncate flex-1 ${t.completed ? "line-through text-zinc-600" : "text-zinc-200"}`}>{t.task}</span>
                              <div className={`w-1 h-1 rounded-full flex-shrink-0 ${
                                t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                              }`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
          </div>

          {/* 2. Unscheduled Backlog Drawer (Right Column) */}
          {showBacklog && (
            <div className="w-full lg:w-80 flex-shrink-0 bg-zinc-950/40 border border-zinc-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50 flex-shrink-0 text-left">
              <div>
                <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                  <FolderMinus size={13} className="text-purple-400" />
                  <span>Unplanned Backlog</span>
                </h3>
                <p className="text-[9px] text-zinc-400 mt-0.5">Tasks needing dates scheduled.</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-zinc-900 border border-zinc-800 text-zinc-400">
                {backlogTasks.length}
              </span>
            </div>

            {/* Quick Add Backlog */}
            <button
              onClick={() => setShowCreateTask(true)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer focus:outline-none flex-shrink-0"
            >
              <Plus size={13} className="stroke-[3]" />
              <span>Add to Backlog</span>
            </button>

            {/* Backlog List */}
            <div className="flex-grow overflow-y-auto pr-0.5 scrollbar-none flex flex-col gap-3 min-h-[300px]">
              {backlogTasks.map((t) => {
                const isSelectedForScheduling = schedulingTaskId === t._id;
                
                return (
                  <div
                    key={t._id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, t._id)}
                    className={`relative p-3.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer flex flex-col gap-2.5 active:cursor-grabbing hover:scale-[1.01] ${
                      isSelectedForScheduling
                        ? "bg-amber-500/10 border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.05)]"
                        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                    }`}
                    onClick={() => {
                      if (!isSelectedForScheduling) setSelectedTask(t);
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="font-semibold text-xs text-zinc-100 leading-tight">
                        {t.task}
                      </span>
                      {/* Priority Dot */}
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${
                        t.priority === "high" ? "bg-red-500" : t.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
                    </div>

                    {/* Desc */}
                    {t.description && (
                      <p className="text-[10px] text-zinc-300 leading-normal -mt-1">{t.description}</p>
                    )}

                    {/* Action Schedule Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60 mt-1 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleToggleStarred(e, t._id, t.starred)}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors"
                        >
                          {t.starred ? (
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                          ) : (
                            <Star size={12} />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTask(t);
                          }}
                          className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-purple-400 transition-colors"
                        >
                          <CheckCircle2 size={11} />
                        </button>
                      </div>

                      {/* Schedule action input */}
                      <div className="relative">
                        {isSelectedForScheduling ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="date"
                              min={toDateKey(new Date())}
                              onChange={(e) => handleScheduleTask(t._id, e.target.value)}
                              className="text-[10px] bg-zinc-950 border border-zinc-800 rounded p-1 text-zinc-300 font-bold focus:outline-none focus:border-amber-500/40"
                            />
                            <button
                              onClick={() => setSchedulingTaskId(null)}
                              className="text-[10px] text-zinc-400 hover:text-zinc-200 px-1 font-bold"
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSchedulingTaskId(t._id);
                            }}
                            title="Schedule on Calendar"
                            className="flex items-center gap-1 py-1 px-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/15 text-amber-400 text-[10px] font-bold transition-all cursor-pointer focus:outline-none"
                          >
                            <CalendarIcon size={9} />
                            <span>Schedule</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
              {backlogTasks.length === 0 && (
                <div className="flex-grow flex flex-col items-center justify-center py-16 text-center">
                  <span className="text-zinc-200 font-bold text-xs">Backlog Empty</span>
                  <p className="text-[10px] text-zinc-400 mt-1 max-w-[160px]">All pending tasks scheduled on the calendar.</p>
                </div>
              )}
            </div>
          </div>
          )}
          
        </div>
      </main>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailsModal
          key={selectedTask._id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={fetchAllTasks}
        />
      )}
      {showCreateTask && (
        <CreateTask 
          initialDate={createTaskInitialDate}
          onClose={() => {
            setShowCreateTask(false);
            setCreateTaskInitialDate(null);
            fetchAllTasks();
          }} 
        />
      )}
    </div>
  );
}
