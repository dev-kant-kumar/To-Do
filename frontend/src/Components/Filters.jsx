import React, { useState } from 'react'
import All from '../assets/material-symbols-light--all-inbox.png'
import Starred from '../assets/ic--round-star.png'  
import Today from '../assets/material-symbols-light--today.png'  
import Week from '../assets/tabler--calendar-week.png'
import Delete from '../assets/Delete.png'
import { setCount } from '../Store/Reducers/CountSlice'
import { useDispatch} from 'react-redux';


function Filters(props) {

  const [isActive,setIsActive]=useState({

    isAllActive:true,
    isStarredActive:false,
    isTodayActive:false,
    isWeekActive:false,
    isDeletedActive:false
  });

  const [count,setCount]=useState({
    allCount:null,
    starredCount:null,
    todayCount:null,
    weekCount:null,
    deletedCount:null
  })
  const closeHandler = () => {
    props.setShow(false);
  };
  

  return (
    <div>
        <div className="filter-top">
        <h2 id="filters-heading">Filters</h2>
        <div className="close"><i onClick={closeHandler} className="ri-close-fill"></i></div>
        </div>
        <ul id="filters-list">

            <li 
            className={isActive.isAllActive ? "li-active":''}
            onClick={(preState)=>{setIsActive({...preState,isAllActive:!preState.isAllActive})}}>
              
              <span><img src={All} alt="all-icon" className='icon'/></span>
              <span className='fl-text'>All</span>
              <span className='count-badge'>{count.allCount}</span>
            </li>

            <li 
            className={isActive.isStarredActive ? "li-active":''}
            onClick={(preState)=>{setIsActive({...preState,isStarredActive:!preState.isStarredActive})}}>

              <span><img src={Starred} alt="starred-icon" className='icon' /></span>
              <span className='fl-text'>Starred</span>
              <span className='count-badge'>{count.starredCount}</span>
            </li>

            <li 
            className={isActive.isTodayActive ? "li-active":''}
            onClick={(preState)=>{setIsActive({...preState,isTodayActive:!preState.isTodayActive})}}>

              <span><img src={Today} alt="today-icon" className='icon' /></span>
              <span className='fl-text'>Today</span>
              <span className='count-badge'>{count.todayCount}</span>
            </li>

            <li 
            className={isActive.isWeekActive ? "li-active":''}
            onClick={(preState)=>{setIsActive({...preState,isWeekActive:!preState.isWeekActive})}}>

              <span><img src={Week} alt="week-icon" className='icon' /></span>
              <span className='fl-text'>Week</span>
              <span className='count-badge'>{count.weekCount}</span>
            </li>

            <li 
            className={isActive.isDeletedActive ? "li-active":''}
            onClick={(preState)=>{setIsActive({...preState,isDeletedActive:!preState.isDeletedActive})}}>

              <span><img src={Delete} alt="delete-icon" className='icon' /></span>
              <span className='fl-text'>Deleted</span>
              <span className='count-badge'>{count.deletedCount}</span>
            </li>

        </ul>
        
      
    </div>
  )
}

export default Filters
