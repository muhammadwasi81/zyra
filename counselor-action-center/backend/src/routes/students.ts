import { Router } from "express";
import { getActionCenter } from "../controllers/studentController";

const router = Router();
router.get("/:id/action-center", getActionCenter);
export default router;
