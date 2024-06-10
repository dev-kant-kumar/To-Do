const express = require("express")
const TodoFiltersRoutes =express.Router

const {showAllTasks,showCompletedTasks,showStarredTasks,showTasksCreatedToday,showTasksCreatedWeekAgo,showDeletedTask}=require("../controllers/todoFiltersController")

TodoFiltersRoutes.get("/all",showAllTasks);
TodoFiltersRoutes.get("/completed",showCompletedTasks);
TodoFiltersRoutes.get("/starred",showStarredTasks);
TodoFiltersRoutes.get("/today",showTasksCreatedToday);
TodoFiltersRoutes.get("/week",showTasksCreatedWeekAgo);
TodoFiltersRoutes.get("/deleted",showDeletedTask);

module.exports=TodoFiltersRoutes;