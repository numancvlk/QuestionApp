// LIBRARY
import { Router } from "express";

//MY SCRIPTS
import {
  selectLanguage,
  getUserProfile,
  completeLesson,
  updateUserProfile,
  updateGlobalScore,
  getDailyQuestionStatus,
} from "../controllers/userController";

import { protect } from "../middleware/authMiddleware";

const ROUTER = Router();

ROUTER.post("/select-language", protect, selectLanguage);

ROUTER.get("/profile", protect, getUserProfile);

ROUTER.put("/profile", protect, updateUserProfile);

ROUTER.post("/complete-lesson", protect, completeLesson);

ROUTER.post("/update-global-score", protect, updateGlobalScore);

ROUTER.get("/daily-status", protect, getDailyQuestionStatus);

export default ROUTER;
