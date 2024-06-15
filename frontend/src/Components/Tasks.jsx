import { useState, useRef, React,} from 'react';
import CreateTask from './CreateTask'
import StarredIcon from '../assets/ic--round-star.png'
import StarredMark from '../assets/white-star.png'
import { useSelector } from 'react-redux';
import axios from 'axios';


function Tasks() {
 
  const todoData=useSelector(state=>state.TodoFilterSlice);
  const todoDataArray=todoData.todo || [];
  // const newTodoDataArray = [...todoDataArray].reverse();
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [tasks,setTasks]=useState(todoDataArray);
  console.log(tasks);
  
  // [{text:"Create your task to see here",complete:false,starred:false}]

 
  const taskHandler=()=>{
    setShowCreateTask((prevShowCreateTask) => !prevShowCreateTask);
  }

  const toggleTaskComplete = (taskID,status) => {

    if(status==true){
      
    axios.post("http://localhost:5000/todo/unMarkComplete",{
      taskID:taskID
    })
    .then((res)=>{
      console.log(res.data.message);
    })
    .catch((err)=>{
      console.log(err);
    })

    }
    else{
      axios.post("http://localhost:5000/todo/markComplete",{
      taskID:taskID
    })
    .then((res)=>{
      console.log(res.data.message);
    })
    .catch((err)=>{
      console.log(err);
    })

    }
    
  };

  const toggleStarred = (taskID,status) => {
    if(status==true){
      
    axios.post("http://localhost:5000/todo/unMarkStarred",{
      taskID:taskID
    })
    .then((res)=>{
      console.log(res.data.message);
    })
    .catch((err)=>{
      console.log(err);
    })

    }
    else{
      axios.post("http://localhost:5000/todo/markStarred",{
      taskID:taskID
    })
    .then((res)=>{
      console.log(res.data.message);
    })
    .catch((err)=>{
      console.log(err);
    })

    }
    
  }
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', day: '2-digit', month: 'short', year: '2-digit' };
    return date.toLocaleDateString('en-IN', options);
  };
  
  return (
    <>
    
    <div id="tasks-main-container">
      <ul id="tasks-list">

       {
         tasks?.map((task)=>{
          return(

           
   
             <li key={task._id} >

              <span  className='completed-mark list-items' onClick={()=>toggleTaskComplete(task._id,task.completed)}>
                <span className={task.completed ? "inner-circle" :"" }></span>
              </span>

              <span className={ task.completed ? 'list-content list-items list-strike' : "list-content list-items"}>{task.task}</span>

              <span>{formatDate(task.date)}
              </span>

              <span className='starred-mark list-items' onClick={()=>toggleStarred(task._id,task.starred)}>
                <img src={task.starred ? StarredMark : StarredIcon} alt="starred-icon" className='star-icon' />
              </span>
      
            </li>
            )
   
           })
        }    
      </ul>
    </div>

    <div id="tasks-footer">
        <button id="add-task-btn" onClick={taskHandler}>Add Task</button>
      </div>
    
    
    {showCreateTask && <CreateTask/>}
    
    </>
  )
}

export default Tasks
