import React, { useState } from 'react'

function Header(props) {
  const closeHandler = () => {
    props.setShow(true);
  };
  return (
    <div className='header'>
      <h1 id="logo">to<span>do</span>.</h1>
      <div className="menu"><i onClick={closeHandler} className="ri-menu-3-line"></i></div>
    </div>
  )
}

export default Header
