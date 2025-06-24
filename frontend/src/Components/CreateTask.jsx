import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setTodo, setTodoLength } from "../Store/Reducers/TodoFilterSlice";
import { toast } from "react-toastify";
import global from "../Components/Global";
import { RxCross2 } from "react-icons/rx";

// Constants
const MAX_TASK_LENGTH = 500;
const MIN_TASK_LENGTH = 1;

function CreateTask({ onClose }) {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.UserSlice);
  const activeFilter = useSelector((state) => state.ActiveDeletedFilter);

  // Local state
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const refElement = useRef();
  const inputRef = useRef();
  const apiUrl = global.REACT_APP_API_BASE_URL;

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
        });

        if (response.data?.status) {
          toast.success(response.data.message || "Task created successfully");
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
    [apiUrl, userInfo?.userId, fetchTodos]
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
        setError("");
        handleClose();
      }
    },
    [inputValue, validateInput, sendCreatedTask]
  );

  // Handle cancel button
  const cancelBtn = useCallback(() => {
    if (inputValue.trim()) {
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
  }, [inputValue]);

  // Handle close with proper cleanup
  const handleClose = useCallback(() => {
    setInputValue("");
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

  return (
    <div
      ref={refElement}
      onClick={handleBackdropClick}
      role="dialog"
      aria-labelledby="modal-heading"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-80 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className=" bg-slate-950 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-scale-in border border-zinc-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-xl font-bold text-purple-400 tracking-wide">
            Create New Task
          </h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close dialog"
            type="button"
            className="p-2 rounded-full hover:bg-[#536076] transition-colors duration-200 group disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#9040dd]"
          >
            <RxCross2 className="w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
          </button>
        </div>

        <form onSubmit={createTaskBtn} className="px-6 pb-6">
          {/* Input Section */}
          <div className="mb-6">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                placeholder="What needs to be done?"
                onChange={handleInput}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                maxLength={MAX_TASK_LENGTH}
                aria-describedby={error ? "error-message" : undefined}
                aria-invalid={error ? "true" : "false"}
                autoComplete="off"
                rows="3"
                className="w-full px-4 py-3 bg-transparent text-zinc-200 rounded-xl border-2 border-gray-700 focus:border-[#9040dd] focus:outline-none resize-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {/* Character Counter */}
              <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                <span
                  className={
                    inputValue.length > MAX_TASK_LENGTH * 0.9
                      ? "text-red-400"
                      : ""
                  }
                >
                  {inputValue.length}
                </span>
                <span className="text-gray-500">/{MAX_TASK_LENGTH}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                id="error-message"
                role="alert"
                className="mt-2 text-sm text-red-400 bg-red-900 bg-opacity-20 px-3 py-2 rounded-lg border border-red-800"
              >
                {error}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !!error || !inputValue.trim()}
              className="flex-1 py-3 px-6 bg-gradient-to-r from-purple-800 to-fuchsia-400 text-white font-semibold rounded-xl hover:from-[#8035cc] hover:to-[#ad7ae3] transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-[#9040dd] focus:ring-offset-2 focus:ring-offset-[#282c35]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                "Create Task"
              )}
            </button>

            <button
              type="button"
              onClick={cancelBtn}
              disabled={isLoading}
              className="px-6 py-3 bg-[#536076] text-gray-100 font-semibold rounded-xl hover:bg-[#4a556b] transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none focus:outline-none focus:ring-2 focus:ring-[#536076] focus:ring-offset-2 focus:ring-offset-[#282c35]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
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
            transform: scale(0.9) translateY(-10px);
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
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
}

export default CreateTask;
