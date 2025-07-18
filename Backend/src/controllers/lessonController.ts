//LIBRARY
import { Request, Response, NextFunction } from "express";

//MY SCRIPTS
import Lesson from "../models/Lesson";

interface CustomError extends Error {
  statusCode?: number;
}

export const getLessonsByLanguage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { languageId } = req.params;

    const lessons = await Lesson.find({ language: languageId })
      .sort({ level: 1, order: 1 })
      .populate("language", "name");

    if (!lessons || lessons.length === 0) {
      return res.status(404).json({ message: "Bu dil için ders bulunamadı." });
    }

    res.status(200).json({
      success: true,
      lessons,
      message: "Dersler başarıyla getirildi.",
    });
  } catch (error) {
    console.error("Dersleri getirirken hata:", error);
    const err: CustomError = new Error("Sunucu hatası: Dersler getirilemedi.");
    err.statusCode = 500;
    next(err);
  }
};

export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      const error: CustomError = new Error("Bu işlemi yapmaya yetkiniz yok.");
      error.statusCode = 403;
      return next(error);
    }

    const { title, description, language, level, order, exercises } = req.body;

    if (!title || !language || !level || order === undefined) {
      const error: CustomError = new Error(
        "Başlık, dil, seviye ve sıralama bilgileri zorunludur."
      );
      error.statusCode = 400;
      return next(error);
    }

    const newLesson = new Lesson({
      title,
      description,
      language,
      level,
      order,
      exercises: exercises || [],
    });

    await newLesson.save();

    res.status(201).json({
      success: true,
      lesson: newLesson,
      message: "Ders başarıyla oluşturuldu.",
    });
  } catch (error) {
    console.error("Ders oluşturulurken hata:", error);
    const err: CustomError = new Error("Sunucu hatası: Ders oluşturulamadı.");
    err.statusCode = 500;
    next(err);
  }
};
