import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Routes, Route} from "react-router-dom";
import SignUp from '../Components/SignUpForm';
import SignIn from '../Components/SigninForm';
import Home from '../Pages/Home';
import "../App.css";

function AuthenticationPage() {


  return (
    <div>

    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUp/>} />
        <Route path="/login" element={<SignIn/>} />
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

export default AuthenticationPage
