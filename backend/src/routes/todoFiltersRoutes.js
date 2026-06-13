const express = require("express");
const TodoFiltersRoutes = express.Router();
const auth = require("../middlewares/auth");

const {
  showAllTasks,
  showCompletedTasks,
  showStarredTasks,
  showTasksCreatedToday,
  showTasksCreatedWeekAgo,
  showDeletedTask,
} = require("../controllers/todoFiltersController");

TodoFiltersRoutes.post("/all", auth, showAllTasks);
TodoFiltersRoutes.post("/completed", auth, showCompletedTasks);
TodoFiltersRoutes.post("/starred", auth, showStarredTasks);
TodoFiltersRoutes.post("/today", auth, showTasksCreatedToday);
TodoFiltersRoutes.post("/week", auth, showTasksCreatedWeekAgo);
TodoFiltersRoutes.post("/deleted", auth, showDeletedTask);

module.exports = TodoFiltersRoutes;
