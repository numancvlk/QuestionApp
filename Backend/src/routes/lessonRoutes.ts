//LIBRARY
import express from "express";

//MY SCRIPTS
import {
  getLessonsByLanguage,
  createLesson,
} from "../controllers/lessonController";
import { protect, authorizeRoles } from "../middleware/authMiddleware";

const ROUTER = express.Router();

ROUTER.get("/:languageId", getLessonsByLanguage);

ROUTER.post("/", protect, authorizeRoles("admin"), createLesson);

export default ROUTER;
