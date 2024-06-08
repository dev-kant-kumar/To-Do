import { configureStore } from "@reduxjs/toolkit";
import CountSlice from "./Reducers/CountSlice";



const store =configureStore({
    reducer : {
       countHandler:CountSlice ,
    }
})

export default store