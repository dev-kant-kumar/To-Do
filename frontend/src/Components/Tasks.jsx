import { useState, useCallback, useMemo, useEffect } from "react";
import CreateTask from "./CreateTask";
import TaskDetailsModal from "./TaskDetailsModal";
import ImgForAddTasks from "../assets/add-tasks.png";
import ImgForStarredTasks from "../assets/starredTasks.png";
import ImgForTodaysCreatedTasks from "../assets/todayCreatedTasks.png";
import ImgForDelTasks from "../assets/deleteTasks.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setTodo, setTodoLength, setSearchQuery } from "../Store/Reducers/TodoFilterSlice";
import { toast } from "react-toastify";
import { 
  Trash2, 
  CheckSquare, 
  Star, 
  RefreshCw, 
  CheckCircle,
  Clock,
  Circle,
  CheckCircle2,
  Plus
} from "lucide-react";

// Constants
const FILTER_TYPES = {
  ALL: "all",
  STARRED: "starred",
  TODAY: "today",
  WEEK: "week",
  DELETED: "deleted",
};

const IMAGE_MAP = {
  [FILTER_TYPES.ALL]: ImgForAddTasks,
  [FILTER_TYPES.STARRED]: ImgForStarredTasks,
  [FILTER_TYPES.TODAY]: ImgForTodaysCreatedTasks,
  [FILTER_TYPES.DELETED]: ImgForDelTasks,
};

function Tasks() {
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Selectors
  const userInfo = useSelector((state) => state.UserSlice);
  const todoData = useSelector((state) => state.TodoFilterSlice);
  const activeFilter = useSelector((state) => state.ActiveDeletedFilter);

  // Local state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState("todo"); // "todo" | "completed"

  // Reset selection on filter change
  useEffect(() => {
    setSelectedTaskIds(new Set());
    setActiveTab("todo");
  }, [activeFilter]);

  // Memoized values
  const todoList = useMemo(() => {
    let list = todoData.todo?.toReversed() || [];
    if (todoData.searchQuery) {
      const q = todoData.searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.task?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [todoData.todo, todoData.searchQuery]);

  const todoTasksCount = useMemo(() => {
    return todoList.filter((t) => !t.completed).length;
  }, [todoList]);

  const completedTasksCount = useMemo(() => {
    return todoList.filter((t) => t.completed).length;
  }, [todoList]);

  const displayedTodoList = useMemo(() => {
    if (activeTab === "todo") {
      return todoList.filter((t) => !t.completed);
    } else {
      return todoList.filter((t) => t.completed);
    }
  }, [todoList, activeTab]);

  const lengthOfTodo = useMemo(() => todoData.length || 0, [todoData.length]);
  const originalListIsEmpty = useMemo(() => (todoData.todo?.length || 0) === 0, [todoData.todo]);

  const currentFilterType = useMemo(() => {
    if (activeFilter.isAllActive) return FILTER_TYPES.ALL;
    if (activeFilter.isStarredActive) return FILTER_TYPES.STARRED;
    if (activeFilter.isTodayActive) return FILTER_TYPES.TODAY;
    if (activeFilter.isWeekActive) return FILTER_TYPES.WEEK;
    if (activeFilter.isDeletedActive) return FILTER_TYPES.DELETED;
    return FILTER_TYPES.ALL;
  }, [activeFilter]);

  const currentImage = useMemo(
    () => IMAGE_MAP[currentFilterType] || "",
    [currentFilterType]
  );
  const isDeletedFilter = useMemo(
    () => activeFilter.isDeletedActive,
    [activeFilter.isDeletedActive]
  );

  // API calls with error handling
  const fetchTodo = useCallback(
    async (userId) => {
      if (!userId) {
        console.error("User ID is required for fetching todos");
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.post(
          `${apiUrl}filters/${currentFilterType}`,
          {
            userId: userId,
          }
        );

        if (response.data?.status === false) {
          dispatch(setTodo([]));
          dispatch(setTodoLength(0));
        } else {
          dispatch(setTodo(response.data || []));
          dispatch(setTodoLength(response.data?.length || 0));
        }
      } catch (error) {
        console.error("Error fetching todos:", error);
        toast.error("Failed to fetch tasks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, currentFilterType, dispatch]
  );

  // Event handlers
  const taskHandler = useCallback(() => {
    setShowCreateTask((prev) => !prev);
  }, []);

  const toggleTaskComplete = useCallback(
    async (taskID, status) => {
      if (!taskID || !userInfo.userId) return;

      const endpoint = status ? "todo/unMarkComplete" : "todo/markComplete";

      try {
        await axios.post(`${apiUrl}${endpoint}`, {
          taskID,
          userId: userInfo.userId,
        });

        await fetchTodo(userInfo.userId);
      } catch (error) {
        console.error("Error toggling task completion:", error);
        toast.error("Failed to update task status. Please try again.");
      }
    },
    [apiUrl, userInfo.userId, fetchTodo]
  );

  const toggleStarred = useCallback(
    async (taskID, status) => {
      if (!taskID || !userInfo.userId) return;

      const endpoint = status ? "todo/unMarkStarred" : "todo/markStarred";

      try {
        await axios.post(`${apiUrl}${endpoint}`, {
          taskID,
          userId: userInfo.userId,
        });

        await fetchTodo(userInfo.userId);
      } catch (error) {
        console.error("Error toggling starred status:", error);
        toast.error("Failed to update starred status. Please try again.");
      }
    },
    [apiUrl, userInfo.userId, fetchTodo]
  );

  const deleteTask = useCallback(
    async (taskID, isDeleted) => {
      if (!taskID || !userInfo.userId || isDeleted) return;

      try {
        const response = await axios.post(`${apiUrl}todo/deleteTask`, {
          taskID,
          userId: userInfo.userId,
        });

        if (response.data?.status === true) {
          await fetchTodo(userInfo.userId);
        } else {
          toast.error(response.data?.message || "Failed to delete task");
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        toast.error("Failed to delete task. Please try again.");
      }
    },
    [apiUrl, userInfo.userId, fetchTodo]
  );

  const deleteAllTaskInDeletedTasks = useCallback(async () => {
    if (!userInfo.userId) return;

    try {
      const response = await axios.post(`${apiUrl}todo/deleteall`, {
        userId: userInfo.userId,
      });

      if (response.data?.status === true) {
        await fetchTodo(userInfo.userId);
      } else {
        toast.error(response.data?.message || "Failed to delete all tasks");
      }
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      toast.error("An error occurred while deleting tasks.");
    }
  }, [apiUrl, userInfo.userId, fetchTodo]);

  // Bulk action handlers
  const handleBulkDelete = useCallback(async () => {
    if (selectedTaskIds.size === 0 || !userInfo.userId) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTaskIds.size} selected tasks?`)) return;

    setIsLoading(true);
    try {
      await Promise.all(
        Array.from(selectedTaskIds).map((id) =>
          axios.post(`${apiUrl}todo/deleteTask`, {
            taskID: id,
            userId: userInfo.userId,
          })
        )
      );
      setSelectedTaskIds(new Set());
      await fetchTodo(userInfo.userId);
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast.error("Failed to delete selected tasks");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTaskIds, userInfo.userId, fetchTodo, apiUrl]);

  const handleBulkComplete = useCallback(async (complete = true) => {
    if (selectedTaskIds.size === 0 || !userInfo.userId) return;

    setIsLoading(true);
    const endpoint = complete ? "todo/markComplete" : "todo/unMarkComplete";
    try {
      await Promise.all(
        Array.from(selectedTaskIds).map((id) =>
          axios.post(`${apiUrl}${endpoint}`, {
            taskID: id,
            userId: userInfo.userId,
          })
        )
      );
      setSelectedTaskIds(new Set());
      await fetchTodo(userInfo.userId);
    } catch (error) {
      console.error("Error updating tasks:", error);
      toast.error("Failed to update selected tasks status");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTaskIds, userInfo.userId, fetchTodo, apiUrl]);

  const handleBulkStar = useCallback(async (star = true) => {
    if (selectedTaskIds.size === 0 || !userInfo.userId) return;

    setIsLoading(true);
    const endpoint = star ? "todo/markStarred" : "todo/unMarkStarred";
    try {
      await Promise.all(
        Array.from(selectedTaskIds).map((id) =>
          axios.post(`${apiUrl}${endpoint}`, {
            taskID: id,
            userId: userInfo.userId,
          })
        )
      );
      setSelectedTaskIds(new Set());
      await fetchTodo(userInfo.userId);
    } catch (error) {
      console.error("Error starring tasks:", error);
      toast.error("Failed to update selected tasks star status");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTaskIds, userInfo.userId, fetchTodo, apiUrl]);

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const options = {
        day: "2-digit",
        month: "short",
      };
      return date.toLocaleDateString("en-IN", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }, []);

  // Multi-selection management
  const toggleSelectTask = useCallback((taskId) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedTaskIds((prev) => {
      const filteredIds = todoList.map((t) => t._id);
      const allSelected = filteredIds.length > 0 && filteredIds.every((id) => prev.has(id));
      if (allSelected) {
        return new Set();
      } else {
        return new Set(filteredIds);
      }
    });
  }, [todoList]);

  const allSelected = useMemo(() => {
    return todoList.length > 0 && todoList.every((t) => selectedTaskIds.has(t._id));
  }, [todoList, selectedTaskIds]);

  const someSelected = useMemo(() => {
    return todoList.length > 0 && todoList.some((t) => selectedTaskIds.has(t._id)) && !allSelected;
  }, [todoList, selectedTaskIds, allSelected]);

  // Components
  const TitleHeader = useMemo(() => {
    const titleText = (() => {
      switch (currentFilterType) {
        case FILTER_TYPES.ALL: return "All Tasks";
        case FILTER_TYPES.STARRED: return "Starred Tasks";
        case FILTER_TYPES.TODAY: return "Today's Checklist";
        case FILTER_TYPES.WEEK: return "This Week's Plan";
        case FILTER_TYPES.DELETED: return "Trash Bin";
        default: return "Tasks";
      }
    })();

    const descriptionText = (() => {
      switch (currentFilterType) {
        case FILTER_TYPES.ALL: return "View and manage all your tasks and subtasks.";
        case FILTER_TYPES.STARRED: return "Keep track of items you marked as high-priority.";
        case FILTER_TYPES.TODAY: return "Focus on tasks that are scheduled for completion today.";
        case FILTER_TYPES.WEEK: return "Upcoming tasks scheduled to be completed this week.";
        case FILTER_TYPES.DELETED: return "Review tasks you have deleted. Clean up trash here.";
        default: return "Organize your checklist and tasks.";
      }
    })();

    return (
      <div className="mb-5 flex justify-between items-center px-1 flex-shrink-0">
        <div className="text-left">
          <h1 className="text-xl font-extrabold text-zinc-100 tracking-tight">
            {titleText}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {descriptionText}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={
              isDeletedFilter && lengthOfTodo > 0
                ? deleteAllTaskInDeletedTasks
                : taskHandler
            }
            disabled={isLoading}
            title={isDeletedFilter && lengthOfTodo > 0 ? "Delete all tasks in Trash Bin" : "Create a new task"}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 flex-shrink-0 flex items-center gap-1.5 ${
              isDeletedFilter && lengthOfTodo > 0
                ? "bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/30"
                : "bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/30 shadow-lg shadow-purple-950/50 hover:shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {isDeletedFilter && lengthOfTodo > 0 ? (
              <>
                <Trash2 size={13} />
                <span>Delete All</span>
              </>
            ) : (
              <>
                <Plus size={13} className="stroke-[3]" />
                <span>New Task</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }, [
    currentFilterType,
    todoList,
    isDeletedFilter,
    lengthOfTodo,
    deleteAllTaskInDeletedTasks,
    taskHandler,
    isLoading,
  ]);

  const EmptyTasksView = useMemo(
    () => (
      <div className="flex-grow flex flex-col items-center justify-center py-8 px-4 text-center h-full">
        <div className="relative mb-6">
          <img
            src={currentImage}
            alt="managing tasks illustration"
            className="w-48 md:w-56 h-auto opacity-75 filter drop-shadow-[0_12px_36px_rgba(147,51,234,0.15)] mx-auto"
          />
        </div>
        <h3 className="text-zinc-300 font-semibold text-lg mb-2">
          {currentFilterType === "deleted" ? "No Deleted Tasks" : "Your checklist is clear"}
        </h3>
        <p className="text-zinc-500 text-sm max-w-xs mb-8">
          {currentFilterType === "deleted"
            ? "Tasks you delete will appear here. They won't clutter your main views."
            : "No pending items found. Create a new task to organize your upcoming schedule."}
        </p>
        <button
          onClick={
            isDeletedFilter ? deleteAllTaskInDeletedTasks : taskHandler
          }
          disabled={isLoading || (isDeletedFilter && originalListIsEmpty)}
          className={`py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:active:scale-100 shadow-lg ${
            isDeletedFilter
              ? "bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-900/30 shadow-red-950/20"
              : "bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/30 shadow-lg shadow-purple-950/50 hover:shadow-purple-900/50"
          }`}
        >
          {isDeletedFilter ? "Delete All Forever" : "Create a Task"}
        </button>
        {showCreateTask && <CreateTask onClose={taskHandler} />}
      </div>
    ),
    [
      currentImage,
      isDeletedFilter,
      deleteAllTaskInDeletedTasks,
      taskHandler,
      isLoading,
      showCreateTask,
      currentFilterType,
      originalListIsEmpty,
    ]
  );

  const EmptySearchResultsView = useMemo(
    () => (
      <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 text-center h-full">
        <p className="text-zinc-400 font-medium text-base mb-2">
          No tasks match your search query: "{todoData.searchQuery}"
        </p>
        <button
          onClick={() => dispatch(setSearchQuery(""))}
          className="text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
        >
          Clear search query
        </button>
      </div>
    ),
    [todoData.searchQuery, dispatch]
  );

  const EmptyTabTasksView = useMemo(
    () => {
      if (activeTab === "todo") {
        return (
          <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 text-center h-full animate-fade-in">
            <CheckCircle2 size={40} className="text-zinc-600 mb-4" />
            <h3 className="text-zinc-300 font-semibold text-base mb-1">
              All Caught Up!
            </h3>
            <p className="text-zinc-500 text-xs max-w-xs">
              No active tasks to display. Create a new task or enjoy your day!
            </p>
          </div>
        );
      } else {
        return (
          <div className="flex-grow flex flex-col items-center justify-center py-16 px-4 text-center h-full animate-fade-in">
            <Clock size={40} className="text-zinc-600 mb-4" />
            <h3 className="text-zinc-300 font-semibold text-base mb-1">
              No Completed Tasks
            </h3>
            <p className="text-zinc-500 text-xs max-w-xs">
              Completed tasks will be archived here. Tick off some items to get started!
            </p>
          </div>
        );
      }
    },
    [activeTab]
  );

  const getPriorityBadge = (p) => {
    if (p === "high") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
          High
        </span>
      );
    }
    if (p === "medium") {
      return (
        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
          Medium
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-zinc-900/60 text-zinc-500 border border-zinc-800/80">
        Low
      </span>
    );
  };

  const getDueDateBadge = (task) => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const isOverdue = date < new Date() && !task.completed;

    const dateStr = date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isOverdue) {
      return (
        <span className="flex items-center gap-1 text-[10px] font-semibold text-red-400 bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/30">
          <Clock size={10} className="text-red-500 animate-pulse" />
          Overdue: {dateStr}
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400 bg-zinc-900/40 px-1.5 py-0.5 rounded border border-zinc-800">
        Due: {dateStr}
      </span>
    );
  };

  const TaskItem = useCallback(
    ({ task }) => {
      const isSelected = selectedTaskIds.has(task._id);
      return (
        <li 
          key={task._id} 
          className={`flex items-center justify-between gap-3 py-3 px-6 transition-all duration-300 group relative border-l-2 animate-fade-slide-up ${
            isSelected 
              ? "bg-purple-950/10 border-l-purple-500" 
              : "bg-transparent border-l-transparent hover:bg-zinc-900/10 hover:border-l-zinc-705"
          }`}
        >
          {/* Left Checkbox, Star & Priority */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Custom Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSelectTask(task._id);
              }}
              title={isSelected ? "Deselect task" : "Select task"}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-350 transition-colors focus:outline-none"
            >
              {isSelected ? (
                <CheckSquare size={16} className="text-purple-500" />
              ) : (
                <span className="block w-4 h-4 border border-zinc-700 rounded hover:border-zinc-500 transition-colors"></span>
              )}
            </button>

            {/* Star button */}
            <span
              className="cursor-pointer p-0.5 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleStarred(task._id, task.starred);
              }}
              title={task.starred ? "Unstar task" : "Star task"}
              role="button"
              tabIndex={0}
              aria-label={task.starred ? "Unstar task" : "Star task"}
            >
              {task.starred ? (
                <Star size={18} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] animate-star-pulse" />
              ) : (
                <Star size={18} className="text-zinc-500 hover:text-zinc-400 transition-colors duration-250 active:scale-75" />
              )}
            </span>

            {/* Priority */}
            <div className="flex-shrink-0">
              {getPriorityBadge(task.priority)}
            </div>
          </div>

          {/* Title & Description snippet (Gmail-like) */}
          <div
            className="flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0 cursor-pointer select-none"
            onClick={() => setSelectedTask(task)}
          >
            <div className="flex items-baseline gap-2 min-w-0 flex-grow text-left">
              <span
                className={`font-semibold text-sm truncate flex-shrink-0 max-w-[150px] sm:max-w-[250px] transition-all duration-300 strike-through-animate ${
                  task.completed ? "completed text-zinc-500" : "text-zinc-100"
                }`}
              >
                {task.task || "Untitled Task"}
              </span>
              {task.description && (
                <span className={`text-xs text-zinc-500 truncate flex-grow transition-all duration-300 ${task.completed ? "line-through text-zinc-600" : ""}`}>
                  &mdash; {task.description}
                </span>
              )}
            </div>
            
            {/* Due date Badge */}
            <div className="flex items-center gap-1.5 flex-shrink-0 text-left">
              {getDueDateBadge(task)}
            </div>
          </div>

          {/* Right Date / Actions Container */}
          <div className="w-20 sm:w-24 flex-shrink-0 flex items-center justify-end text-right h-8">
            <span className="text-xs text-zinc-500 font-medium block group-hover:hidden transition-all duration-150">
              {formatDate(task.date)}
            </span>

            <div className="hidden group-hover:flex items-center gap-1 transition-all duration-150">
              <span
                className="cursor-pointer text-zinc-500 hover:text-purple-400 transition-colors duration-150 p-1 rounded hover:bg-zinc-800/40 animate-fade-in"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskComplete(task._id, task.completed);
                }}
                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
                role="button"
                tabIndex={0}
                aria-label={
                  task.completed ? "Mark as incomplete" : "Mark as complete"
                }
              >
                {task.completed ? (
                  <CheckCircle2 size={15} className="text-purple-400 fill-purple-500/20" />
                ) : (
                  <Circle size={15} className="text-zinc-500 hover:text-purple-400" />
                )}
              </span>
              <span
                className="cursor-pointer text-zinc-500 hover:text-red-400 transition-colors duration-150 p-1 rounded hover:bg-zinc-800/40"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(task._id, task.deleted);
                }}
                title="Delete task"
                role="button"
                tabIndex={0}
                aria-label="Delete task"
              >
                <Trash2 size={15} />
              </span>
            </div>
          </div>
        </li>
      );
    },
    [toggleStarred, toggleTaskComplete, deleteTask, formatDate, setSelectedTask, selectedTaskIds, toggleSelectTask]
  );

  const Toolbar = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-6 pb-3 border-b border-zinc-800/60 gap-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Select Checkbox */}
          <button
            onClick={handleSelectAll}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
            title={allSelected ? "Deselect All" : "Select All"}
          >
            {allSelected ? (
              <CheckSquare size={18} className="text-purple-500" />
            ) : someSelected ? (
              <span className="relative flex items-center justify-center w-[18px] h-[18px] border border-purple-500/50 rounded bg-purple-500/10">
                <span className="w-2.5 h-[2px] bg-purple-500"></span>
              </span>
            ) : (
              <span className="block w-[18px] h-[18px] border border-zinc-700 rounded hover:border-zinc-500 transition-colors"></span>
            )}
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => fetchTodo(userInfo.userId)}
            disabled={isLoading}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={14} className={`${isLoading ? "animate-spin" : ""}`} />
          </button>

          {/* Bulk Actions (visible only if items selected) */}
          {selectedTaskIds.size > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
              <button
                onClick={() => handleBulkComplete(!todoList.find(t => selectedTaskIds.has(t._id))?.completed)}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-purple-400 transition-colors focus:outline-none"
                title="Toggle Completion"
              >
                <CheckCircle size={15} />
              </button>
              <button
                onClick={() => handleBulkStar(!todoList.find(t => selectedTaskIds.has(t._id))?.starred)}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 transition-colors focus:outline-none"
                title="Toggle Starred"
              >
                <Star size={15} />
              </button>
              <button
                onClick={handleBulkDelete}
                className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-red-400 transition-colors focus:outline-none"
                title="Delete Selected"
              >
                <Trash2 size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Counter Info */}
        <span className="text-xs text-zinc-500 font-medium">
          {selectedTaskIds.size > 0
            ? `${selectedTaskIds.size} selected`
            : `${todoList.length} task${todoList.length === 1 ? "" : "s"}`}
        </span>
      </div>
    );
  }, [
    allSelected,
    someSelected,
    selectedTaskIds,
    todoList,
    handleSelectAll,
    fetchTodo,
    userInfo.userId,
    isLoading,
    handleBulkComplete,
    handleBulkStar,
    handleBulkDelete,
  ]);

  const TasksListView = useMemo(
    () => (
      <div className="flex-grow flex flex-col overflow-hidden text-left -mx-6">
        {Toolbar}
        <div className="flex-grow overflow-y-auto pr-1 scrollbar-none">
          <ul className="divide-y divide-zinc-900/60">
            {displayedTodoList.map((task) => (
              <TaskItem key={task._id} task={task} />
            ))}
          </ul>
        </div>
      </div>
    ),
    [displayedTodoList, TaskItem, Toolbar]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center py-20 gap-4 h-full">
        <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-sm text-zinc-400 font-medium animate-pulse">Loading tasks...</p>
      </div>
    );
  }

  // Render based on search query and list length
  const hasSearchQuery = !!todoData.searchQuery;

  return (
    <div className="flex-grow flex flex-col h-full animate-fade-in">
      {TitleHeader}
      {originalListIsEmpty ? (
        EmptyTasksView
      ) : todoList.length === 0 && hasSearchQuery ? (
        EmptySearchResultsView
      ) : (
        <>
          {/* Tabs Bar */}
          <div className="flex items-center border-b border-zinc-800/60 pb-3 mb-4 flex-shrink-0 px-6 -mx-6">
            <button
              onClick={() => {
                setActiveTab("todo");
                setSelectedTaskIds(new Set());
              }}
              className={`flex-1 flex items-center justify-center text-sm font-semibold transition-all duration-150 cursor-pointer focus:outline-none pb-2 -mb-[13px] border-b-2 ${
                activeTab === "todo"
                  ? "text-purple-400 border-purple-500"
                  : "text-zinc-400 border-transparent hover:text-zinc-200"
              }`}
            >
              To-Do
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                activeTab === "todo"
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
              }`}>
                {todoTasksCount}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("completed");
                setSelectedTaskIds(new Set());
              }}
              className={`flex-1 flex items-center justify-center text-sm font-semibold transition-all duration-150 cursor-pointer focus:outline-none pb-2 -mb-[13px] border-b-2 ${
                activeTab === "completed"
                  ? "text-purple-400 border-purple-500"
                  : "text-zinc-400 border-transparent hover:text-zinc-200"
              }`}
            >
              Completed
              <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                activeTab === "completed"
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
              }`}>
                {completedTasksCount}
              </span>
            </button>
          </div>

          {displayedTodoList.length === 0 ? (
            EmptyTabTasksView
          ) : (
            TasksListView
          )}
        </>
      )}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => fetchTodo(userInfo.userId)}
        />
      )}
      {showCreateTask && <CreateTask onClose={taskHandler} />}
    </div>
  );
}

export default Tasks;

