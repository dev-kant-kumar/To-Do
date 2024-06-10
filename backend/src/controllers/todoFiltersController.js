const Todo =require("../models/todoModel")

async function showAllTasks(req,res){
    console.log("Show all tasks reached")

    const allTasks = await Todo.find({},'task');

    if(allTasks.length==0){
        res.send({
            status:false,
            message:"No task found! Create tasks first."
        })
    }
    else{
        res.send(allTasks);
    }
   
}

async function showCompletedTasks(req,res){
    console.log("show completed tasks reached")

    const completedTask= await Todo.find({completed:true},'task');

    if(completedTask.length==0){
        res.send({
            status:false,
            message:"There is no tasks marked as completed."
        })
    }
    else{
        res.send(completedTask);
    }

}

async function showStarredTasks(req,res){
    console.log("show starred tasks reached");

    const starredTask= await Todo.find({starred:true},'task');

    if(starredTask.length==0){
        res.send({
            status:false,
            message:"There is no tasks marked as starred."
        })
    }
    else{
        res.send(starredTask);
    }
}

async function showTasksCreatedToday(req,res){
    console.log("show task created today reached")

    const TasksCreatedToday = await Todo.find({date:new Date()},'task')

    if(TasksCreatedToday.length==0){
        res.send({
            status:false,
            message:"There is no tasks created today."
        })

    }
    else{
        res.send(TasksCreatedToday);
    }

}

async function showTasksCreatedWeekAgo(req,res){
    console.log("show tasks created a week ago reached")

  const now = new Date();
  const sevenDaysAgoStart = new Date(now);
  sevenDaysAgoStart.setDate(now.getDate() - 7);
  sevenDaysAgoStart.setHours(23, 59, 59, 999);

//   console.log(sevenDaysAgoStart.toLocaleDateString());
const TasksWeekAgo= Todo.find({date:sevenDaysAgoStart},'task')

if(TasksWeekAgo.length==0){
    res.send({
        status:false,
        message:"There is no tasks created a week ago."
    })
}
else{
    res.send(TasksWeekAgo);
}



}

async function showDeletedTask(req,res){
    console.log("show all deleted tasks")

     const deletedTask= await Todo.find({deleted:true},'task');

    if(deletedTask.length==0){
        res.send({
            status:false,
            message:"There is no tasks marked as deleted."
        })
    }
    else{
        res.send(deletedTask);
    }
}



module.exports ={showAllTasks,showCompletedTasks,showStarredTasks,showTasksCreatedToday,showTasksCreatedWeekAgo,showDeletedTask}