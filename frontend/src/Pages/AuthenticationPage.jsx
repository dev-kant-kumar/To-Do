import React,{useState} from 'react'
import SignUp from '../Components/SignUpForm.jsx'
import SignIn from '../Components/SigninForm.jsx'
import "../App.css";

function AuthenticationPage() {

    const [isSignUp, setIsSignUp] = useState(true);
   
    const switchToSignIn = () => {
        setIsSignUp(false);
    };

    const switchToSignUp = () => {
        setIsSignUp(true);
    };


  return (
    <div>
        {isSignUp ? (
                <SignUp switchToSignIn={switchToSignIn} />
            ) : (
                <SignIn switchToSignUp={switchToSignUp} />
            )}
    </div>
  )
}

export default AuthenticationPage
