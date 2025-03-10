import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setTodo, setTodoLength } from "../Store/Reducers/TodoFilterSlice";
import { setActiveDeletedFilter } from "../Store/Reducers/ActiveDeletedFilter";
import { useSelector } from "react-redux";
import global from "../Components/Global";

import { LuListTodo } from "react-icons/lu";
import { TiStarFullOutline } from "react-icons/ti";
import { IoTodaySharp } from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";

function Filters(props) {
  const userInfo = useSelector((state) => state.UserSlice);

  const dispatch = useDispatch();
  const apiUrl = global.REACT_APP_API_BASE_URL;

  const [isActive, setIsActive] = useState({
    isAllActive: true,
    isStarredActive: false,
    isTodayActive: false,
    isWeekActive: false,
    isDeletedActive: false,
  });

  useEffect(() => {
    dispatch(setActiveDeletedFilter(isActive));
  }, [isActive]);

  const [count, setCount] = useState({
    allCount: "",
    starredCount: "",
    todayCount: "",
    weekCount: "",
    deletedCount: "",
  });
  const closeHandler = () => {
    props.setShow(false);
  };

  const toggleFilter = (filter) => {
    setIsActive((prevState) => ({
      isAllActive: filter === "all" ? !prevState.isAllActive : false,
      isStarredActive:
        filter === "starred" ? !prevState.isStarredActive : false,
      isTodayActive: filter === "today" ? !prevState.isTodayActive : false,
      isWeekActive: filter === "week" ? !prevState.isWeekActive : false,
      isDeletedActive:
        filter === "deleted" ? !prevState.isDeletedActive : false,
    }));
  };

  useEffect(() => {
    getTodoData();
  }, [isActive]);

  const getTodoData = () => {
    let filterType;
    if (isActive.isAllActive) filterType = "all";
    else if (isActive.isStarredActive) filterType = "starred";
    else if (isActive.isTodayActive) filterType = "today";
    else if (isActive.isWeekActive) filterType = "week";
    else if (isActive.isDeletedActive) filterType = "deleted";

    if (filterType) {
      if (userInfo.userId != "") {
        const url = apiUrl + "filters/" + filterType;

        axios
          .post(url, {
            userId: userInfo.userId,
          })
          .then((res) => {
            if (res.data.status === false) {
              // toast.info(res.data.message);

              dispatch(setTodoLength(res.data.length));
            } else {
              dispatch(setTodo(res.data));
              dispatch(setTodoLength(res.data.length));
              setCount((prevCount) => ({
                ...prevCount,
                [`${filterType}Count`]: res.data.length,
              }));
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  };

  return (
    <div>
      <div className="filter-top">
        <h2 id="filters-heading">Filters</h2>
        <div className="close">
          <i onClick={closeHandler} className="ri-close-fill"></i>
        </div>
      </div>
      <ul id="filters-list">
        <li
          className={isActive.isAllActive ? "li-active" : ""}
          onClick={() => toggleFilter("all")}
        >
          <span>
            <LuListTodo className="icon" />
          </span>
          <span className="fl-text">All</span>
          <span className="count-badge">{count.allCount}</span>
        </li>

        <li
          className={isActive.isStarredActive ? "li-active" : ""}
          onClick={() => toggleFilter("starred")}
        >
          <span>
            <TiStarFullOutline className="icon" />
          </span>
          <span className="fl-text">Starred</span>
          <span className="count-badge">{count.starredCount}</span>
        </li>

        <li
          className={isActive.isTodayActive ? "li-active" : ""}
          onClick={() => toggleFilter("today")}
        >
          <span>
            <IoTodaySharp className="icon" />
          </span>
          <span className="fl-text">Today</span>
          <span className="count-badge">{count.todayCount}</span>
        </li>
        <li
          className={isActive.isDeletedActive ? "li-active" : ""}
          onClick={() => toggleFilter("deleted")}
        >
          <span>
            <AiFillDelete className="icon" />
          </span>
          <span className="fl-text">Deleted</span>
          <span className="count-badge">{count.deletedCount}</span>
        </li>
      </ul>
    </div>
  );
}
export default Filters;
