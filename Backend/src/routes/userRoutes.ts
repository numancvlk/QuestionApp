//LIBRARY
import { Router } from "express";

//MY SCRIPTS
import { selectLanguage, getUserProfile } from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";

const ROUTER = Router();

ROUTER.post("/select-language", authMiddleware, selectLanguage);

ROUTER.get("/profile", authMiddleware, getUserProfile);

export default ROUTER;
