import express from "express"
const router=express.Router();
import { authenticate } from "../middlewear/authenticate.js";

import {createProject,getAllprojects,getAllprojects,updateProject,deleteProject} from "../controller/projectcontroller.js";

router.post("/", authenticate, createProject);

router.get("/", authenticate, getAllProjects);

router.get("/:id", authenticate, getProjectById);

router.patch("/:id", authenticate, updateProject);

router.delete("/:id", authenticate, deleteProject);


export default router;
