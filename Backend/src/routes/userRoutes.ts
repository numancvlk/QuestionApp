//LIBRARY
import { Router } from "express";

//MY SCRIPTS
import {
  selectLanguage,
  getUserProfile,
  completeLesson,
} from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const ROUTER = Router();

ROUTER.post("/select-language", protect, selectLanguage);

ROUTER.get("/profile", protect, getUserProfile);

ROUTER.post("/complete-lesson", protect, completeLesson);

export default ROUTER;
