const Todo =require("../models/todoModel")

async function addTask(req,res){
    console.log("Reached Add Task");

    const {task} =req.body

    const newTask = new Todo({

        task:task,
        completed:false,
        starred:false,
        deleted:false,
        date: new Date(),
    })

     await newTask.save()
     res.send({
        status:true,
        message:"Task added successfully"
     })


}


async function markCompleted(req,res){
    console.log("Reached mark completed task")

    const {task}=req.body

    const markCompleteStatus =await Todo.findOneAndUpdate({task:task}, { $set: { completed: true } });

    if(markCompleteStatus){
        res.send({
            status:true,
            message:"Task successfully marked as completed."
        })

    }
    else{
        res.send({
            status:false,
            message:"No such task found!"
        })
    }

}

async function unMarkCompleted(req,res){
    console.log("Reached un mark completed task")

    const {task}=req.body

    const unMarkCompletedStatus = await Todo.findOneAndUpdate({task:task},{$set:{completed:false}});

    if(unMarkCompletedStatus){
        res.send({
            status:true,
            message:"Task successfully unmarked as completed."
        })
    }
    else{
        res.send({
            status:false,
            message:"No such task found"
        })
    }


}


async function markStarred(req,res){
    console.log("Reached mark starred task")

    const {task}=req.body

    const markStarredStatus = await Todo.findOneAndUpdate({task:task},{$set:{starred:true}});

    if(markStarredStatus){
        res.send({
            status:true,
            message:"Task successfully marked as starred."
        })
    }
    else{
        res.send({
            status:false,
            message:"No such task found"
        })
    }

}

async function unMarkStarred(req,res){
     console.log("Reached un mark starred task")

    const {task}=req.body

    const unMarkStarredStatus = await Todo.findOneAndUpdate({task:task},{$set:{starred:false}});

    if(unMarkStarredStatus){
        res.send({
            status:true,
            message:"Task successfully unmarked as starred."
        })
    }
    else{
        res.send({
            status:false,
            message:"No such task found"
        })
    }

}

async function deleteTask(req,res){
    console.log("Reached deleted task")

    const {task}=req.body

    const deleteStatus = await Todo.findOneAndUpdate({task:task},{$set:{deleted:true}})

    if(deleteStatus){
        res.send({
            status:true,
            message:"Task deleted successfully."
        })
    }
    else{
        res.send({
            status:false,
            message:"No such Task found"
        })
    }

}

async function undoDelete(req,res){
    console.log("Reached undo deleted task")

    const {task}=req.body

    const deleteStatus = await Todo.findOneAndUpdate({task:task},{$set:{deleted:false}})

    if(deleteStatus){
        res.send({
            status:true,
            message:"Task successfully restored from deletion."
        })
    }
    else{
        res.send({
            status:false,
            message:"No such Task found"
        })
    }

}


module.exports = {addTask,markCompleted,unMarkCompleted,markStarred,unMarkStarred,deleteTask,undoDelete}