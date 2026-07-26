import express from "express"
const router=express.Router();
import { authenticate } from "../middlewear/authenticate.js";

import {createProject,getProjectById,getAllProjects,updateProject,deleteProject,inviteMember,getProjectMembers,removeMember,updateMemberRole} from "../controller/projectcontroller.js";

router.post("/", authenticate, createProject);

router.get("/", authenticate, getAllProjects);

router.get("/:id", authenticate, getProjectById);

router.patch("/:id", authenticate, updateProject);

router.delete("/:id", authenticate, deleteProject);



//member management


router.post("/:projectId/members", authenticate, inviteMember);
router.get("/:projectId/members", authenticate, getProjectMembers);
router.patch("/:projectId/members/:memberId", authenticate, updateMemberRole);
router.delete("/:projectId/members/:memberId", authenticate, removeMember);


export default router;
