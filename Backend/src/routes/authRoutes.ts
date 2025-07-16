//LIBRARY
import { Router } from "express";

//MY SCRIPTS
import { registerUser, loginUser } from "../controllers/authController";

const ROUTER = Router();

ROUTER.post("/register", registerUser);

ROUTER.post("/login", loginUser);

export default ROUTER;
