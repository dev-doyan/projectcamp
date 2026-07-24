import db from "../db/index.js"
import { projectTable } from "../models/projectModel.js";



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
// export const getAllprojects
// export const getProjectById
// export const updateProject
// export const deleteProject
