import db from "../db/index.js"
import { memberTable } from "../models/memberModel.js";
import { userTable } from "../models/userModel.js";
import { projectTable } from "../models/projectModel.js";
import { redis } from "../utils/redis.js";
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

        const membership = await db
            .select()
            .from(memberTable)
            .where(
                and(
                    eq(memberTable.projectId, projectId),
                    eq(memberTable.userId, ownerId)
                )
            );

        if (membership.length === 0) {
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

        // Create a unique Redis key for each user
        const redisKey = `projects:${ownerId}`;

        // 1. Check Redis first
        const cachedProjects = await redis.get(redisKey);

        if (cachedProjects) {

            console.log("Projects fetched from Redis");

            const projects = JSON.parse(cachedProjects);

            return res.status(200).json({
                success: true,
                count: projects.length,
                projects
            });
        }

        // 2. If Redis doesn't have the data,
        // fetch it from PostgreSQL
        const projects = await db
            .select({
                id: projectTable.id,
                name: projectTable.name,
                description: projectTable.description,
                status: projectTable.status,
                ownerId: projectTable.ownerId,
                createdAt: projectTable.createdAt,
                updatedAt: projectTable.updatedAt,
            })
            .from(projectTable)
            .innerJoin(memberTable, eq(memberTable.projectId, projectTable.id))
            .where(eq(memberTable.userId, ownerId));

        // 3. Store the projects in Redis
        // EX 60 = expire after 60 seconds
        await redis.set(
            redisKey,
            JSON.stringify(projects),
            "EX",
            60
        );

        // 4. Return the database result
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

const members=await db.select({
    id: memberTable.id,
    userId: memberTable.userId,
    name:userTable.name,
    email:userTable.email,
    role:memberTable.role
}).from(memberTable).innerJoin(userTable,eq(userTable.id,memberTable.userId)).where(eq(memberTable.projectId,projectId));
return res.status(200).json({mssg:"succuss",
    members
})



}


 export const removeMember=async(req,res)=>{
    try {
        const id=req.user.id;
    const projectId=req.params.projectId;
    const memberId=req.params.memberId;

    if(!id){
        return res.status(401).json({mssg:"you need tto login"})
    }

const doer =await db.select().from(memberTable).where(and(
    eq(memberTable.userId,id),
    eq(memberTable.projectId,projectId)
));

if(doer.length==0 || doer[0].role !="owner"){
    return res.status(403).json({mssg:"you are not the owner or you are not authorised or its the wrong project"})
}




    const member=await db.select().from(memberTable).where(and(eq(memberTable.projectId,projectId),
eq(memberTable.id,memberId)
));
    if(member.length==0){
        return res.status(404).json({mssg:"either wrong member or wring project "})
    }
if(member[0].role=="owner"){
    return res.status(403).json({mssg:"owner cant be deleted"})
}



    const deleteduser=await db.delete(memberTable).where(eq(memberTable.userId,member[0].userId)).returning({userId:memberTable.userId});


    return res.status(200).json({mssg:"member deleted",
        deleteduser
    })







    } catch (error) {
        return res.status(500).json({mssg:error.message})
    }


}


export const updateMemberRole = async (req, res) => {
    try {

        const id = req.user.id;
        const projectId = req.params.projectId;
        const memberId = req.params.memberId;

        const { role } = req.body;

        if (!id) {
            return res.status(401).json({ mssg: "you need to login" });
        }

        if (!role) {
            return res.status(400).json({ mssg: "role is required" });
        }

        const project = await db
            .select()
            .from(projectTable)
            .where(eq(projectTable.id, projectId));

        if (project.length == 0) {
            return res.status(404).json({ mssg: "project not found" });
        }

        if (project[0].ownerId != id) {
            return res.status(403).json({
                mssg: "only project owner can update member role"
            });
        }

        const member = await db
            .select()
            .from(memberTable)
            .where(
                and(
                    eq(memberTable.id, memberId),
                    eq(memberTable.projectId, projectId)
                )
            );

        if (member.length == 0) {
            return res.status(404).json({
                mssg: "member not found"
            });
        }

        if (member[0].role == "owner") {
            return res.status(403).json({
                mssg: "owner role cannot be changed"
            });
        }

        const updatedMember = await db
            .update(memberTable)
            .set({
                role: role
            })
            .where(eq(memberTable.id, memberId))
            .returning();

        return res.status(200).json({
            mssg: "member role updated successfully",
            updatedMember
        });

    } catch (error) {
        return res.status(500).json({
            mssg: error.message
        });
    }
};