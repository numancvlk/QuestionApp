//LIBRARY
import express from "express";
import {
  getLessonsByLanguage,
  getLessonById,
  createLesson,
} from "../controllers/lessonController";

import { protect, authorizeRoles } from "../middleware/authMiddleware";

const ROUTER = express.Router();

ROUTER.get("/by-language/:languageId", getLessonsByLanguage);

ROUTER.get("/:lessonId", getLessonById);

ROUTER.post("/", protect, authorizeRoles("admin"), createLesson);

export default ROUTER;
