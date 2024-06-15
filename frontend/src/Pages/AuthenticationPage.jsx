import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route, useNavigate} from "react-router-dom";
import SignUp from '../Components/SignUpForm';
import SignIn from '../Components/SigninForm';
import Home from '../Pages/Home';
import "../App.css";
import ErrorPage from './ErrorPage';
import TermsAndConditionsPage from './TermsAndConditionsPage';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfo } from '../Store/Reducers/UserSlice';
import axios from 'axios';
import { setPreLoader } from '../Store/Reducers/Loader';
import { useEffect } from 'react';

function AuthenticationPage() {

  const dispatch = useDispatch()
  
 const preloader=useSelector(state=> state.Loader.preloader)
 const userInfo=useSelector(state=> state.UserSlice.name)
 console.log(userInfo);
  
 useEffect(()=>{
   dispatch(setPreLoader(true))
 
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
       
       }
       dispatch(setPreLoader(false));
       
     }).catch((err)=>{
       dispatch(setPreLoader(false));
       console.log(err)
     })
   }
   else{
     dispatch(setPreLoader(false));
     
   }


 },[]) 

  if(preloader===true){
    return(
      <div className="preloader">
        <div className="loader">Hello</div>
      </div>
    )
  }
  else{

  return (
    <div>

    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<SignUp/>} />
        <Route path="/login" element={<SignIn/>} />
        <Route path="/terms-and-conditions" element={<TermsAndConditionsPage/>} />
        <Route path="*" element={<ErrorPage/>} />
        <Route path="/error" element={<ErrorPage/>} />
        <Route path="/home" element={<Home/>} />
        
      </Routes>
    </BrowserRouter>

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
}

export default AuthenticationPage
