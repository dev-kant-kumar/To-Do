import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CreateTask from "./CreateTask";
import TaskDetailsModal from "./TaskDetailsModal";
import ImgForAddTasks from "../assets/add-tasks.png";
import ImgForStarredTasks from "../assets/starredTasks.png";
import ImgForTodaysCreatedTasks from "../assets/todayCreatedTasks.png";
import ImgForDelTasks from "../assets/deleteTasks.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setTodo, setTodoLength, setSearchQuery } from "../Store/Reducers/TodoFilterSlice";
import { setActiveDeletedFilter } from "../Store/Reducers/ActiveDeletedFilter";
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
  Plus,
  ListTodo,
  Calendar,
  Check,
  ChevronUp,
  ChevronDown,
  GripVertical
} from "lucide-react";

// Constants
const FILTER_TYPES = {
  TODO: "todo",
  ALL: "all",
  STARRED: "starred",
  COMPLETED: "completed",
  TODAY: "today",
  WEEK: "week",
  DELETED: "deleted",
};

const IMAGE_MAP = {
  [FILTER_TYPES.TODO]: ImgForAddTasks,
  [FILTER_TYPES.ALL]: ImgForAddTasks,
  [FILTER_TYPES.STARRED]: ImgForStarredTasks,
  [FILTER_TYPES.COMPLETED]: ImgForTodaysCreatedTasks,
  [FILTER_TYPES.DELETED]: ImgForDelTasks,
};

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
    <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.05)]">
      Low
    </span>
  );
};

function Tasks() {
  const dispatch = useDispatch();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Selectors
  const userInfo = useSelector((state) => state.UserSlice);
  const todoData = useSelector((state) => state.TodoFilterSlice);
  const activeFilter = useSelector((state) => state.ActiveDeletedFilter);

  const filtersList = useMemo(() => [
    { key: "todo", label: "Todo", icon: <ListTodo size={14} /> },
    { key: "all", label: "All Tasks", icon: <ListTodo size={14} /> },
    { key: "starred", label: "Starred", icon: <Star size={14} /> },
    { key: "completed", label: "Completed", icon: <CheckCircle size={14} /> },
    { key: "deleted", label: "Deleted", icon: <Trash2 size={14} /> },
  ], []);

  // Local state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [counts, setCounts] = useState({});
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverTaskId, setDragOverTaskId] = useState(null);

  // Fetch counts when userId changes or todo list updates
  useEffect(() => {
    const fetchCounts = async () => {
      if (!userInfo.userId) return;
      try {
        const res = await axios.post(`${apiUrl}filters/counts`, { userId: userInfo.userId });
        if (res.data) {
          setCounts(res.data);
        }
      } catch (err) {
        console.error("Error fetching counts:", err);
      }
    };
    fetchCounts();
  }, [userInfo.userId, apiUrl, todoData.todo]);



  // Reset selection on filter change
  useEffect(() => {
    setSelectedTaskIds(new Set());
  }, [activeFilter]);

  // Memoized values
  const currentFilterType = useMemo(() => {
    if (activeFilter.isTodoActive) return FILTER_TYPES.TODO;
    if (activeFilter.isAllActive) return FILTER_TYPES.ALL;
    if (activeFilter.isStarredActive) return FILTER_TYPES.STARRED;
    if (activeFilter.isCompletedActive) return FILTER_TYPES.COMPLETED;
    if (activeFilter.isWeekActive) return FILTER_TYPES.WEEK;
    if (activeFilter.isDeletedActive) return FILTER_TYPES.DELETED;
    return FILTER_TYPES.TODO; // Default to Todo!
  }, [activeFilter]);

  const todoList = useMemo(() => {
    let list = todoData.todo?.toReversed() || [];
    if (currentFilterType === FILTER_TYPES.TODO) {
      list = list.filter((t) => !t.completed);
    }
    if (todoData.searchQuery) {
      const q = todoData.searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.task?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [todoData.todo, todoData.searchQuery, currentFilterType]);


  const displayedTodoList = useMemo(() => {
    return todoList;
  }, [todoList]);

  const sortedTasks = useMemo(() => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    return [...displayedTodoList].sort((a, b) => {
      // Sort by priority weight descending
      const weightA = priorityWeight[a.priority] || 0;
      const weightB = priorityWeight[b.priority] || 0;
      if (weightA !== weightB) {
        return weightB - weightA;
      }
      // Within same priority, sort by completed status (uncompleted first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      // If still equal, sort by rankIndex
      return (a.rankIndex || 0) - (b.rankIndex || 0);
    });
  }, [displayedTodoList]);

  const lengthOfTodo = useMemo(() => todoData.length || 0, [todoData.length]);
  const originalListIsEmpty = useMemo(() => (todoData.todo?.length || 0) === 0, [todoData.todo]);

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
        const filterEndpoint = currentFilterType === FILTER_TYPES.TODO ? "all" : currentFilterType;
        const response = await axios.post(
          `${apiUrl}filters/${filterEndpoint}`,
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

  // Fetch data when active filter changes
  useEffect(() => {
    if (userInfo.userId) {
      fetchTodo(userInfo.userId);
    }
  }, [currentFilterType, userInfo.userId, fetchTodo]);

  // Event handlers
  const taskHandler = useCallback(() => {
    setSelectedTask(null);
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
        case FILTER_TYPES.TODO: return "Pending Tasks";
        case FILTER_TYPES.ALL: return "All Tasks";
        case FILTER_TYPES.STARRED: return "Starred Tasks";
        case FILTER_TYPES.COMPLETED: return "Completed Tasks";
        case FILTER_TYPES.TODAY: return "Today's Checklist";
        case FILTER_TYPES.WEEK: return "This Week's Plan";
        case FILTER_TYPES.DELETED: return "Trash Bin";
        default: return "Tasks";
      }
    })();

    const descriptionText = (() => {
      switch (currentFilterType) {
        case FILTER_TYPES.TODO: return "Focus on tasks that need to be done.";
        case FILTER_TYPES.ALL: return "View and manage all your tasks and subtasks.";
        case FILTER_TYPES.STARRED: return "Keep track of items you marked as high-priority.";
        case FILTER_TYPES.COMPLETED: return "Review tasks you have successfully finished.";
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
                : "bg-purple-600 hover:bg-purple-500 text-white border border-purple-500/30 shadow-lg shadow-purple-950/50 hover:shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98] hidden lg:inline-flex"
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
      </div>
    ),
    [
      currentImage,
      isDeletedFilter,
      deleteAllTaskInDeletedTasks,
      taskHandler,
      isLoading,
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

  const handleMoveUp = useCallback(async (task) => {
    const currentIndex = sortedTasks.findIndex((t) => t._id === task._id);
    if (currentIndex <= 0) return; // Cannot move up
    
    const prevTask = sortedTasks[currentIndex - 1];
    
    try {
      if (prevTask.priority === task.priority) {
        // Swap rankIndex cleanly. If they are equal, offset them.
        const prevRank = prevTask.rankIndex || 0;
        const currentRank = task.rankIndex || 0;
        
        const newCurrentRank = prevRank === currentRank ? prevRank - 1 : prevRank;
        const newPrevRank = prevRank === currentRank ? currentRank + 1 : currentRank;
        
        await Promise.all([
          axios.post(`${apiUrl}todo/updateTask`, {
            taskID: task._id,
            rankIndex: newCurrentRank,
            userId: userInfo.userId,
          }),
          axios.post(`${apiUrl}todo/updateTask`, {
            taskID: prevTask._id,
            rankIndex: newPrevRank,
            userId: userInfo.userId,
          })
        ]);
      } else {
        // Shift priority up to prevTask's priority, and set rankIndex to be right next to prevTask
        await axios.post(`${apiUrl}todo/updateTask`, {
          taskID: task._id,
          priority: prevTask.priority,
          rankIndex: (prevTask.rankIndex || 0) + 1,
          userId: userInfo.userId,
        });
      }
      await fetchTodo(userInfo.userId);
    } catch (error) {
      console.error("Error moving task up:", error);
      toast.error("Failed to move task up");
    }
  }, [apiUrl, userInfo.userId, fetchTodo, sortedTasks]);

  const handleMoveDown = useCallback(async (task) => {
    const currentIndex = sortedTasks.findIndex((t) => t._id === task._id);
    if (currentIndex === -1 || currentIndex >= sortedTasks.length - 1) return; // Cannot move down
    
    const nextTask = sortedTasks[currentIndex + 1];
    
    try {
      if (nextTask.priority === task.priority) {
        // Swap rankIndex cleanly. If they are equal, offset them.
        const nextRank = nextTask.rankIndex || 0;
        const currentRank = task.rankIndex || 0;
        
        const newCurrentRank = nextRank === currentRank ? nextRank + 1 : nextRank;
        const newNextRank = nextRank === currentRank ? currentRank - 1 : currentRank;
        
        await Promise.all([
          axios.post(`${apiUrl}todo/updateTask`, {
            taskID: task._id,
            rankIndex: newCurrentRank,
            userId: userInfo.userId,
          }),
          axios.post(`${apiUrl}todo/updateTask`, {
            taskID: nextTask._id,
            rankIndex: newNextRank,
            userId: userInfo.userId,
          })
        ]);
      } else {
        // Shift priority down to nextTask's priority, and set rankIndex to be right next to nextTask
        await axios.post(`${apiUrl}todo/updateTask`, {
          taskID: task._id,
          priority: nextTask.priority,
          rankIndex: (nextTask.rankIndex || 0) - 1,
          userId: userInfo.userId,
        });
      }
      await fetchTodo(userInfo.userId);
    } catch (error) {
      console.error("Error moving task down:", error);
      toast.error("Failed to move task down");
    }
  }, [apiUrl, userInfo.userId, fetchTodo, sortedTasks]);

  const handleDragStart = useCallback((e, task) => {
    // Ignore if dragging started from an interactive element (e.g. checkbox, star, buttons)
    const target = e.target;
    if (
      target.closest("button") || 
      target.closest("a") || 
      target.closest("input") || 
      target.closest("select")
    ) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", task._id);
    setDraggedTaskId(task._id);
  }, []);

  const handleDragOver = useCallback((e, targetTask) => {
    e.preventDefault();
    if (draggedTaskId && draggedTaskId !== targetTask._id) {
      setDragOverTaskId(targetTask._id);
    }
  }, [draggedTaskId]);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
  }, []);

  const handleDrop = useCallback(async (e, targetTask) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    
    if (!draggedId || draggedId === targetTask._id) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const draggedTask = sortedTasks.find((t) => t._id === draggedId);
    if (!draggedTask) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const draggedIndex = sortedTasks.findIndex((t) => t._id === draggedId);
    const targetIndex = sortedTasks.findIndex((t) => t._id === targetTask._id);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedTaskId(null);
      setDragOverTaskId(null);
      return;
    }

    const newPriority = targetTask.priority;
    const isDraggingUp = draggedIndex > targetIndex;
    
    let newRank = 0;
    
    if (isDraggingUp) {
      // Placing draggedTask BEFORE targetTask
      const prevTask = sortedTasks[targetIndex - 1];
      if (prevTask && prevTask.priority === targetTask.priority) {
        if ((prevTask.rankIndex || 0) !== (targetTask.rankIndex || 0)) {
          newRank = ((prevTask.rankIndex || 0) + (targetTask.rankIndex || 0)) / 2;
        } else {
          newRank = (targetTask.rankIndex || 0) - 1;
        }
      } else {
        newRank = (targetTask.rankIndex || 0) - 10;
      }
    } else {
      // Placing draggedTask AFTER targetTask
      const nextTask = sortedTasks[targetIndex + 1];
      if (nextTask && nextTask.priority === targetTask.priority) {
        if ((nextTask.rankIndex || 0) !== (targetTask.rankIndex || 0)) {
          newRank = ((targetTask.rankIndex || 0) + (nextTask.rankIndex || 0)) / 2;
        } else {
          newRank = (targetTask.rankIndex || 0) + 1;
        }
      } else {
        newRank = (targetTask.rankIndex || 0) + 10;
      }
    }

    // Reset drag state immediately for smooth UI transition
    setDraggedTaskId(null);
    setDragOverTaskId(null);

    // Optimistically update local redux store state
    const updatedTodo = todoData.todo.map((t) => {
      if (t._id === draggedId) {
        return { ...t, priority: newPriority, rankIndex: newRank };
      }
      return t;
    });
    dispatch(setTodo(updatedTodo));

    // Save to backend
    try {
      await axios.post(`${apiUrl}todo/updateTask`, {
        taskID: draggedId,
        priority: newPriority,
        rankIndex: newRank,
        userId: userInfo.userId,
      });
      // Fetch latest from server to ensure perfect sync
      await fetchTodo(userInfo.userId);
    } catch (error) {
      console.error("Error updating task rank via drag-and-drop:", error);
      toast.error("Failed to reorder task");
      // Rollback on error
      await fetchTodo(userInfo.userId);
    }
  }, [draggedTaskId, sortedTasks, todoData.todo, dispatch, apiUrl, userInfo.userId, fetchTodo]);

  const renderTaskCard = useCallback((task) => {
    const isSelected = selectedTaskIds.has(task._id);
    const taskIndex = sortedTasks.findIndex((t) => t._id === task._id);
    const isFirst = taskIndex === 0;
    const isLast = taskIndex === sortedTasks.length - 1;
    const isDragged = task._id === draggedTaskId;
    const isDragOver = task._id === dragOverTaskId;
    const draggedIndex = sortedTasks.findIndex((t) => t._id === draggedTaskId);
    const isDraggingUp = draggedIndex !== -1 && draggedIndex > taskIndex;
    
    return (
      <motion.div
        key={task._id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.18 } }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        draggable={true}
        onDragStart={(e) => handleDragStart(e, task)}
        onDragOver={(e) => handleDragOver(e, task)}
        onDragEnd={handleDragEnd}
        onDrop={(e) => handleDrop(e, task)}
        onClick={() => {
          setSelectedTask(task);
          setShowCreateTask(false);
        }}
        className={`group relative flex flex-col gap-3.5 p-4 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
          isDragged
            ? "opacity-40 scale-[0.98] border-dashed border-purple-500/40 bg-zinc-950/20"
            : isDragOver
            ? isDraggingUp
              ? "border-t-2 border-t-purple-500/80 bg-purple-950/5 scale-[1.01] shadow-[0_0_15px_rgba(168,85,247,0.1)] border-b-zinc-900 border-l-zinc-900 border-r-zinc-900"
              : "border-b-2 border-b-purple-500/80 bg-purple-950/5 scale-[1.01] shadow-[0_0_15px_rgba(168,85,247,0.1)] border-t-zinc-900 border-l-zinc-900 border-r-zinc-900"
            : isSelected 
            ? "bg-purple-950/10 border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.04)]" 
            : "bg-zinc-900/35 border-zinc-900 hover:border-zinc-800/80 hover:bg-zinc-900/50 hover:-translate-y-0.5 shadow-lg shadow-zinc-950/30"
        }`}
      >
        {/* Card Header: Checkbox, Title, Star */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* Grab Handle */}
            <div 
              className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing p-0.5 -ml-1 mr-0.5 rounded transition-colors hidden sm:block flex-shrink-0 mt-0.5"
              title="Drag to reorder"
            >
              <GripVertical size={14} className="stroke-[2.5]" />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSelectTask(task._id);
              }}
              title={isSelected ? "Deselect task" : "Select task"}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none flex-shrink-0 mt-0.5"
            >
              {isSelected ? (
                <CheckSquare size={15} className="text-purple-500" />
              ) : (
                <span className="block w-3.5 h-3.5 border border-zinc-700 rounded hover:border-zinc-500 transition-colors"></span>
              )}
            </button>
            <span
              className={`font-semibold text-xs sm:text-sm leading-tight transition-all duration-300 ${
                task.completed ? "line-through text-zinc-500" : "text-zinc-100"
              }`}
            >
              {task.task || "Untitled Task"}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleStarred(task._id, task.starred);
            }}
            className="p-0.5 rounded hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none flex-shrink-0"
          >
            {task.starred ? (
              <Star size={15} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] animate-star-pulse" />
            ) : (
              <Star size={15} className="text-zinc-600 hover:text-zinc-400" />
            )}
          </button>
        </div>

        {/* Card Body: Description */}
        {task.description && (
          <p className={`text-[11px] leading-relaxed transition-all duration-350 -mt-1.5 ${task.completed ? "line-through text-zinc-500" : "text-zinc-400"}`}>
            {task.description}
          </p>
        )}

        {/* Card Footer: Due Date Badge & Priority Shift controls */}
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-900/60 flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {getPriorityBadge(task.priority)}
            {getDueDateBadge(task)}
          </div>

          <div className="flex items-center gap-2">
            {/* Move Up/Down Buttons */}
            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider select-none">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveUp(task);
                }}
                disabled={isFirst}
                title="Move task up"
                className="px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1"
              >
                <ChevronUp size={11} className="stroke-[3]" />
                <span>Move Up</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoveDown(task);
                }}
                disabled={isLast}
                title="Move task down"
                className="px-2 py-1 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1"
              >
                <ChevronDown size={11} className="stroke-[3]" />
                <span>Move Down</span>
              </button>
            </div>

            {/* Check Completion button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleTaskComplete(task._id, task.completed);
              }}
              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                task.completed 
                  ? "bg-emerald-500/20 border-emerald-500/35 text-emerald-400" 
                  : "border-zinc-800 text-zinc-500 hover:border-emerald-500/30 hover:text-emerald-400 hover:bg-emerald-950/10"
              }`}
            >
              <Check size={12} className="stroke-[3]" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }, [
    selectedTaskIds,
    toggleSelectTask,
    toggleStarred,
    toggleTaskComplete,
    handleMoveUp,
    handleMoveDown,
    getDueDateBadge,
    sortedTasks,
    draggedTaskId,
    dragOverTaskId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop
  ]);

  const Toolbar = useMemo(() => {
    return (
      <div className="flex items-center justify-between px-4 lg:px-6 pb-3 border-b border-zinc-800/60 gap-4 flex-shrink-0">
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
      <div className="flex-grow flex flex-col overflow-hidden text-left -mx-4 lg:-mx-6">
        {Toolbar}
        <div className="flex-grow overflow-y-auto pr-1 scrollbar-none px-4 lg:px-6">
          <div className="flex flex-col gap-3.5 pb-6 mt-3 max-w-3xl mx-auto w-full">
            <AnimatePresence mode="popLayout">
              {sortedTasks.map((task) => renderTaskCard(task))}
            </AnimatePresence>
            {sortedTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-sm text-zinc-500">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    [
      Toolbar,
      sortedTasks,
      renderTaskCard
    ]
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="flex-grow flex flex-col h-full"
    >
      {TitleHeader}

      {/* Horizontal Filter Dock */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-2 scrollbar-none flex-shrink-0 border-b border-zinc-900/60 -mx-4 lg:-mx-6 px-4 lg:px-6">
        {filtersList.map(({ key, label, icon }) => {
          const isActive = currentFilterType === key;
          const countKey = key === "todo" ? "pending" : key;
          const count = counts[`${countKey}Count`] || 0;
          return (
            <button
              key={key}
              onClick={() => {
                dispatch(
                  setActiveDeletedFilter({
                    isTodoActive: key === "todo",
                    isAllActive: key === "all",
                    isStarredActive: key === "starred",
                    isCompletedActive: key === "completed",
                    isWeekActive: key === "week",
                    isDeletedActive: key === "deleted",
                  })
                );
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer border select-none focus:outline-none flex-shrink-0 ${
                isActive
                  ? "bg-purple-600/10 border-purple-500/30 text-purple-300 shadow-md shadow-purple-950/10"
                  : "bg-zinc-900/40 border-zinc-800/40 text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
              }`}
            >
              <span className={isActive ? "text-purple-400" : "text-zinc-500"}>
                {icon}
              </span>
              <span>{label}</span>
              {count > 0 && (
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold border transition-colors ${
                  isActive 
                    ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                    : "bg-zinc-800/60 border-zinc-800/85 text-zinc-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {originalListIsEmpty ? (
        EmptyTasksView
      ) : todoList.length === 0 && hasSearchQuery ? (
        EmptySearchResultsView
      ) : todoList.length === 0 ? (
        EmptyTasksView
      ) : (
        TasksListView
      )}
      {selectedTask && (
        <TaskDetailsModal
          key={selectedTask._id}
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => fetchTodo(userInfo.userId)}
        />
      )}
      {showCreateTask && <CreateTask onClose={taskHandler} />}
      {!isDeletedFilter && (
        <button
          onClick={taskHandler}
          disabled={isLoading}
          title="Create a new task"
          className="fixed bottom-6 right-6 lg:hidden w-14 h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-purple-950/60 hover:shadow-purple-900/60 active:scale-95 transition-all duration-200 border border-purple-500/30 focus:outline-none z-40 cursor-pointer"
        >
          <Plus size={24} className="stroke-[3]" />
        </button>
      )}
    </motion.div>
  );
}

export default Tasks;

