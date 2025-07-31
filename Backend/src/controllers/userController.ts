// LIBRARY
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

// MY SCRIPTS
import User, { IUser, ILanguageProgressValue } from "../models/User";
import Lesson from "../models/Lesson";

interface AuthRequest extends Request {
  user?: IUser;
}

export const selectLanguage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { languageId } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    if (!languageId || !mongoose.Types.ObjectId.isValid(languageId)) {
      res.status(400);
      throw new Error("Invalid languageId.");
    }

    const user: IUser | null = await User.findByIdAndUpdate(
      userId,
      { selectedLanguageId: languageId },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.json({
      message: "Language selected successfully!",
      user: user.toObject(),
    });
  }
);

export const getUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    const user = await User.findById(userId).select("-passwordHash");

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    res.json({
      user: user.toObject(),
    });
  }
);

export const updateUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    const user = await User.findById(userId);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: "Profile updated successfully.",
        user: updatedUser.toObject(),
      });
    } else {
      res.status(404);
      throw new Error("User not found.");
    }
  }
);

export const updateGlobalScore = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    const { points } = req.body;
    if (typeof points !== "number" || points === undefined) {
      res.status(400);
      throw new Error("Invalid points value provided.");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    user.globalScore += points;
    await user.save();

    res.status(200).json({
      message: "Global score updated successfully.",
      user: user.toObject(),
    });
  }
);

export const getDailyQuestionStatus = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasAnsweredToday = false;
    let nextAttemptTime: Date | undefined;

    if (user.lastDailyQuestionAnswered) {
      const lastAnsweredDate = new Date(user.lastDailyQuestionAnswered);
      lastAnsweredDate.setHours(0, 0, 0, 0);

      if (lastAnsweredDate.getTime() === today.getTime()) {
        hasAnsweredToday = true;
      }
    }

    if (hasAnsweredToday) {
      nextAttemptTime = new Date(today);
      nextAttemptTime.setDate(today.getDate() + 1);
    }

    res.status(200).json({ hasAnsweredToday, nextAttemptTime });
  }
);

export const completeLesson = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?._id;
    const { lessonId, earnedPoints, isDailyQuestion = false } = req.body;

    if (!userId) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    if (!lessonId || earnedPoints === undefined || earnedPoints < 0) {
      res.status(400);
      throw new Error(
        "Lesson ID and earned points are required, and points must be positive."
      );
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      res.status(400);
      throw new Error("Invalid lesson ID format.");
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404);
      throw new Error("Lesson to complete not found.");
    }

    const foundUser = await User.findById(userId);

    if (!foundUser) {
      res.status(404);
      throw new Error("User not found.");
    }

    foundUser.globalScore += earnedPoints;

    const selectedLangId = foundUser.selectedLanguageId?.toString();

    if (selectedLangId) {
      let langProgressData = foundUser.languageProgress.get(selectedLangId);

      if (!langProgressData) {
        langProgressData = {
          completedLessonIds: [],
          lastVisitedLessonId: null,
          currentHearts: 3,
        } as ILanguageProgressValue;
      }

      const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

      if (
        !langProgressData.completedLessonIds.some(
          (id: mongoose.Types.ObjectId) => id.equals(lessonObjectId)
        )
      ) {
        langProgressData.completedLessonIds.push(lessonObjectId);
      }

      langProgressData.lastVisitedLessonId = lessonObjectId;

      foundUser.languageProgress.set(selectedLangId, langProgressData);
    } else {
      console.warn(
        `User ${foundUser.username} (${foundUser._id}) has no selected language. Lesson completion not saved to language progress.`
      );
    }

    if (isDailyQuestion) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      foundUser.lastDailyQuestionAnswered = today;
    }

    await foundUser.save();

    res.status(200).json({
      success: true,
      message: "Lesson completed and points updated successfully.",
      user: foundUser.toObject(),
    });
  }
);
