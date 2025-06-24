import { useState, useCallback, useMemo, useEffect } from "react";
import CreateTask from "./CreateTask";
import ImgForAddTasks from "../assets/add-tasks.png";
import ImgForStarredTasks from "../assets/starredTasks.png";
import ImgForTodaysCreatedTasks from "../assets/todayCreatedTasks.png";
import ImgForDelTasks from "../assets/deleteTasks.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setTodo, setTodoLength } from "../Store/Reducers/TodoFilterSlice";
import { toast } from "react-toastify";
import global from "../Components/Global";

import { IoMdStarOutline } from "react-icons/io";
import { MdOutlineStar } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";
import { SiGoogletasks } from "react-icons/si";

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
  const apiUrl = global.REACT_APP_API_BASE_URL;

  // Selectors
  const userInfo = useSelector((state) => state.UserSlice);
  const todoData = useSelector((state) => state.TodoFilterSlice);
  const activeFilter = useSelector((state) => state.ActiveDeletedFilter);

  // Local state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Memoized values
  const todoList = useMemo(
    () => todoData.todo?.toReversed() || [],
    [todoData.todo]
  );
  const lengthOfTodo = useMemo(() => todoData.length || 0, [todoData.length]);

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
          dispatch(setTodoLength(response.data?.length || 0));
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
          toast.success(response.data.message || "Task deleted successfully");
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
        toast.success(
          response.data.message || "All tasks deleted successfully"
        );
        await fetchTodo(userInfo.userId);
      } else {
        toast.error(response.data?.message || "Failed to delete all tasks");
      }
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      toast.error("An error occurred while deleting tasks.");
    }
  }, [apiUrl, userInfo.userId, fetchTodo]);

  // Utility functions
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const options = {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "2-digit",
      };
      return date.toLocaleDateString("en-IN", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  }, []);

  // Components
  const EmptyTasksView = useMemo(
    () => (
      <>
        <img
          src={currentImage}
          id="img-to-show-in-case-of-no-tasks"
          alt="managing tasks illustration"
        />
        <p id="text-to-show-in-case-of-no-tasks">Nothing in your tasks list</p>
        <div id="tasks-footer">
          <button
            id={isDeletedFilter ? "delete-task-btn" : "add-task-btn"}
            onClick={
              isDeletedFilter ? deleteAllTaskInDeletedTasks : taskHandler
            }
            disabled={isLoading}
          >
            {isDeletedFilter ? "Delete All" : "New Task"}
          </button>
        </div>
        {showCreateTask && <CreateTask />}
      </>
    ),
    [
      currentImage,
      isDeletedFilter,
      deleteAllTaskInDeletedTasks,
      taskHandler,
      isLoading,
      showCreateTask,
    ]
  );

  const TaskItem = useCallback(
    ({ task }) => (
      <li key={task._id} className="">
        <span
          className="starred-mark list-items"
          onClick={() => toggleStarred(task._id, task.starred)}
          role="button"
          tabIndex={0}
          aria-label={task.starred ? "Unstar task" : "Star task"}
        >
          {task.starred ? (
            <MdOutlineStar size={25} />
          ) : (
            <IoMdStarOutline size={25} />
          )}
        </span>

        <span
          className={`list-content list-items ${
            task.completed ? "list-strike" : ""
          }`}
        >
          {task.task || "Untitled Task"}
        </span>

        <span className="list-item-date">{formatDate(task.date)}</span>

        <div className="list-item-actions">
          <span
            className="list-item-action-mark-task-complete"
            onClick={() => toggleTaskComplete(task._id, task.completed)}
            role="button"
            tabIndex={0}
            aria-label={
              task.completed ? "Mark as incomplete" : "Mark as complete"
            }
          >
            <SiGoogletasks size={25} />
          </span>
          <span
            className="list-item-action-delete-task"
            onClick={() => deleteTask(task._id, task.deleted)}
            role="button"
            tabIndex={0}
            aria-label="Delete task"
          >
            <AiFillDelete size={25} />
          </span>
        </div>
      </li>
    ),
    [toggleStarred, toggleTaskComplete, deleteTask, formatDate]
  );

  const TasksListView = useMemo(
    () => (
      <>
        <div id="tasks-main-container">
          <ul id="tasks-list">
            {todoList.map((task) => (
              <TaskItem key={task._id} task={task} />
            ))}
          </ul>
        </div>
        <div id="tasks-footer">
          <button
            id={
              isDeletedFilter && lengthOfTodo > 0
                ? "delete-task-btn"
                : "add-task-btn"
            }
            onClick={
              isDeletedFilter && lengthOfTodo > 0
                ? deleteAllTaskInDeletedTasks
                : taskHandler
            }
            disabled={isLoading}
          >
            {isDeletedFilter && lengthOfTodo > 0 ? "Delete All" : "New Task"}
          </button>
        </div>
        {showCreateTask && <CreateTask />}
      </>
    ),
    [
      todoList,
      TaskItem,
      isDeletedFilter,
      lengthOfTodo,
      deleteAllTaskInDeletedTasks,
      taskHandler,
      isLoading,
      showCreateTask,
    ]
  );

  // Loading state
  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  // Render based on todo length
  return lengthOfTodo === 0 ? EmptyTasksView : TasksListView;
}

export default Tasks;
