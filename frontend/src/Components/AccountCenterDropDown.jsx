import { RiLogoutBoxRFill } from "react-icons/ri";
import { IoPerson } from "react-icons/io5";
import { useDispatch } from "react-redux";
import { setUserInfo } from "../Store/Reducers/UserSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
function AccountCenterDropDown() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profileHandler = () => {
    navigate("/profile");
  };

  const logoutHandler = () => {
    localStorage.clear();
    dispatch(setUserInfo({}));
    navigate("/login");
    toast.info("You have been logged out");
  };

  return (
    <div id="parent-of-container">
      <div id="ACDD-main-container">
        <section id="profile" onClick={profileHandler}>
          <p>Profile</p>
          <IoPerson />
        </section>

        <section id="logout" onClick={logoutHandler}>
          <p>Logout</p>
          <RiLogoutBoxRFill />
        </section>
      </div>
    </div>
  );
}

export default AccountCenterDropDown;
