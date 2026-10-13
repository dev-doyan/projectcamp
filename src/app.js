import express from "express";
const app=express()
import dotenv from "dotenv"
dotenv.config()
import cookieParser from "cookie-parser"


import cors from "cors"
import authRoutes from "../src/routes/authRoutes.js"
import projectRoutes from "../src/routes/projectRoutes.js"
import taskRoutes from "../src/routes/taskRoutes.js";
//env variables
let port =process.env.PORT;


//middlewears
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}))



//routes
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/tasks",taskRoutes);


app.get("/ping", (req, res) => {
    return res.json({
        message: "pong"
    });
});

app.listen(port,()=>{
    console.log(`server running at ${port}`)
})



