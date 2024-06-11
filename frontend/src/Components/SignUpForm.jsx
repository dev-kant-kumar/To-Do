import React, { useState,useRef } from 'react'
import openEye from '../assets/heroicons-solid--eye.png'
import closeEye from '../assets/tabler--eye-off.png'
import MainImg from '../assets/MainImg.png'
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'

function SignUpForm() {

    const [inputValue,setInputValue]=useState({
        name:"",
        username:"",
        email:"",
        password:"",
        confirmPassword:""
    })
    console.log(inputValue.name,inputValue.username,inputValue.email,inputValue.password);

    const handleFormInput=(e)=>{
      console.log(e.target.name)
        setInputValue({...inputValue,[e.target.name]:e.target.value});  
    }
    const [showPassword,setShowPassword]=useState(false);
    const [showConfirmPassword,setShowConfirmPassword]=useState(true);

    const passwordHandler=()=>{
      setShowPassword(!showPassword);
    }
    const confirmPasswordHandler=()=>{
        setShowConfirmPassword(!showConfirmPassword);
    }

    const sendDataToBackend=(e)=>{
       e.preventDefault()

        axios.post("http://localhost:5000/user/signup",{
            name:inputValue.name,
            username:inputValue.username,
            email:inputValue.email,
            password:inputValue.password
        }).then((res)=>{
          console.log(res.data)
            if(res.data.status==true){
                toast(res.data.message);
                toast("Welcome onboard! please login to start managing tasks");
            }
            else{
                toast(res.data.message);
            }
            
        }).catch((err)=>{
            console.log(err.response.data);
        })
        

    }


  return (
    <div className="form-main-container">

      <img src={MainImg} alt="" id="main-img"/>
      <form action='' className="SignUp-signIn-form" onSubmit={sendDataToBackend}>

        <h2>Sign Up</h2>

        <input 
        type="text"
        name="name"
        value={inputValue.name}
        placeholder="Name" 
        onChange={handleFormInput}

        />

        <input 
        type="text" 
        name="username"
        value={inputValue.username} 
        placeholder="Username" 
        onChange={handleFormInput}
        />

        <input 
        type="email" 
        name="email"
        value={inputValue.email} 
        placeholder="Email Id"
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

       <div className="password-field">
          <input 
              type={showConfirmPassword ? "text" :"password"} 
              name="confirmPassword"
              value={inputValue.confirmPassword} 
              placeholder="Confirm Password" 
              onChange={handleFormInput}
              />

               <img src={showConfirmPassword ? openEye :closeEye} alt="revel password/show password icon" className='set-view-password' onClick={confirmPasswordHandler}/>
       </div>


       <div id="terms-conditions">
         <input type="checkbox"/>
         <p>Agree With <a>Terms & Conditions</a></p>
      </div>

      <input type="submit" id="sig-up-btn" value="Sign Up"/>

       <div id="login-section">
        <p>Already have an account ? </p>
        <Link to ="/login">Login Here</Link>
      </div>

      </form>
    </div>
  )
}

export default SignUpForm
