import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "../utils/auth";
import { RxCross2 } from "react-icons/rx";
import { Calendar, AlertCircle, Edit3, AlignLeft, ArrowLeft, Star, Trash2, RefreshCw } from "lucide-react";
import CustomDateTimePicker from "./CustomDateTimePicker";
import RecurrencePicker, { emptyRecurrence } from "./RecurrencePicker";
import SubtaskEditor from "./SubtaskEditor";
import TagInput from "./TagInput";


const getCurrentLocalDateTimeString = () => {
  const d = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const MAX_TASK_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;

function TaskDetailsModal({ task, onClose, onUpdate }) {
  const [taskText, setTaskText] = useState(task.task || "");
  const [priority, setPriority] = useState(task.priority || "low");
  const [dueDate, setDueDate] = useState(() => {
    if (!task.dueDate) return "";
    try {
      const date = new Date(task.dueDate);
      // Format to YYYY-MM-DDTHH:MM for datetime-local input
      const pad = (num) => String(num).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return "";
    }
  });
  const [description, setDescription] = useState(task.description || "");
  const [isStarred, setIsStarred] = useState(task.starred || false);
  const [subtasks, setSubtasks] = useState(() =>
    Array.isArray(task.subtasks)
      ? task.subtasks.map((s) => ({ title: s.title || "", done: !!s.done }))
      : []
  );
  const [tags, setTags] = useState(() => (Array.isArray(task.tags) ? task.tags : []));
  const [recurrence, setRecurrence] = useState(() => {
    const r = task.recurrence;
    if (!r || !r.frequency || r.frequency === "none") return emptyRecurrence();
    return {
      frequency: r.frequency,
      interval: r.interval || 1,
      daysOfWeek: Array.isArray(r.daysOfWeek) ? r.daysOfWeek : [],
      endDate: r.endDate || null,
    };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const modalRef = useRef();
  const inputRef = useRef();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [onClose]);

  // Handle backdrop click to close modal
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) {
      setError("Task title cannot be empty");
      return;
    }
    if (taskText.trim().length > MAX_TASK_LENGTH) {
      setError(`Task title cannot exceed ${MAX_TASK_LENGTH} characters`);
      return;
    }
    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      toast.error(`Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`);
      return;
    }

    setIsLoading(true);
    const token = getToken();

    try {
      const response = await axios.post(
        `${apiUrl}todo/updateTask`,
        {
          taskID: task._id,
          task: taskText.trim(),
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          description: description.trim(),
          starred: isStarred,
          recurrence,
          subtasks,
          tags,
        },
        {
          headers: {
            "X-Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status) {
        if (onUpdate) {
          await onUpdate();
        }
        onClose();
      } else {
        toast.error(response.data?.message || "Failed to update task");
      }
    } catch (err) {
      console.error("Error updating task:", err);
      toast.error(err.response?.data?.message || "An error occurred while updating the task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const token = getToken();

    try {
      const response = await axios.post(
        `${apiUrl}todo/deleteTask`,
        {
          taskID: task._id,
        },
        {
          headers: {
            "X-Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status) {
        toast.success("Task deleted successfully");
        if (onUpdate) {
          await onUpdate();
        }
        onClose();
      } else {
        toast.error(response.data?.message || "Failed to delete task");
      }
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.error(err.response?.data?.message || "An error occurred while deleting the task");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const token = getToken();

    try {
      const response = await axios.post(
        `${apiUrl}todo/undoDelete`,
        {
          taskID: task._id,
        },
        {
          headers: {
            "X-Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.data?.status) {
        toast.success("Task restored successfully");
        if (onUpdate) {
          await onUpdate();
        }
        onClose();
      } else {
        toast.error(response.data?.message || "Failed to restore task");
      }
    } catch (err) {
      console.error("Error restoring task:", err);
      toast.error(err.response?.data?.message || "An error occurred while restoring the task");
    } finally {
      setIsLoading(false);
    }
  };

  const minDateTime = getCurrentLocalDateTimeString();
  return createPortal(
    <AnimatePresence>
    <motion.div
      ref={modalRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="modal-heading"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center lg:items-stretch lg:justify-end lg:backdrop-blur-none p-0 bg-[#05050a] lg:bg-transparent pointer-events-auto lg:pointer-events-none"
    >
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#05050a] lg:bg-[#0b0b0f] w-full h-full lg:max-w-md lg:border-y-0 lg:border-r-0 lg:border-l lg:border-zinc-800/80 lg:rounded-none lg:rounded-l-2xl lg:shadow-[-10px_0_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden pointer-events-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900 flex-shrink-0 gap-4">
          <div className="flex items-center gap-2 min-w-0">
            {/* Back Button (Mobile/Tablet only) */}
            <button
              onClick={onClose}
              disabled={isLoading}
              type="button"
              className="lg:hidden p-2 mr-1 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-all duration-200 active:scale-95 focus:outline-none flex-shrink-0"
              title="Go back"
            >
              <ArrowLeft size={16} className="stroke-[2.5]" />
            </button>
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Edit3 size={18} />
            </span>
            <div className="min-w-0">
              <h3 id="modal-heading" className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                Task Details
              </h3>
              <p className="text-[10px] sm:text-xs text-zinc-500 truncate">Edit options and details.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Star toggle */}
            <button
              type="button"
              onClick={() => setIsStarred(!isStarred)}
              disabled={isLoading}
              className={`p-2 rounded-xl border transition-all duration-200 focus:outline-none cursor-pointer ${
                isStarred 
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" 
                  : "bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200"
              }`}
              title={isStarred ? "Unstar task" : "Star task"}
            >
              <Star size={16} fill={isStarred ? "currentColor" : "none"} />
            </button>

            {/* Delete button */}
            {!task.deleted && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="p-2 rounded-xl bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 hover:border-red-900/50 text-red-400 hover:text-red-300 transition-all duration-200 focus:outline-none cursor-pointer"
                title="Delete task"
              >
                <Trash2 size={16} />
              </button>
            )}

            {/* Restore button */}
            {task.deleted && (
              <button
                type="button"
                onClick={handleRestore}
                disabled={isLoading}
                className="p-2 rounded-xl bg-purple-950/20 hover:bg-purple-950/40 border border-purple-900/30 hover:border-purple-900/50 text-purple-400 hover:text-purple-300 transition-all duration-200 focus:outline-none cursor-pointer"
                title="Restore task"
              >
                <RefreshCw size={16} />
              </button>
            )}

            {/* Close button (Desktop only) */}
            <button
              onClick={onClose}
              disabled={isLoading}
              aria-label="Close dialog"
              type="button"
              className="hidden lg:flex p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-800 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 transition-all duration-200 group focus:outline-none cursor-pointer"
            >
              <RxCross2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </button>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="p-6 flex flex-col gap-5 flex-grow overflow-y-auto">
          {/* Task Title */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="taskText" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Task Title
            </label>
            <div className="relative flex items-center">
              <input
                id="taskText"
                ref={inputRef}
                type="text"
                value={taskText}
                maxLength={MAX_TASK_LENGTH}
                onChange={(e) => {
                  setTaskText(e.target.value);
                  if (error) setError("");
                }}
                disabled={isLoading}
                placeholder="e.g. Finish project submission"
                className="w-full pl-4 pr-16 py-2.5 bg-zinc-900/50 text-zinc-200 rounded-xl border border-zinc-800 focus:border-[#9040dd] focus:outline-none transition-all duration-200 disabled:opacity-50 text-sm"
              />
              <div className="absolute right-3 text-[10px] text-zinc-500 select-none font-semibold">
                {taskText.length}/{MAX_TASK_LENGTH}
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-400 font-medium animate-pulse">{error}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5 text-left flex flex-col flex-grow min-h-[140px]">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <AlignLeft size={14} />
              <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider">
                Description & Notes
              </label>
            </div>
            <div className="relative flex-grow flex flex-col">
              <textarea
                id="description"
                value={description}
                placeholder="Add extra details, subtasks list description, or notes..."
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className="w-full flex-grow px-4 py-3 bg-zinc-900/50 text-zinc-200 rounded-xl border border-zinc-800 focus:border-[#9040dd] focus:outline-none resize-none transition-all duration-200 disabled:opacity-50 text-sm"
              />
              {/* Description Character Counter */}
              <div className="absolute bottom-2 right-3 text-[10px] text-zinc-400 select-none font-semibold">
                <span className={description.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "text-red-400" : ""}>
                  {description.length}
                </span>
                <span className="text-zinc-500">/{MAX_DESCRIPTION_LENGTH}</span>
              </div>
            </div>
          </div>

          {/* Priority & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {/* Priority Selector */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <AlertCircle size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Priority
                </span>
              </div>
              <div className="flex rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/50 p-1">
                {["low", "medium", "high"].map((p) => {
                  const isActive = priority === p;
                  const getBtnColor = () => {
                    if (!isActive) return "text-zinc-500 hover:text-zinc-300";
                    if (p === "low") return "bg-zinc-800 text-zinc-300 border-zinc-700";
                    if (p === "medium") return "bg-amber-950/40 text-amber-400 border-amber-900/60";
                    return "bg-red-950/40 text-red-400 border-red-900/60";
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      disabled={isLoading}
                      className={`flex-1 py-1 text-xs font-bold rounded capitalize border border-transparent transition-all focus:outline-none ${getBtnColor()}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Time Picker */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar size={14} />
                <label htmlFor="dueDate" className="text-xs font-semibold uppercase tracking-wider">
                  Due Date & Time
                </label>
              </div>
              <CustomDateTimePicker
                value={dueDate}
                onChange={setDueDate}
                min={minDateTime}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Tags */}
          <TagInput value={tags} onChange={setTags} disabled={isLoading} />

          {/* Subtasks */}
          <SubtaskEditor value={subtasks} onChange={setSubtasks} disabled={isLoading} />

          {/* Recurrence */}
          <RecurrencePicker value={recurrence} onChange={setRecurrence} disabled={isLoading} />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-zinc-900">
            <button
              type="submit"
              disabled={isLoading || !taskText.trim()}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-[1.01] duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="hidden lg:inline-flex px-6 py-3 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>

      <style>{`
        .custom-datetime-picker::-webkit-calendar-picker-indicator {
          filter: invert(0.85);
          cursor: pointer;
          opacity: 0.75;
          transition: opacity 0.2s;
        }
        .custom-datetime-picker::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}</style>
    </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default TaskDetailsModal;
