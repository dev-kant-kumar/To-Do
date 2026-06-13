import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setTodo, setTodoLength } from "../Store/Reducers/TodoFilterSlice";
import { toast } from "react-toastify";
import { RxCross2 } from "react-icons/rx";

// Constants
const MAX_TASK_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_TASK_LENGTH = 1;

const getCurrentLocalDateTimeString = () => {
  const d = new Date();
  const pad = (num) => String(num).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function CreateTask({ onClose }) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.UserSlice);
  const activeFilter = useSelector((state) => state.ActiveDeletedFilter);

  // Local state
  const [inputValue, setInputValue] = useState("");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState(getCurrentLocalDateTimeString);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refElement = useRef();
  const inputRef = useRef();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  // Get current filter type for fetching
  const getCurrentFilterType = useCallback(() => {
    if (activeFilter?.isAllActive) return "all";
    if (activeFilter?.isStarredActive) return "starred";
    if (activeFilter?.isTodayActive) return "today";
    if (activeFilter?.isWeekActive) return "week";
    if (activeFilter?.isDeletedActive) return "deleted";
    return "all";
  }, [activeFilter]);

  // Input validation
  const validateInput = useCallback((value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "Task cannot be empty";
    }

    if (trimmedValue.length < MIN_TASK_LENGTH) {
      return "Task is too short";
    }

    if (trimmedValue.length > MAX_TASK_LENGTH) {
      return `Task cannot exceed ${MAX_TASK_LENGTH} characters`;
    }

    return "";
  }, []);

  // Handle input change with validation
  const handleInput = useCallback(
    (e) => {
      const value = e.target.value;
      setInputValue(value);

      // Clear previous error when user starts typing
      if (error) {
        setError("");
      }

      // Real-time validation for length
      if (value.length > MAX_TASK_LENGTH) {
        setError(`Task cannot exceed ${MAX_TASK_LENGTH} characters`);
      }
    },
    [error]
  );

  // Enhanced fetch todos with proper filter support
  const fetchTodos = useCallback(
    async (userId) => {
      if (!userId) {
        console.error("User ID is required for fetching todos");
        return;
      }

      try {
        const filterType = getCurrentFilterType();
        const response = await axios.post(`${apiUrl}filters/${filterType}`, {
          userId: userId,
        });

        if (response.data?.status === false) {
          // Handle case where no todos are found
          dispatch(setTodo([]));
          dispatch(setTodoLength(0));
        } else {
          dispatch(setTodo(response.data || []));
          dispatch(setTodoLength(response.data?.length || 0));
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
        toast.error("Failed to refresh tasks. Please refresh the page.");
      }
    },
    [apiUrl, dispatch, getCurrentFilterType]
  );

  // Enhanced task creation with better error handling
  const sendCreatedTask = useCallback(
    async (taskText) => {
      if (!userInfo?.userId) {
        toast.error("User authentication required");
        return false;
      }

      setIsLoading(true);
      try {
        const response = await axios.post(`${apiUrl}todo/addTask`, {
          task: taskText.trim(),
          userId: userInfo.userId,
          priority: priority,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          description: description.trim(),
        });

        if (response.data?.status) {
          await fetchTodos(userInfo.userId);
          return true;
        } else {
          toast.error(response.data?.message || "Failed to create task");
          return false;
        }
      } catch (error) {
        console.error("Error creating task:", error);

        if (error.response?.status === 401) {
          toast.error("Session expired. Please log in again.");
        } else if (error.response?.status >= 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(error.response?.data?.message || "Failed to create task");
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, userInfo?.userId, fetchTodos, priority, dueDate, description]
  );

  // Handle form submission
  const createTaskBtn = useCallback(
    async (e) => {
      e.preventDefault();

      const validationError = validateInput(inputValue);
      if (validationError) {
        setError(validationError);
        return;
      }

      const success = await sendCreatedTask(inputValue);
      if (success) {
        setInputValue("");
        setPriority("low");
        setDueDate(getCurrentLocalDateTimeString());
        setDescription("");
        setError("");
        handleClose();
      }
    },
    [inputValue, validateInput, sendCreatedTask]
  );

  // Handle cancel button
  const cancelBtn = useCallback(() => {
    if (inputValue.trim() || description.trim() || dueDate || priority !== "low") {
      // Show confirmation if user has typed something
      if (
        window.confirm(
          "Are you sure you want to cancel? Your input will be lost."
        )
      ) {
        handleClose();
      }
    } else {
      handleClose();
    }
  }, [inputValue, description, dueDate, priority]);

  // Handle close with proper cleanup
  const handleClose = useCallback(() => {
    setInputValue("");
    setPriority("low");
    setDueDate(getCurrentLocalDateTimeString());
    setDescription("");
    setError("");
    setIsLoading(false);

    if (onClose) {
      onClose();
    } else if (refElement.current) {
      refElement.current.style.display = "none";
    }
  }, [onClose]);

  // Handle form submission via Enter key
  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        createTaskBtn(e);
      }
    },
    [createTaskBtn]
  );

  // Handle backdrop click to close modal
  const handleBackdropClick = useCallback(
    (e) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  const minDateTime = getCurrentLocalDateTimeString();
  return (
    <div
      ref={refElement}
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="modal-heading"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030307]/80 backdrop-blur-[2px] p-4 animate-fade-in"
    >
      <div className="bg-[#0b0b0f] border border-zinc-800/80 rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.7)] w-full max-w-md transform transition-all duration-300 animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-900/60">
          <h3 id="modal-heading" className="text-base font-extrabold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            Create New Task
          </h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close dialog"
            type="button"
            className="p-1.5 rounded-lg bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-850 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
          >
            <RxCross2 className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
          </button>
        </div>

        <form onSubmit={createTaskBtn} className="p-6 space-y-5">
          {/* Input Section */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="task-input" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
              Task Title
            </label>
            <div className="relative flex items-center">
              <input
                id="task-input"
                ref={inputRef}
                type="text"
                value={inputValue}
                placeholder="What needs to be done?"
                onChange={handleInput}
                disabled={isLoading}
                maxLength={MAX_TASK_LENGTH}
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={error ? "true" : "false"}
                autoComplete="off"
                className="w-full pl-4 pr-16 py-2.5 bg-zinc-900/30 text-zinc-100 rounded-xl border border-zinc-800/60 focus:border-[#9040dd] focus:outline-none transition-all duration-200 disabled:opacity-50 text-sm font-medium"
              />

              {/* Character Counter */}
              <div className="absolute right-3 text-[10px] text-zinc-500 select-none font-semibold">
                <span
                  className={
                    inputValue.length > MAX_TASK_LENGTH * 0.9
                      ? "text-red-400"
                      : ""
                  }
                >
                  {inputValue.length}
                </span>
                <span className="text-zinc-600">/{MAX_TASK_LENGTH}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                id="error-message"
                role="alert"
                className="mt-2 text-xs text-red-400 bg-red-950/20 px-3.5 py-2.5 rounded-lg border border-red-900/30 animate-fade-in"
              >
                {error}
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-1.5 text-left">
            <label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
              Description / Notes
            </label>
            <div className="relative">
              <textarea
                id="description"
                value={description}
                placeholder="Add details, notes, or links..."
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows="4"
                className="w-full px-4 py-3 bg-zinc-900/30 text-zinc-200 rounded-xl border border-zinc-800/60 focus:border-[#9040dd] focus:outline-none resize-none transition-all duration-200 disabled:opacity-50 text-sm placeholder-zinc-500"
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
            {/* Priority Selection */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                Priority
              </span>
              <div className="flex rounded-xl overflow-hidden border border-zinc-800/60 bg-zinc-900/30 p-1 h-9">
                {["low", "medium", "high"].map((p) => {
                  const isActive = priority === p;
                  const getBtnColor = () => {
                    if (!isActive) return "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40";
                    if (p === "low") return "bg-zinc-800/80 text-zinc-200 border-zinc-700/50 shadow-sm";
                    if (p === "medium") return "bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-sm";
                    return "bg-red-500/10 border-red-500/20 text-red-400 shadow-sm";
                  };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      disabled={isLoading}
                      className={`flex-1 text-[10px] font-extrabold uppercase tracking-wider rounded-lg border border-transparent transition-all duration-300 focus:outline-none cursor-pointer ${getBtnColor()}`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Time Picker */}
            <div className="space-y-1.5">
              <label htmlFor="dueDate" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                Due Date & Time
              </label>
              <input
                id="dueDate"
                type="datetime-local"
                value={dueDate}
                min={minDateTime}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-1.5 bg-zinc-900/30 text-zinc-300 rounded-xl border border-zinc-800/60 focus:border-purple-500/40 focus:ring-4 focus:ring-purple-500/5 focus:outline-none text-[11px] font-semibold h-9 custom-datetime-picker transition-all duration-300 cursor-pointer"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || !!error || !inputValue.trim()}
              className="flex-grow py-3 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-950/40 border border-purple-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Task"
              )}
            </button>

            <button
              type="button"
              onClick={cancelBtn}
              disabled={isLoading}
              className="px-6 py-3 bg-zinc-900/50 border border-zinc-800/80 hover:bg-zinc-800/50 hover:border-zinc-700/80 text-zinc-400 hover:text-zinc-200 font-semibold text-sm rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

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
    </div>
  );
}

export default CreateTask;
