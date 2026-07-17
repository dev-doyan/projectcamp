import express from "express";
const app=express()
import dotenv from "dotenv"
dotenv.config()

//env variables
let port =process.env.PORT;


//middlewears
app.use(express.static("public"));






app.listen(port,()=>{
    console.log(`server running at ${port}`)
})



