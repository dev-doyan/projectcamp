import express from "express";
import {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    uploadTaskAttachment,
    deleteTaskAttachment,
} from "../controller/taskcontroller.js";
import upload from "../middlewear/upload.js";
import { authenticate } from "../middlewear/authenticate.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
    upload.single("attachment")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ mssg: err.message });
        }
        next();
    });
};

router.post("/:projectId", authenticate, createTask);
router.get("/:projectId", authenticate, getAllTasks);
router.get("/:projectId/:taskId", authenticate, getTaskById);
router.patch("/:projectId/:taskId", authenticate, updateTask);
router.delete("/:projectId/:taskId", authenticate, deleteTask);

router.post(
    "/:projectId/:taskId/attachment",
    authenticate,
    handleUpload,
    uploadTaskAttachment
);
router.delete(
    "/:projectId/:taskId/attachment",
    authenticate,
    deleteTaskAttachment
);

export default router;