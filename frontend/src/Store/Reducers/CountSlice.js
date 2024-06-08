import { createSlice } from "@reduxjs/toolkit";

const CountSlice =createSlice({
    name :"count",
    initialState:{},
    reducers :{
        setCount(state,action){
            state.count= action.payload
        }
    }
})

export default CountSlice.reducer;
export const {setCount} =CountSlice.actions;