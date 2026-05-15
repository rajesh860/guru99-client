import { createSelector, createSlice } from "@reduxjs/toolkit";

const elementSlice = createSlice({
    name:"useref",
    initialState:{
        data:null
    },
    reducers:{
        setEleData:(state,action)=>{
            state.data=action.payload
        }
    }
})
export default elementSlice.reducer;

export const {setEleData} = elementSlice.actions

export const elementSelector=createSelector((state)=>state.useref,(state)=>state)