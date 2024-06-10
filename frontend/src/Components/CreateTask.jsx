import {React,useState,useRef} from 'react'
import crossBtn from '../assets/crossBtn.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

function CreateTask({taskToAdd}) {

  const [inputValue,setInputValue]=useState("");
  
  const refElement=useRef();
   
 
  function sendCreatedTask(typedValue){
    axios.post("http://localhost:5000/todo/addTask",{
    task:typedValue

  }).then((res)=>{

    console.log(res);

    if(res.data.status==true){
      taskToAdd(inputValue);
    }

  }).catch((err)=>{
    console.error(err)
    if(err.response){
      console.log(err.response.data)
    }
  })


  }

  function handleInput(e){
    setInputValue(e.target.value);
  }

  function createTaskBtn(e){
    e.preventDefault()

    if (inputValue.trim() !== "") {

      sendCreatedTask(inputValue);
      setInputValue("");
    } else {
      toast('Task cannot be empty');
    }
  } 

  function cancelBtn(){

    toast("Cancelling");
    setInputValue("");
  }

  function closeCreateTask(){
    refElement.current.style.display="none";

  }
  

  return (
    
    <div id="CT-main-container" ref={refElement}>


     <div>

       <div id="CT-head">
          <h3 id="CT-heading">New List</h3>
          <img id="CT-cross-btn"  src={crossBtn} alt="Cross Button/Close Button" onClick={closeCreateTask}/>
       </div>   
 
 
         <section id="CT-1">
             <input type="text" value={inputValue} placeholder='Enter task' onChange={handleInput}/>
         </section>
 
         <section id="CT-2">
             <button id="CT-create-btn"  className='CT-btn' onClick={createTaskBtn}> Create Task</button>
             <button id="CT-cancel-btn" className='CT-btn' onClick={cancelBtn}>Cancel</button>
         </section>
         
      </div>

      <ToastContainer
       position="top-right"
       autoClose={5000}
       hideProgressBar={false}
       newestOnTop={false}
       closeOnClick
       rtl={false}
       pauseOnFocusLoss
       draggable
       pauseOnHover
       theme="light"
       
      />

    </div>
    
   
  

  )
}

export default CreateTask