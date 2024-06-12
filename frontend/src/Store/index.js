import { configureStore } from "@reduxjs/toolkit";
import TodoFilterSlice from "./Reducers/TodoFilterSlice";
import UserSlice from "./Reducers/UserSlice";

const store = configureStore({
  reducer: {
    TodoFilterSlice: TodoFilterSlice,
    UserSlice: UserSlice,
  },
});

export default store;
