const Todo = require("../models/todoModel");

async function showAllTasks(req, res) {
  console.log("Show all tasks reached");

  const { userId } = req.body;

  if (typeof userId !== "string") {
    res.status(400).json({ status: "error", message: "Invalid userId" });
    return;
  }
  const allTasks = await Todo.find({ userId: { $eq: userId }, deleted: false });

  if (allTasks.length == 0) {
    res.send({
      status: false,
      message: "No task found! Create tasks first.",
      length: 0,
    });
  } else {
    res.send(allTasks);
    console.log(allTasks);
  }
}

async function showCompletedTasks(req, res) {
  console.log("show completed tasks reached");

  const { userId } = req.body;

  if (typeof userId !== "string") {
    res.status(400).json({ status: "error", message: "Invalid userId" });
    return;
  }
  const completedTask = await Todo.find({ userId: { $eq: userId }, completed: true });

  if (completedTask.length == 0) {
    res.send({
      status: false,
      message: "There are no tasks marked as completed.",
      length: 0,
    });
  } else {
    res.send(completedTask);
    console.log(completedTask);
  }
}

async function showStarredTasks(req, res) {
  console.log("show starred tasks reached");

  const { userId } = req.body;

  if (typeof userId !== "string") {
    res.status(400).json({ status: "error", message: "Invalid userId" });
    return;
  }
  const starredTask = await Todo.find({ userId: { $eq: userId }, starred: true });

  if (starredTask.length == 0) {
    res.send({
      status: false,
      message: "There are no tasks marked as starred.",
      length: 0,
    });
  } else {
    res.send(starredTask);
    console.log(starredTask);
  }
}

async function showTasksCreatedToday(req, res) {
  console.log("show task created today reached");

  const { userId } = req.body;

  // Get the start and end of today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Find tasks created today
  const TasksCreatedToday = await Todo.find({
    userId: userId,
    date: { $gte: startOfDay, $lt: endOfDay },
  });

  if (TasksCreatedToday.length == 0) {
    res.send({
      status: false,
      message: "There are no tasks created today.",
    });
  } else {
    res.send(TasksCreatedToday);
    console.log(TasksCreatedToday);
  }
}

async function showTasksCreatedWeekAgo(req, res) {
  console.log("show tasks created a week ago reached");

  const { userId } = req.body;

  const now = new Date();
  const startOfWeekAgo = new Date(now);
  startOfWeekAgo.setDate(now.getDate() - 7);
  startOfWeekAgo.setHours(0, 0, 0, 0);
  const endOfWeekAgo = new Date(startOfWeekAgo);
  endOfWeekAgo.setHours(23, 59, 59, 999);

  // Find tasks created exactly a week ago
  const TasksWeekAgo = await Todo.find({
    userId: { $eq: userId },
    date: { $gte: startOfWeekAgo, $lt: endOfWeekAgo },
  });

  if (TasksWeekAgo.length == 0) {
    res.send({
      status: false,
      message: "There are no tasks created a week ago.",
      length: 0,
    });
  } else {
    res.send(TasksWeekAgo);
    console.log(TasksWeekAgo);
  }
}

async function showDeletedTask(req, res) {
  console.log("show all deleted tasks");
  const { userId } = req.body;

  if (typeof userId !== "string") {
    res.status(400).json({ status: "error", message: "Invalid userId" });
    return;
  }
  const deletedTask = await Todo.find({ userId: { $eq: userId }, deleted: true });

  if (deletedTask.length == 0) {
    res.send({
      status: false,
      message: "There are no tasks marked as deleted.",
      length: 0,
    });
  } else {
    res.send(deletedTask);
    console.log(deletedTask);
  }
}

module.exports = {
  showAllTasks,
  showCompletedTasks,
  showStarredTasks,
  showTasksCreatedToday,
  showTasksCreatedWeekAgo,
  showDeletedTask,
};
