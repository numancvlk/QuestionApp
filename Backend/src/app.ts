//LIBRARY
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

//MY SCRIPTS
import { connectDB } from "./config";
import errorHandler from "./middleware/errorHandler";

//ROUTES
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import languageRoutes from "./routes/languageRoutes";
import lessonRoutes from "./routes/lessonRoutes";
import leaderboardRoutes from "./routes/leaderBoardRoutes";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/leaderboards", leaderboardRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
