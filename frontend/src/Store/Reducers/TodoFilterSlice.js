import { createSlice } from "@reduxjs/toolkit";

const TodoFilterSlice = createSlice({
  name: "todo",
  initialState: {
    todo: [],
    length: 0,
    searchQuery: "",
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
  },
});

export default TodoFilterSlice.reducer;
export const { setTodo, setTodoLength, setSearchQuery } = TodoFilterSlice.actions;

