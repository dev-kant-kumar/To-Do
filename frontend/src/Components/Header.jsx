import { useState } from "react";
import { IoMdArrowDropdown } from "react-icons/io";
import { useSelector } from "react-redux";
import DropDown from "./AccountCenterDropDown";
import { IoReorderThreeOutline } from "react-icons/io5";

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
      <div className="menu">
        <span className="three-line">
          {" "}
          <IoReorderThreeOutline onClick={closeHandler} />
        </span>
      </div>
      <h1 id="logo">
        to<span>do</span>.
      </h1>
      <section id="account-center" onClick={dropDownHandler}>
        <p>{userInfo?.name}</p>
        <IoMdArrowDropdown size={20} />
      </section>
      {showDropDown && <DropDown />}
    </div>
  );
}

export default Header;
