//LIBRARY
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

//MY SCRIPTS
import { connectDB } from "./config";
import authRoutes from "./routes/authRoutes";
import errorHandler from "./middleware/errorHandler";

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

//ROUTES
app.use("/api/auth", authRoutes);

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
