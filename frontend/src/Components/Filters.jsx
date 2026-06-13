import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setTodo, setTodoLength } from "../Store/Reducers/TodoFilterSlice";
import { setActiveDeletedFilter } from "../Store/Reducers/ActiveDeletedFilter";
import global from "../Components/Global";

import { ListTodo, Star, Calendar, Trash2, X } from "lucide-react";

const FILTERS = [
  { key: "all", label: "All", icon: <ListTodo size={18} /> },
  { key: "starred", label: "Starred", icon: <Star size={18} /> },
  { key: "today", label: "Today", icon: <Calendar size={18} /> },
  { key: "deleted", label: "Deleted", icon: <Trash2 size={18} /> },
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
    <div className="flex flex-col gap-5 w-full text-left">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">
          Filters
        </h2>
        <button
          onClick={() => setShow(false)}
          className="md:hidden p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <ul className="flex flex-col gap-1 w-full list-none p-0 m-0">
        {FILTERS.map(({ key, label, icon }) => {
          const isActive = activeFilter === key;
          return (
            <li
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer select-none border ${
                isActive
                  ? "bg-purple-600/10 border-purple-500/30 text-purple-300 shadow-lg shadow-purple-950/10"
                  : "bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900/30 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-colors ${isActive ? "text-purple-400" : "text-zinc-500"}`}>
                  {icon}
                </span>
                <span className="text-sm font-semibold">{label}</span>
              </div>
              
              {counts[`${key}Count`] !== undefined && counts[`${key}Count`] > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                  isActive 
                    ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                    : "bg-zinc-900/60 border-zinc-800/80 text-zinc-500"
                }`}>
                  {counts[`${key}Count`]}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Filters;
