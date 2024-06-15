import { configureStore } from "@reduxjs/toolkit";
import TodoFilterSlice from "./Reducers/TodoFilterSlice";
import UserSlice from "./Reducers/UserSlice";
import Loader from "./Reducers/Loader";

const store = configureStore({
  reducer: {
    TodoFilterSlice: TodoFilterSlice,
    UserSlice: UserSlice,
    Loader: Loader,
  },
});

export default store;
