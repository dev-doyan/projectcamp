import { eq,and } from "drizzle-orm";
import { projectTable } from "../models/projectModel.js";
import { taskTable } from "../models/taskModel.js"
import { memberTable } from "../models/memberModel.js";
import  db from "../db/index.js"
export const createTask=async(req,res)=>{
try {
    const projectId=req.params.projectId;
const uid=req.user.id;


if(!uid){
    return res.status(401).json({mssg:"you need to ogin first"})
}

const{title,description,priority,dueDate,assignedTo}=req.body;


if(!title || !priority ||!dueDate || !assignedTo){
    return res.status(400).json({mssg:"some fields maybe missing "});
}

const project=await db.select().from(projectTable).where(eq(projectTable.id,projectId));

if(project.length==0){
    return res.status(404).json({mssg:"invalid project id"})
}

const createdby=await db.select().from(memberTable).where(and(
    eq(memberTable.projectId,project[0].id),
    eq(memberTable.userId,uid)
))

if(createdby.length==0){
    return res.status(403).json({mssg:"you are not a member of this project "})
}

if (
    createdby[0].role !== "owner" &&
    createdby[0].role !== "admin"
) {
    return res.status(403).json({
        mssg: "you are not authorised"
    });
}

const assignedto=await db.select().from(memberTable).where(and(
    eq(memberTable.projectId,project[0].id),
    eq(memberTable.userId,assignedTo)
))

if(assignedto.length==0){
    return res.status(400).json({mssg:"the one you are assigning this task to is not  a member  of this project "})
}


const task =await db.insert(taskTable).values({
    title,
    description,
    priority,
    dueDate,
    assignedTo,
    createdBy:uid,
    projectId:projectId

}).returning();

return res.status(201).json({mssg:"success",
    task
})









} catch (error) {
    return res.status(500).json({mssg:error.message

    })
}
}



export const getAllTasks=async(req,res)=>{
    try {

        const uid=req.user.id;
        const projectId=req.params.projectId;
        const project=await db.select().from(projectTable).where(eq(projectTable.id,projectId));

if(project.length==0){
    return res.status(404).json({mssg:"invalid project id"})
}

//seeing if user EXISTS AND  belongs to the particular project
const user= await db.select().from(memberTable).where(and(
    eq(memberTable.userId,uid),
    eq(memberTable.projectId,projectId)

))
if(user.length==0){
    return res.status(403).json({mssg:"user doesnot exist or user doesnt bekong to this project "})
}

const tasks =await db.select().from(taskTable).where(eq(taskTable.projectId,projectId))

return res.status(200).json({mssg:'success',
    tasks
})


    } catch (error) {
        return res.status(500).json({mssg:error.message})
    }
}