//LIBRARY
import { Router } from "express";

//MY SCRIPTS
import {
  getLanguages,
  getLearningPath,
  createLanguage,
} from "../controllers/languageController";
import { protect, authorizeRoles } from "../middleware/authMiddleware";

const ROUTER = Router();

ROUTER.get("/", getLanguages);

ROUTER.get("/:languageId/learning-path", protect, getLearningPath);

ROUTER.post("/", protect, authorizeRoles("admin"), createLanguage);

export default ROUTER;
