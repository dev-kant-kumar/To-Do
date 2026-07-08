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
    // Patch a single task in place for instant, optimistic UI updates
    // (mark complete, star, reorder) without refetching the whole list.
    updateTodoItem(state, action) {
      const { id, changes } = action.payload;
      const idx = state.todo.findIndex((t) => t._id === id);
      if (idx !== -1) {
        state.todo[idx] = { ...state.todo[idx], ...changes };
      }
    },
    // Remove a task from the local list optimistically (delete/restore).
    removeTodoItem(state, action) {
      state.todo = state.todo.filter((t) => t._id !== action.payload);
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
export const {
  setTodo,
  setTodoLength,
  setSearchQuery,
  setFocusTask,
  setShowCreateTask,
  updateTodoItem,
  removeTodoItem,
} = TodoFilterSlice.actions;


