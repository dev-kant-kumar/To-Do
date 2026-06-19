const Todo = require("../models/todoModel");

async function showAllTasks(req, res) {
  console.log("Show all tasks reached");

  const userId = req.id;
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

  const userId = req.id;
  const completedTask = await Todo.find({ userId: { $eq: userId }, completed: true, deleted: false });

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

  const userId = req.id;
  const starredTask = await Todo.find({ userId: { $eq: userId }, starred: true, deleted: false });

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

  const userId = req.id;

  // Get the start and end of today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Find tasks created today
  const TasksCreatedToday = await Todo.find({
    userId: userId,
    deleted: false,
    date: { $gte: startOfDay, $lt: endOfDay },
  });

  if (TasksCreatedToday.length == 0) {
    res.send({
      status: false,
      message: "There are no tasks created today.",
      length: 0,
    });
  } else {
    res.send(TasksCreatedToday);
    console.log(TasksCreatedToday);
  }
}

async function showTasksCreatedWeekAgo(req, res) {
  console.log("show tasks created a week ago reached");

  const userId = req.id;

  const now = new Date();
  const startOfWeekAgo = new Date(now);
  startOfWeekAgo.setDate(now.getDate() - 7);
  startOfWeekAgo.setHours(0, 0, 0, 0);
  const endOfWeekAgo = new Date(startOfWeekAgo);
  endOfWeekAgo.setHours(23, 59, 59, 999);

  // Find tasks created exactly a week ago
  const TasksWeekAgo = await Todo.find({
    userId: { $eq: userId },
    deleted: false,
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
  const userId = req.id;
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

async function getTodoCounts(req, res) {
  console.log("getTodoCounts reached");
  const userId = req.id;
  try {
    const allCount = await Todo.countDocuments({ userId: userId, deleted: false });
    const starredCount = await Todo.countDocuments({ userId: userId, starred: true, deleted: false });
    const completedCount = await Todo.countDocuments({ userId: userId, completed: true, deleted: false });
    const pendingCount = await Todo.countDocuments({ userId: userId, completed: false, deleted: false });
    
    // Get the start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    
    const todayCount = await Todo.countDocuments({
      userId: userId,
      deleted: false,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    
    const deletedCount = await Todo.countDocuments({ userId: userId, deleted: true });
    
    res.send({
      allCount,
      starredCount,
      completedCount,
      pendingCount,
      todayCount,
      deletedCount,
    });
  } catch (error) {
    console.error("Error fetching todo counts:", error);
    res.status(500).send({
      status: false,
      message: "Internal server error while fetching counts",
    });
  }
}

async function getActivityData(req, res) {
  console.log("getActivityData reached");
  const userId = req.id;

  try {
    const now = new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    oneYearAgo.setHours(0, 0, 0, 0);

    // Aggregate completed tasks by date
    // Use completedAt if available, fall back to updatedAt for legacy data
    const activityData = await Todo.aggregate([
      {
        $match: {
          userId: userId.toString(),
          completed: true,
          deleted: false,
          $or: [
            { completedAt: { $gte: oneYearAgo } },
            {
              completedAt: null,
              updatedAt: { $gte: oneYearAgo },
            },
          ],
        },
      },
      {
        $addFields: {
          effectiveDate: {
            $ifNull: ["$completedAt", "$updatedAt"],
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$effectiveDate" },
            month: { $month: "$effectiveDate" },
            day: { $dayOfMonth: "$effectiveDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    // Transform into a flat date-keyed map: { "2026-06-19": 3 }
    const dateMap = {};
    activityData.forEach((entry) => {
      const { year, month, day } = entry._id;
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      dateMap[dateKey] = entry.count;
    });

    // Also include overall stats
    const totalCompleted = await Todo.countDocuments({
      userId: userId,
      completed: true,
      deleted: false,
    });

    res.send({
      status: true,
      activity: dateMap,
      totalCompleted,
    });
  } catch (error) {
    console.error("Error fetching activity data:", error);
    res.status(500).send({
      status: false,
      message: "Internal server error while fetching activity data",
    });
  }
}

module.exports = {
  showAllTasks,
  showCompletedTasks,
  showStarredTasks,
  showTasksCreatedToday,
  showTasksCreatedWeekAgo,
  showDeletedTask,
  getTodoCounts,
  getActivityData,
};
