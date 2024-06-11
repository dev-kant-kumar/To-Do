import React, { useState } from 'react'
import openEye from '../assets/heroicons-solid--eye.png'
import closeEye from '../assets/tabler--eye-off.png'
import MainImg from '../assets/MainImg.png'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom'

function SigninForm() {
      const navigate = useNavigate()

      const [inputValue,setInputValue]=useState({
        username:"",
        password:"",
    })

     const [showPassword,setShowPassword]=useState(false);

    const handleFormInput=(e)=>{
      console.log(e.target.value )
        setInputValue({...inputValue,[e.target.name]:e.target.value});  
    }

     const passwordHandler=()=>{
      setShowPassword(!showPassword);
    }

    const sendDataToBackend=(e)=>{
       e.preventDefault();
       axios.post("http://localhost:5000/user/signin",{

        username:inputValue.username,
        password:inputValue.password
       }).then((res)=>{
        if(res.data.status==true){
          toast(res.data.message);
          navigate("/home");
          console.log(res.data.token);
          console.log(res.data.username);
          console.log(res.data.id);

        }
        else{
          toast(res.data.message);
        }

       }).catch((err)=>{
        console.log(err);

       })


    }

  return (
    <div className="form-main-container">
        <img src={MainImg} alt="" id="main-img"/>
        <form action=""  className="SignUp-signIn-form" onSubmit={sendDataToBackend}>

              <h2>Sign In</h2>

        <input 
        type="text" 
        name="username"
        value={inputValue.username} 
        placeholder="Username" 
        onChange={handleFormInput}
        />

        <div className="password-field">
            <input 
            type={showPassword ? "text" : "password"} 
            name="password"
            value={inputValue.password} 
            placeholder="Password" 
            onChange={handleFormInput}
            />

            <img src={showPassword? openEye : closeEye} alt="revel password/show password icon" className='set-view-password' onClick={passwordHandler}/>
        </div>

        <div id="stay-signed-in-and-forgot-password">
         <input type="checkbox" />
         <p>Keep me signed in <a>Forgot Password?</a></p>
      </div>

      <input type="submit" id="sig-up-btn" value="Sign In"/>

       <div id="login-section-sign-In-form">
        <p>Don't have an account? </p>
        <Link to ="/">Sign Up</Link>
      </div>
      
        </form>
      
    </div>
  )
}

export default SigninForm
