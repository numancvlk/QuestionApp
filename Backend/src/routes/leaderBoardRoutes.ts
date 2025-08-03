//LIBRARY
import express from "express";

//MY SCRIPTS
import {
  getCurrentLeaderboard,
  getPastLeaderboards,
  updateLeaderboardScore,
  resetMonthlyScores,
} from "../controllers/leaderBoardController";
import { protect, authorizeRoles } from "../middleware/authMiddleware";

const ROUTER = express.Router();

ROUTER.get("/current", getCurrentLeaderboard);

ROUTER.get("/past", getPastLeaderboards);

//BELKİ KULLANILIR KALSINLAR YİNE
ROUTER.post("/update", protect, updateLeaderboardScore);

ROUTER.post("/reset", protect, authorizeRoles("admin"), resetMonthlyScores);

export default ROUTER;
