import { useEffect, useRef, useState } from "react";
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
  const dropDownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setShowDropDown(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="header">
      <div className="menu">
        <span className="three-line">
          <IoReorderThreeOutline onClick={closeHandler} color="#B0B3C0" />
        </span>
      </div>
      <h1 id="logo">
        to<span>do</span>.
      </h1>
      <section id="account-center" onClick={dropDownHandler}>
        <p>{userInfo?.name}</p>
        <IoMdArrowDropdown size={20} color="#536076" />
      </section>
      {showDropDown && <DropDown ref={dropDownRef} />}
    </div>
  );
}

export default Header;
