// LIBRARY
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

// MY SCRIPTS
import User, { IUser } from "../models/User";
import Lesson from "../models/Lesson";

export const selectLanguage = async (req: Request, res: Response) => {
  const { languageId } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated." });
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

    res.json({
      message: "Language selected successfully!",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error selecting language:", error);
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
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error." });
  }
};

export const updateUserProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401);
      throw new Error("Kullanıcı kimliği doğrulanamadı.");
    }

    const user = await User.findById(userId);

    if (user) {
      user.username = req.body.username || user.username;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();

      const userResponse = updatedUser.toObject({
        getters: true,
        virtuals: true,
      });

      res.json({
        success: true,
        message: "Profil başarıyla güncellendi.",
        user: userResponse,
      });
    } else {
      res.status(404);
      throw new Error("Kullanıcı bulunamadı.");
    }
  }
);

export const completeLesson = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { lessonId, earnedPoints } = req.body;

    if (!userId) {
      res.status(401);
      throw new Error("Kullanıcı kimliği doğrulanamadı.");
    }

    if (!lessonId || earnedPoints === undefined || earnedPoints < 0) {
      res.status(400);
      throw new Error(
        "Ders ID'si ve kazanılan puanlar zorunludur ve puanlar pozitif olmalıdır."
      );
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      res.status(400);
      throw new Error("Geçersiz ders ID formatı.");
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      res.status(404);
      throw new Error("Tamamlanmaya çalışılan ders bulunamadı.");
    }

    const foundUser = await User.findById(userId);

    if (foundUser) {
      foundUser.globalScore += earnedPoints;

      const selectedLangId = foundUser.selectedLanguageId?.toString();

      if (selectedLangId) {
        type LanguageProgressValue =
          typeof foundUser.languageProgress extends Map<any, infer V> ? V : any;

        let langProgressData: LanguageProgressValue | undefined =
          foundUser.languageProgress.get(selectedLangId);

        if (!langProgressData) {
          langProgressData = {
            completedLessonIds: [],
            lastVisitedLessonId: null,
          };
        }

        const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

        if (
          !langProgressData.completedLessonIds.some((id) =>
            id.equals(lessonObjectId)
          )
        ) {
          langProgressData.completedLessonIds.push(lessonObjectId);
        }

        langProgressData.lastVisitedLessonId = lessonObjectId;

        foundUser.languageProgress.set(selectedLangId, langProgressData);
      } else {
        console.warn(
          `Kullanıcı ${foundUser.username} (${foundUser._id}) için seçili dil bulunamadı. Ders tamamlanması dil ilerlemesine kaydedilemedi.`
        );
      }

      await foundUser.save();

      const userResponse = foundUser.toObject();

      res.status(200).json({
        success: true,
        message: "Ders başarıyla tamamlandı ve puanlar güncellendi.",
        user: userResponse,
      });
    } else {
      res.status(404);
      throw new Error("Kullanıcı bulunamadı.");
    }
  }
);
