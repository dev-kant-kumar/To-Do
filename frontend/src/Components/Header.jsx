import { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useSelector } from "react-redux";
import DropDown from "./AccountCenterDropDown";

function Header(props) {
  const userInfo = useSelector((state) => state.UserSlice);
  const [showDropDown, setShowDropDown] = useState(false);

  const closeHandler = () => {
    props.setShow(true);
  };

  const dropDownHandler = () => {
    setShowDropDown(!showDropDown);
  };

  return (
    <div className="header">
      <h1 id="logo">
        to<span>do</span>.
      </h1>
      <section id="account-center" onClick={dropDownHandler}>
        <p>{userInfo?.name}</p>
        <IoMdArrowDropdown size={20} />
      </section>
      {showDropDown && <DropDown />}

      <div className="menu">
        <i onClick={closeHandler} className="ri-menu-3-line"></i>
      </div>
    </div>
  );
}

export default Header;
