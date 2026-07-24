import express from "express";
const app=express()
import dotenv from "dotenv"
dotenv.config()
import cookieParser from "cookie-parser"
import cors from "cors"
import authRoutes from "../src/routes/authRoutes.js"
//env variables
let port =process.env.PORT;


//middlewears
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use(cors())

//routes
app.use("/api/v1/auth",authRoutes);




app.listen(port,()=>{
    console.log(`server running at ${port}`)
})



