import {React,useState,useRef} from 'react'
import crossBtn from '../assets/crossBtn.png'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux';
import { setTodo } from '../Store/Reducers/TodoFilterSlice'

function CreateTask() {

  const userInfo = useSelector(state=>state.UserSlice);
  const dispatch = useDispatch();
  const [inputValue,setInputValue]=useState("");
  const refElement=useRef();
   
  function handleInput(e){setInputValue(e.target.value);}

  function createTaskBtn(e){
    e.preventDefault()

    if (inputValue.trim() !== "") {

      sendCreatedTask(inputValue);
      setInputValue("");
    } 
    else {toast.error('Task cannot be empty');}
  } 

  function cancelBtn(){

    toast.info("Cancelling");
    setInputValue("");
  }

  function closeCreateTask(){refElement.current.style.display="none";}

  function sendCreatedTask(typedValue){
   axios.post("http://localhost:5000/todo/addTask",{
    task:typedValue,
    userId:userInfo.userId,
  })
   .then((res)=>{
    res.data.status ? toast.success(res.data.message): toast.error(res.data.message);
    getTodoData();
  })
   .catch((err)=>{
    err.response ? console.log(err.response.data) :'';
  })
 }
   
  
  const getTodoData=()=>{

    axios.post("http://localhost:5000/filters/all",{
        userId:userInfo.userId,
      })
      .then((res)=>{

        if(res.data.status===false){
          toast.info(res.data.message);
        }
        else{
          console.log(res.data);
          dispatch(setTodo(res.data));

        }
        
      })
      .catch((err)=>{
        console.log(err);
      })
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
       theme="dark"
       
      />

    </div>

  )
}

export default CreateTask