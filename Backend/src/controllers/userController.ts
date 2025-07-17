// LIBRARY
import { Request, Response } from "express";

//MY SCRIPTS
import User, { IUser } from "../models/User";

export const selectLanguage = async (req: Request, res: Response) => {
  const { languageId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
  }

  if (!languageId) {
    return res.status(400).json({ message: "Language ID is required." });
  }

  try {
    const user: IUser | null = await User.findByIdAndUpdate(
      userId,
      { selectedLanguageId: languageId },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const userResponse = user.toObject();
    delete userResponse.passwordHash;

    res.json({
      message: "Language selected successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error selecting language");
    res.status(500).json({ message: "Server error while selecting language." });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({
      user: user.toObject(),
    });
  } catch (error) {
    console.error("Error fetching user profile");
    res.status(500).json({ message: "Server error." });
  }
};
