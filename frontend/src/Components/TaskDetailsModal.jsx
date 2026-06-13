import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";
import { Calendar, AlertCircle, Edit3, AlignLeft } from "lucide-react";

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
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${apiUrl}todo/updateTask`,
        {
          taskID: task._id,
          task: taskText.trim(),
          priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          description: description.trim(),
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

  const minDateTime = getCurrentLocalDateTimeString();
  return (
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030307]/80 backdrop-blur-[2px] p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -8 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Edit3 size={18} />
            </span>
            <div>
              <h3 id="modal-heading" className="text-lg font-bold text-zinc-100">
                Task Details
              </h3>
              <p className="text-xs text-zinc-500">Edit options and schedule details.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            type="button"
            className="p-2 rounded-lg hover:bg-zinc-900 transition-colors duration-200 group text-zinc-400 hover:text-zinc-200 focus:outline-none"
          >
            <RxCross2 className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-5">
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
          <div className="space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <AlignLeft size={14} />
              <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider">
                Description & Notes
              </label>
            </div>
            <div className="relative">
              <textarea
                id="description"
                value={description}
                placeholder="Add extra details, subtasks list description, or notes..."
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows="4"
                className="w-full px-4 py-3 bg-zinc-900/50 text-zinc-200 rounded-xl border border-zinc-800 focus:border-[#9040dd] focus:outline-none resize-none transition-all duration-200 disabled:opacity-50 text-sm"
              />
              {/* Description Character Counter */}
              <div className="absolute bottom-2 right-3 text-[10px] text-zinc-550 select-none font-semibold">
                <span className={description.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "text-red-400" : ""}>
                  {description.length}
                </span>
                <span className="text-zinc-650">/{MAX_DESCRIPTION_LENGTH}</span>
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
              <input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                min={minDateTime}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-1 bg-zinc-900/50 text-zinc-300 rounded-lg border border-zinc-800 focus:border-[#9040dd] focus:outline-none text-xs h-[30px] custom-datetime-picker"
              />
            </div>
          </div>

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
              className="px-6 py-3 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </AnimatePresence>
  );
}

export default TaskDetailsModal;
