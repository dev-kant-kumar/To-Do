import { createSlice } from "@reduxjs/toolkit";

const TodoFilterSlice = createSlice({
  name: "todo",
  initialState: {
    todo: [],
    length: 0,
    searchQuery: "",
    focusTaskId: null,
    showCreateTask: false,
  },
  reducers: {
    setTodo(state, action) {
      state.todo = action.payload;
    },
    setTodoLength(state, action) {
      state.length = action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    setFocusTask(state, action) {
      state.focusTaskId = action.payload; // task _id string, or null to clear
    },
    setShowCreateTask(state, action) {
      state.showCreateTask = action.payload;
    },
  },
});

export default TodoFilterSlice.reducer;
export const { setTodo, setTodoLength, setSearchQuery, setFocusTask, setShowCreateTask } = TodoFilterSlice.actions;


