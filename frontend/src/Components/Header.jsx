import React, { useState } from 'react'
import Arrow from '../assets/mdi--arrow-down-drop.png'

function Header(props) {
  const closeHandler = () => {
    props.setShow(true);
  };
  return (
    <div className='header'>
      <h1 id="logo">to<span>do</span>.</h1>
      <section id="account-center">
        <p>Dev Kant Kumar</p>
        <img src={Arrow} alt="arrow-down-drop" id="arrow-down-drop" />
      </section>
      <div className="menu"><i onClick={closeHandler} className="ri-menu-3-line"></i></div>
    </div>
  )
}

export default Header
