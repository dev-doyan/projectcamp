import express from "express";
import {
    createTask,getAllTasks,getTaskById,updateTask,deleteTask
    
} from "../controller/taskcontroller.js";
import upload from "../middlewear/upload.js";

import { authenticate } from "../middlewear/authenticate.js";

const router = express.Router();








router.post("/:projectId", authenticate, createTask);
router.get("/:projectId", authenticate, getAllTasks);
router.get("/:projectId/:taskId", authenticate, getTaskById);
router.patch("/:projectId/:taskId", authenticate, updateTask);
router.delete("/:projectId/:taskId", authenticate, deleteTask);









export default router;