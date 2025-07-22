// LIBRARY
import express from "express";

//MY SCRIPTS
import {
  getLessonsByLanguage,
  getLessonById,
  createLesson,
  getRandomLessonQuestion,
  getDailyLessonQuestion,
  getQuickQuizQuestions,
  getTimedQuizQuestions,
  checkDailyQuizAnswer,
  checkAnswer,
} from "../controllers/lessonController";

import { protect, authorizeRoles } from "../middleware/authMiddleware";

const ROUTER = express.Router();

ROUTER.get("/by-language/:languageId", getLessonsByLanguage);

ROUTER.get("/:lessonId", getLessonById);

ROUTER.post("/", protect, authorizeRoles("admin"), createLesson);

ROUTER.get("/questions/random", protect, getRandomLessonQuestion);

ROUTER.get("/questions/daily/:languageId", protect, getDailyLessonQuestion);

ROUTER.get("/questions/quick-quiz", protect, getQuickQuizQuestions);

ROUTER.get("/questions/timed-quiz", protect, getTimedQuizQuestions);

ROUTER.post("/questions/daily/check-answer", protect, checkDailyQuizAnswer);

ROUTER.post("/questions/check-answer", protect, checkAnswer);

export default ROUTER;
