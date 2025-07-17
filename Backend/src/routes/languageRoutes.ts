//LIBRARY
import { Router } from "express";

//MY SCRIPTS
import {
  getLanguages,
  getLearningPath,
} from "../controllers/languageController";
import authMiddleware from "../middleware/authMiddleware";

const ROUTER = Router();

ROUTER.get("/", getLanguages);

ROUTER.get("/:languageId/learning-path", authMiddleware, getLearningPath);

export default ROUTER;
