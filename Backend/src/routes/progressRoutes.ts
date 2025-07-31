import { Router } from "express";
import {
  checkLessonAnswer,
  completeLesson,
} from "../controllers/lessonController";
import { protect } from "../middleware/authMiddleware";

const ROUTER = Router();

ROUTER.post("/check-lesson-answer", protect, checkLessonAnswer);
ROUTER.post("/complete-lesson", protect, completeLesson);

export default ROUTER;
