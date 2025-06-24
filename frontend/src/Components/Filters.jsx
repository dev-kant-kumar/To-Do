import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setTodo, setTodoLength } from "../Store/Reducers/TodoFilterSlice";
import { setActiveDeletedFilter } from "../Store/Reducers/ActiveDeletedFilter";
import global from "../Components/Global";

import { LuListTodo } from "react-icons/lu";
import { TiStarFullOutline } from "react-icons/ti";
import { IoTodaySharp } from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";

const FILTERS = [
  { key: "all", label: "All", icon: <LuListTodo className="icon" /> },
  {
    key: "starred",
    label: "Starred",
    icon: <TiStarFullOutline className="icon" />,
  },
  { key: "today", label: "Today", icon: <IoTodaySharp className="icon" /> },
  { key: "deleted", label: "Deleted", icon: <AiFillDelete className="icon" /> },
];

function Filters({ setShow }) {
  const dispatch = useDispatch();
  const apiUrl = global.REACT_APP_API_BASE_URL;
  const userId = useSelector((state) => state.UserSlice.userId);

  const [activeFilter, setActiveFilter] = useState("all");
  const [counts, setCounts] = useState({});

  // Update Redux filter state on change
  useEffect(() => {
    dispatch(
      setActiveDeletedFilter({
        isAllActive: activeFilter === "all",
        isStarredActive: activeFilter === "starred",
        isTodayActive: activeFilter === "today",
        isWeekActive: activeFilter === "week",
        isDeletedActive: activeFilter === "deleted",
      })
    );
  }, [activeFilter, dispatch]);

  // Fetch data when active filter changes
  useEffect(() => {
    const fetchFilteredTodos = async () => {
      if (!userId) return;

      try {
        const res = await axios.post(`${apiUrl}filters/${activeFilter}`, {
          userId,
        });

        if (res.data.status === false) {
          dispatch(setTodoLength(res.data.length));
        } else {
          dispatch(setTodo(res.data));
          dispatch(setTodoLength(res.data.length));
          setCounts((prev) => ({
            ...prev,
            [`${activeFilter}Count`]: res.data.length,
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFilteredTodos();
  }, [activeFilter, apiUrl, userId, dispatch]);

  return (
    <div>
      <div className="filter-top">
        <h2 id="filters-heading">Filters</h2>
        <div className="close">
          <i onClick={() => setShow(false)} className="ri-close-fill"></i>
        </div>
      </div>

      <ul id="filters-list">
        {FILTERS.map(({ key, label, icon }) => (
          <li
            key={key}
            className={activeFilter === key ? "li-active" : ""}
            onClick={() => setActiveFilter(key)}
          >
            <span>{icon}</span>
            <span className="fl-text">{label}</span>
            <span className="count-badge">{counts[`${key}Count`] || ""}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Filters;
