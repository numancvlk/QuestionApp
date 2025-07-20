//LIBRARY
import { Request, Response, NextFunction } from "express";

//MY SCRIPTS
import Language from "../models/Language";
import Lesson from "../models/Lesson";

interface CustomError extends Error {
  statusCode?: number;
}

export const getLanguages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const languages = await Language.find({});
    res.status(200).json({
      success: true,
      languages,
      message: "Diller başarıyla getirildi.",
    });
  } catch (error) {
    const err: CustomError = new Error("Sunucu hatası: Diller getirilemedi.");
    err.statusCode = 500;
    next(err);
  }
};

export const getLearningPath = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { languageId } = req.params;

  try {
    const lessons = await Lesson.find({ language: languageId }).sort({
      order: 1,
    });

    if (!lessons || lessons.length === 0) {
      return res.status(200).json({
        success: true,
        lessons: [],
        message: "Bu dil için henüz ders bulunamadı.",
      });
    }

    res.status(200).json({
      success: true,
      lessons,
      message: `Learning path for language ${languageId} retrieved successfully.`,
    });
  } catch (error) {
    console.error("Öğrenme yolunu getirirken hata:", error);
    const err: CustomError = new Error(
      "Sunucu hatası: Öğrenme yolu getirilemedi."
    );
    err.statusCode = 500;
    next(err);
  }
};

export const createLanguage = async (
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

    const { name, displayName, iconUrl, description } = req.body;

    if (!name || !displayName) {
      const error: CustomError = new Error(
        "Dil adı ve görünen adı zorunludur."
      );
      error.statusCode = 400;
      return next(error);
    }

    const newLanguage = new Language({
      name: name.toLowerCase(),
      displayName,
      iconUrl,
      description,
    });

    await newLanguage.save();

    res.status(201).json({
      success: true,
      language: newLanguage,
      message: "Dil başarıyla oluşturuldu.",
    });
  } catch (error: any) {
    console.error("Dil oluşturulurken hata:", error);
    if (error.code === 11000) {
      const err: CustomError = new Error("Bu dil adı zaten mevcut.");
      err.statusCode = 409;
      return next(err);
    }
    const err: CustomError = new Error("Sunucu hatası: Dil oluşturulamadı.");
    err.statusCode = 500;
    next(err);
  }
};
