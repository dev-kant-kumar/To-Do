import React from 'react'
import App from '../App.jsx'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../Store/Reducers/UserSlice';

function Home() {

  const dispatch = useDispatch()
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  if(token){
    axios.get("http://localhost:5000/user/getUserData",{
      headers:{
        "X-Authorization": "Bearer " + token
      }
    }).then((res)=>{
      if(res.data.status == true){

      const {name,username,email,date} =res.data.data
      dispatch(setUserInfo({name,username,email,date}))
      navigate("/home");
      
      }

    }).catch((err)=>{
      console.log(err)
    })
  }
  else{
    navigate("/login");
  }



  return (
    <div>
      <App/>
    </div>
  )
}

export default Home
