import db from "../db/index.js"
import { projectTable } from "../models/projectModel.js";
import {eq} from "drizzle-orm"



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
}).returning({name:projectTable.name,
    description:projectTable.description,
    createdby:projectTable.ownerId
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