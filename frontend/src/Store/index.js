import { configureStore } from "@reduxjs/toolkit";
import TodoFilterSlice from "./Reducers/TodoFilterSlice";
import UserSlice from "./Reducers/UserSlice";
import Loader from "./Reducers/Loader";
import ActiveDeletedFilter from "./Reducers/ActiveDeletedFilter";
import StreakSlice from "./Reducers/StreakSlice";

const store = configureStore({
  reducer: {
    TodoFilterSlice: TodoFilterSlice,
    UserSlice: UserSlice,
    Loader: Loader,
    ActiveDeletedFilter: ActiveDeletedFilter,
    StreakSlice: StreakSlice,
  },
});

export default store;
