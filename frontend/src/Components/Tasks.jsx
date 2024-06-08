import { useState, useRef, React,} from 'react';
import CreateTask from './CreateTask'
import StarredIcon from '../assets/ic--round-star.png'
import StarredMark from '../assets/white-star.png'

function Tasks() {
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [tasks,setTasks]=useState([{text:"Create your task to see here",complete:false,starred:false}])

 const handleListDataFromChild=(taskAdded)=>{
  setTasks((preTasks)=>[...preTasks,{ text: taskAdded, complete: false, starred: false }]);
 }
  
  const taskHandler=()=>{
    setShowCreateTask((prevShowCreateTask) => !prevShowCreateTask);
    // setShowCreateTask(!showCreateTask);
  }

  const toggleTaskComplete = (index) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index].complete = !updatedTasks[index].complete;
      return updatedTasks;
    });
  };

  const toggleStarred = (index) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks];
      updatedTasks[index].starred = !updatedTasks[index].starred;
      return updatedTasks;
    });
  }
  
  return (
    <>
    
    <div id="tasks-main-container">
      <ul id="tasks-list">

       {
         tasks?.map((task,index)=>{
          return(

           
   
             <li key={index} >

              <span  className='completed-mark list-items' onClick={()=>toggleTaskComplete(index)}>
                <span className={task.complete ? "inner-circle" :"" }></span>
              </span>

              <span className={ task.complete ? 'list-content list-items list-strike' : "list-content list-items"}>{task.text}</span>

              <span className='starred-mark list-items' onClick={()=>toggleStarred(index)}>
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
    
    
    {showCreateTask && <CreateTask taskToAdd={handleListDataFromChild}/>}
    
    </>
  )
}

export default Tasks
