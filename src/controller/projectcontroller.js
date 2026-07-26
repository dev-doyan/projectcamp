import db from "../db/index.js"
import { memberTable } from "../models/memberModel.js";
import { userTable } from "../models/userModel.js";
import { projectTable } from "../models/projectModel.js";
import {eq,and} from "drizzle-orm"



export const createProject=async(req,res)=>{
    try {
        const{name,description}=req.body
        const uid=req.user.id;

if(!uid){
    return res.status(401).json({mssg:"user unidentified"})
}

if(!name){
    return res.status(400).json({mssg:"need a name for tthe project "});
}


const project =await db.insert(projectTable).values({
    name,
    description: req.body.description ||null,
    ownerId:uid
}).returning({
    id:projectTable.id,
    name:projectTable.name,
    description:projectTable.description,
    ownerId:projectTable.ownerId
})




//add creator as ownwer in member table
await db.insert(memberTable).values({
    userId:project[0].ownerId,
    projectId:project[0].id,
    role:"owner"

})



return res.status(200).json({mssg:"success",project})


    } catch (error) {
        return res.status(500).json({mssg:error.mssg})
    }
}

export const getProjectById = async (req, res) => {
    try {

        const projectId = req.params.id;
        const ownerId = req.user.id;

        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId));

        if (project.length === 0) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        if (project[0].ownerId !== ownerId) {
            return res.status(403).json({
                message: "You are not authorized to access this project."
            });
        }

        return res.status(200).json({
            success: true,
            project: project[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

//get all projects of particular owner 

export const getAllProjects = async (req, res) => {
    try {

        const ownerId = req.user.id;

        const projects = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.ownerId, ownerId));

        return res.status(200).json({
            success: true,
            count: projects.length,
            projects
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const updateProject = async (req, res) => {
    try {

        const projectId = req.params.id;
        const ownerId = req.user.id;

        const { name, description, status } = req.body;

        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId));

        if (project.length === 0) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        if (project[0].ownerId !== ownerId) {
            return res.status(403).json({
                message: "You are not authorized."
            });
        }

        const updatedProject = await db
            .update(projectTable)
            .set({
                name: name ?? project[0].name,
                description: description ?? project[0].description,
                status: status ?? project[0].status,
                updatedAt: new Date()
            })
            .where(eq(projectTable.id, projectId))
            .returning();

        return res.status(200).json({
            success: true,
            message: "Project updated successfully.",
            project: updatedProject[0]
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



export const deleteProject = async (req, res) => {
    try {

        const projectId = req.params.id;
        const ownerId = req.user.id;

        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId));

        if (project.length === 0) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        if (project[0].ownerId !== ownerId) {
            return res.status(403).json({
                message: "You are not authorized."
            });
        }

        await db
            .delete(projectTable)
            .where(eq(projectTable.id, projectId));

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




export const inviteMember = async (req, res) => {
    try {

        const id = req.user.id;

        const projectId = req.params.projectId;

        const { email, role } = req.body;

        if (!email) {
            return res.status(400).json({ mssg: "need email" });
        }

        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId));

        if (project.length == 0) {
            return res.status(404).json({ mssg: "invalid project id" });
        }

        if (project[0].ownerId != id) {
            return res.status(403).json({
                mssg: "Only the project owner can invite members"
            });
        }

        const user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, email));

        if (user.length == 0) {
            return res.status(404).json({ mssg: "invalid email" });
        }

        const existingMember = await db
            .select()
            .from(memberTable)
            .where(
                and(
                    eq(memberTable.projectId, projectId),
                    eq(memberTable.userId, user[0].id)
                )
            );

        if (existingMember.length > 0) {
            return res.status(409).json({
                mssg: "User is already a member"
            });
        }

        const member = await db
            .insert(memberTable)
            .values({
                role,
                userId: user[0].id,
                projectId: projectId
            })
            .returning();

        return res.status(201).json({
            mssg: "success",
            member
        });

    } catch (error) {
        return res.status(500).json({
            mssg: error.message
        });
    }
};



export const getProjectMembers=async(req,res)=>{
    const id=req.user.id;
    if(!id){
        return res.status(401).json({mssg:"you need to login first"})
    }
    const projectId=req.params.projectId;

const project= await db.select().from(projectTable).where(eq(projectTable.id,projectId));
if(project.length==0){
    return  res.status(404).json({mssg:"project not found "})
}

const user=await db.select().from(memberTable).where(and(
    eq(memberTable.userId,id),
    eq(memberTable.projectId,projectId)
))

if(user.length==0){
    return res.status(403).json({mssg:"you are not a member of this project"})
}

const members=await db.select({name:userTable.name,
    email:userTable.email,
    role:memberTable.role


}).from(memberTable).rightJoin(userTable,eq(userTable.id,memberTable.userId)).where(eq(memberTable.projectId,projectId));
return res.status(200).json({mssg:"succuss",
    members
})



}