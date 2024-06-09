const express = require("express")
const app=express()
const port=5000

const connectDB =require('./src/config/db')

app.get("/",(req,res)=>{
    res.send("Hello there you are on todo Application server");
})



app.listen(port,()=>{
    console.log("Server is running on port ",port);
    connectDB()
})