import { Router } from "express";
import { updateTaskStatus } from "../controllers/taskController";

const router = Router();
router.patch("/:taskId/status", updateTaskStatus);
export default router;
