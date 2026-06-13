const express = require("express");
const TodoRoutes = express.Router();
const auth = require("../middlewares/auth");
const {
  addTask,
  markCompleted,
  unMarkCompleted,
  markStarred,
  unMarkStarred,
  deleteTask,
  undoDelete,
  deleteDeletedTask,
  updateTask,
} = require("../controllers/todoController");

TodoRoutes.post("/addTask", auth, addTask);
TodoRoutes.post("/updateTask", auth, updateTask);

TodoRoutes.post("/markComplete", auth, markCompleted);
TodoRoutes.post("/unMarkComplete", auth, unMarkCompleted);

TodoRoutes.post("/markStarred", auth, markStarred);
TodoRoutes.post("/unMarkStarred", auth, unMarkStarred);

TodoRoutes.post("/deleteTask", auth, deleteTask);
TodoRoutes.post("/unoDelete", auth, undoDelete);
TodoRoutes.post("/deleteall", auth, deleteDeletedTask);

module.exports = TodoRoutes;
