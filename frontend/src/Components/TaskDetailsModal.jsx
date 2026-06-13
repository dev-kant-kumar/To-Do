import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import global from "../Components/Global";
import { RxCross2 } from "react-icons/rx";
import { Calendar, AlertCircle, Edit3, AlignLeft } from "lucide-react";

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
  const apiUrl = global.REACT_APP_API_BASE_URL;

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
        toast.success(response.data.message || "Task updated successfully");
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

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="modal-heading"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#05050a]/75 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 animate-scale-in">
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
            <input
              id="taskText"
              ref={inputRef}
              type="text"
              value={taskText}
              onChange={(e) => {
                setTaskText(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              placeholder="e.g. Finish project submission"
              className="w-full px-4 py-2.5 bg-zinc-900/50 text-zinc-200 rounded-xl border border-zinc-800 focus:border-[#9040dd] focus:outline-none transition-all duration-200 disabled:opacity-50 text-sm"
            />
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
            <textarea
              id="description"
              value={description}
              placeholder="Add extra details, subtasks list description, or notes..."
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows="3"
              className="w-full px-4 py-2.5 bg-zinc-900/50 text-zinc-200 rounded-xl border border-zinc-800 focus:border-[#9040dd] focus:outline-none resize-none transition-all duration-200 disabled:opacity-50 text-sm"
            />
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
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

export default TaskDetailsModal;
