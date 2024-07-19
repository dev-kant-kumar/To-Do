import React, { useState, useEffect, act } from "react";
import CreateTask from "./CreateTask";
import StarredIcon from "../assets/ic--round-star.png";
import StarredMark from "../assets/white-star.png";
import ImgForAddTasks from "../assets/add-tasks.png";
import ImgForStarredTasks from "../assets/starredTasks.png";
import ImgForTodaysCreatedTasks from "../assets/todayCreatedTasks.png";
import ImgForDelTasks from "../assets/deleteTasks.png";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setTodo, setTodoLength } from "../Store/Reducers/TodoFilterSlice";
import { toast } from "react-toastify";
import global from "../Components/Global";
import { CloseFullscreen } from "@mui/icons-material";
function Tasks() {
  const dispatch = useDispatch();
  const apiUrl = global.REACT_APP_API_BASE_URL;
  const userInfo = useSelector((state) => state.UserSlice);
  const todoData = useSelector((state) => state.TodoFilterSlice);
  const todoList = todoData.todo.toReversed();
  const lengthOfTodo = todoData.length;

  const [showCreateTask, setShowCreateTask] = useState(false);
  const activeFilter = useSelector((state) => state.ActiveDeletedFilter);

  const fetchTodo = async (userId) => {
    let filterType;
    if (activeFilter.isAllActive) filterType = "all";
    else if (activeFilter.isStarredActive) filterType = "starred";
    else if (activeFilter.isTodayActive) filterType = "today";
    else if (activeFilter.isWeekActive) filterType = "week";
    else if (activeFilter.isDeletedActive) filterType = "deleted";
    console.log(filterType);

    try {
      const response = await axios.post(apiUrl + "filters/" + filterType, {
        userId: userId,
      });
      if (response.data.status === false) {
        // toast.info(response.data.message);
        dispatch(setTodoLength(res.data.length));
      } else {
        dispatch(setTodo(response.data));
        dispatch(setTodoLength(res.data.length));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const taskHandler = () => {
    setShowCreateTask((prevShowCreateTask) => !prevShowCreateTask);
  };

  const toggleTaskComplete = async (taskID, status) => {
    const url = status
      ? apiUrl + "todo/unMarkComplete"
      : apiUrl + "todo/markComplete";

    try {
      const response = await axios.post(url, {
        taskID,
        userId: userInfo.userId,
      });

      fetchTodo(userInfo.userId);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleStarred = async (taskID, status) => {
    const url = status
      ? apiUrl + "todo/unMarkStarred"
      : apiUrl + "todo/markStarred";

    try {
      const response = await axios.post(url, {
        taskID,
        userId: userInfo.userId,
      });

      fetchTodo(userInfo.userId);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteTask = async (taskID, status) => {
    if (status === false)
      await axios
        .post(apiUrl + "todo/deleteTask", {
          taskID,
          userId: userInfo.userId,
        })
        .then((res) => {
          if (res.data.status === true) {
            toast.success(res.data.message);
            fetchTodo(userInfo.userId);
          } else {
            toast.error(res.data.message);
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "2-digit",
    };
    return date.toLocaleDateString("en-IN", options);
  };

  const deleteAllTaskInDeletedTasks = async () => {
    try {
      const response = await axios.post(apiUrl + "todo/deleteall", {
        userId: userInfo.userId,
      });
      if (response.data.status === true) {
        toast.success(response.data.message);
        fetchTodo(userInfo.userId);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while deleting tasks.");
    }
  };

  if (lengthOfTodo == 0) {
    return (
      <>
        <img
          src={
            activeFilter.isAllActive
              ? ImgForAddTasks
              : activeFilter.isStarredActive
              ? ImgForStarredTasks
              : activeFilter.isTodayActive
              ? ImgForTodaysCreatedTasks
              : activeFilter.isDeletedActive
              ? ImgForDelTasks
              : ""
          }
          id="img-to-show-in-case-of-no-tasks"
          alt="a-girls-managing-tasks"
        />
        <p id="text-to-show-in-case-of-no-tasks">Nothing is your tasks list</p>

        <div id="tasks-footer">
          <button
            id={
              activeFilter.isDeletedActive && lengthOfTodo !== 0
                ? "delete-task-btn"
                : "add-task-btn"
            }
            onClick={
              activeFilter.isDeletedActive && lengthOfTodo !== 0
                ? deleteAllTaskInDeletedTasks
                : taskHandler
            }
          >
            {activeFilter.isDeletedActive && lengthOfTodo !== 0
              ? "Delete All"
              : "New Task"}
          </button>
        </div>
        {showCreateTask && <CreateTask />}
      </>
    );
  } else if (lengthOfTodo > 0) {
    return (
      <>
        <div id="tasks-main-container">
          <ul id="tasks-list">
            {todoList?.map((task) => (
              <li key={task._id}>
                <span
                  className="completed-mark list-items"
                  onClick={() => toggleTaskComplete(task._id, task.completed)}
                >
                  <span className={task.completed ? "inner-circle" : ""}></span>
                </span>
                <span
                  className={
                    task.completed
                      ? "list-content list-items list-strike"
                      : "list-content list-items"
                  }
                >
                  {task.task}
                </span>
                <button
                  className="delete-task-btn"
                  onClick={() => deleteTask(task._id, task.deleted)}
                >
                  Delete
                </button>
                <span>{formatDate(task.date)}</span>
                <span
                  className="starred-mark list-items"
                  onClick={() => toggleStarred(task._id, task.starred)}
                >
                  <img
                    src={task.starred ? StarredMark : StarredIcon}
                    alt="starred-icon"
                    className="star-icon"
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div id="tasks-footer">
          <button
            id={
              activeFilter.isDeletedActive && lengthOfTodo !== 0
                ? "delete-task-btn"
                : "add-task-btn"
            }
            onClick={
              activeFilter.isDeletedActive && lengthOfTodo !== 0
                ? deleteAllTaskInDeletedTasks
                : taskHandler
            }
          >
            {activeFilter.isDeletedActive && lengthOfTodo > 0
              ? "Delete All"
              : "New Task"}
          </button>
        </div>
        {showCreateTask && <CreateTask />}
      </>
    );
  }
}

export default Tasks;
