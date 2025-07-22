//LIBRARY
import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

//MY SCRIPTS
import Lesson, { IQuestionInLesson } from "../models/Lesson";
import User, { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

interface IQuestionForFrontend {
  _id: string;
  question: string;
  options: string[];
  lessonId: string;
  type: string;
}

export const getLessonsByLanguage = asyncHandler(
  async (req: Request, res: Response) => {
    const { languageId } = req.params;

    const lessons = await Lesson.find({ language: languageId })
      .sort({ level: 1, order: 1 })
      .populate("language", "name displayName");

    if (!lessons || lessons.length === 0) {
      res.status(404);
      throw new Error("No lessons found for this language.");
    }

    res.status(200).json({
      success: true,
      lessons,
      message: "Lessons fetched successfully.",
    });
  }
);

export const getLessonById = asyncHandler(
  async (req: Request, res: Response) => {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      res.status(404);
      throw new Error("Lesson not found.");
    }
    res.status(200).json({ success: true, lesson });
  }
);

export const createLesson = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== "admin") {
      res.status(403);
      throw new Error("You are not authorized to perform this action.");
    }

    const { title, description, language, level, order, exercises } = req.body;

    if (
      !title ||
      !language ||
      !level ||
      order === undefined ||
      !mongoose.Types.ObjectId.isValid(language)
    ) {
      res.status(400);
      throw new Error(
        "Title, language (valid ID), level, and order are required fields."
      );
    }

    if (
      !Array.isArray(exercises) ||
      exercises.length === 0 ||
      exercises.some((ex) => {
        if (
          !ex.question ||
          !ex.type ||
          !Array.isArray(ex.correctAnswer) ||
          ex.correctAnswer.length === 0
        ) {
          return true;
        }

        if (ex.type === "multipleChoice") {
          return !Array.isArray(ex.options) || ex.options.length === 0;
        }
        return !Array.isArray(ex.options);
      })
    ) {
      res.status(400);
      throw new Error("Invalid or incomplete exercises format.");
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
      message: "Lesson created successfully.",
    });
  }
);

export const getRandomLessonQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { languageId, level } = req.query;

    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    if (!languageId) {
      res.status(400);
      throw new Error("languageId is required.");
    }
    if (!mongoose.Types.ObjectId.isValid(languageId as string)) {
      res.status(400);
      throw new Error("Invalid languageId format.");
    }

    const filter: any = {
      language: new mongoose.Types.ObjectId(languageId as string),
    };
    if (
      level &&
      ["Beginner", "Intermediate", "Advanced", "Expert"].includes(
        level as string
      )
    ) {
      filter.level = level;
    }

    const lessons = await Lesson.find(filter).select("exercises");

    if (!lessons || lessons.length === 0) {
      res.status(404);
      throw new Error(
        "No lessons found for the specified language and level, or lessons contain no exercises."
      );
    }

    const allQuestions: (IQuestionInLesson & {
      lessonId: mongoose.Types.ObjectId;
    })[] = [];

    lessons.forEach((lesson) => {
      lesson.exercises.forEach((exercise) => {
        allQuestions.push({
          ...((exercise as any).toObject() as IQuestionInLesson),
          lessonId: lesson._id as mongoose.Types.ObjectId,
        });
      });
    });

    if (allQuestions.length === 0) {
      res.status(404);
      throw new Error(
        "No questions found in lessons for the specified criteria."
      );
    }

    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const randomQuestion = allQuestions[randomIndex];

    const { correctAnswer, ...questionToSend } = randomQuestion;

    const finalQuestionForFrontend = {
      _id: questionToSend._id.toString(),
      question: questionToSend.question,
      options: questionToSend.options,
      lessonId: questionToSend.lessonId.toString(),
      type: questionToSend.type,
    };

    res.status(200).json({ success: true, question: finalQuestionForFrontend });
  }
);

export const getDailyLessonQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    const { languageId } = req.params;

    if (!languageId) {
      res.status(400);
      throw new Error("languageId is required.");
    }
    if (!mongoose.Types.ObjectId.isValid(languageId as string)) {
      res.status(400);
      throw new Error("Invalid languageId format.");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastDailyQuestionAnswered) {
      const lastAnsweredDate = new Date(user.lastDailyQuestionAnswered);
      lastAnsweredDate.setHours(0, 0, 0, 0);

      if (lastAnsweredDate.getTime() === today.getTime()) {
        res.status(403);
        const nextAttemptTime = new Date(today);
        nextAttemptTime.setDate(today.getDate() + 1);
        throw new Error(
          `Daily question already answered. Next question available on ${nextAttemptTime.toLocaleDateString(
            "en-US",
            { day: "numeric", month: "long", year: "numeric" }
          )}.`
        );
      }
    }

    const filter: any = {
      language: new mongoose.Types.ObjectId(languageId as string),
    };
    const lessons = await Lesson.find(filter).select("exercises");

    if (!lessons || lessons.length === 0) {
      res.status(404);
      throw new Error(
        "No lessons found for the specified language, or lessons contain no exercises."
      );
    }

    const allQuestions: (IQuestionInLesson & {
      lessonId: mongoose.Types.ObjectId;
    })[] = [];
    lessons.forEach((lesson) => {
      lesson.exercises.forEach((exercise) => {
        allQuestions.push({
          ...((exercise as any).toObject() as IQuestionInLesson),
          lessonId: lesson._id as mongoose.Types.ObjectId,
        });
      });
    });

    if (allQuestions.length === 0) {
      res.status(404);
      throw new Error(
        "No questions found in lessons for the specified language."
      );
    }

    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    const dailyQuestion = allQuestions[randomIndex];

    const { correctAnswer, ...questionToSend } = dailyQuestion;

    const finalQuestionForFrontend = {
      _id: questionToSend._id.toString(),
      question: questionToSend.question,
      options: questionToSend.options,
      lessonId: questionToSend.lessonId.toString(),
      type: questionToSend.type,
    };

    res.status(200).json({ success: true, question: finalQuestionForFrontend });
  }
);

export const getQuickQuizQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { languageId, level } = req.query;

    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    if (!languageId) {
      res.status(400);
      throw new Error("languageId is required.");
    }
    if (!mongoose.Types.ObjectId.isValid(languageId as string)) {
      res.status(400);
      throw new Error("Invalid languageId format.");
    }

    const filter: any = {
      language: new mongoose.Types.ObjectId(languageId as string),
    };
    if (
      level &&
      ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"].includes(
        level as string
      )
    ) {
      filter.level = level;
    }

    const lessons = await Lesson.find(filter).select("exercises");

    if (!lessons || lessons.length === 0) {
      res.status(404);
      throw new Error(
        "No lessons found for the specified language and level, or lessons contain no exercises."
      );
    }

    const allQuestions: (IQuestionInLesson & {
      lessonId: mongoose.Types.ObjectId;
    })[] = [];

    lessons.forEach((lesson) => {
      lesson.exercises.forEach((exercise) => {
        allQuestions.push({
          ...((exercise as any).toObject() as IQuestionInLesson),
          lessonId: lesson._id as mongoose.Types.ObjectId,
        });
      });
    });

    if (allQuestions.length === 0) {
      res.status(404);
      throw new Error(
        "No questions found in lessons for the specified criteria."
      );
    }

    const numberOfQuestions = 5;
    const selectedQuestions: (IQuestionForFrontend & {
      lessonId: mongoose.Types.ObjectId;
    })[] = [];
    const questionsPool = [...allQuestions];

    for (let i = 0; i < numberOfQuestions && questionsPool.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * questionsPool.length);
      const question = questionsPool.splice(randomIndex, 1)[0];

      const { correctAnswer, ...questionForFrontend } = question;

      selectedQuestions.push({
        _id: questionForFrontend._id.toString(),
        question: questionForFrontend.question,
        options: questionForFrontend.options,
        lessonId: questionForFrontend.lessonId.toString(),
        type: questionForFrontend.type,
      } as IQuestionForFrontend & { lessonId: mongoose.Types.ObjectId });
    }

    if (selectedQuestions.length === 0) {
      res.status(404);
      throw new Error("Could not select enough questions for the quick quiz.");
    }

    res.status(200).json({ success: true, questions: selectedQuestions });
  }
);

export const getTimedQuizQuestions = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { languageId, level } = req.query;

    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    if (!languageId) {
      res.status(400);
      throw new Error("languageId is required.");
    }
    if (!mongoose.Types.ObjectId.isValid(languageId as string)) {
      res.status(400);
      throw new Error("Invalid languageId format.");
    }

    const filter: any = {
      language: new mongoose.Types.ObjectId(languageId as string),
    };
    if (
      level &&
      ["Beginner", "Intermediate", "Advanced", "Expert"].includes(
        level as string
      )
    ) {
      filter.level = level;
    }

    const lessons = await Lesson.find(filter).select("exercises");

    if (!lessons || lessons.length === 0) {
      res.status(404);
      throw new Error(
        "No lessons found for the specified language and level, or lessons contain no exercises."
      );
    }

    const allQuestions: (IQuestionInLesson & {
      lessonId: mongoose.Types.ObjectId;
    })[] = [];

    lessons.forEach((lesson) => {
      lesson.exercises.forEach((exercise) => {
        allQuestions.push({
          ...((exercise as any).toObject() as IQuestionInLesson),
          lessonId: lesson._id as mongoose.Types.ObjectId,
        });
      });
    });

    if (allQuestions.length === 0) {
      res.status(404);
      throw new Error(
        "No questions found in lessons for the specified criteria."
      );
    }

    const numberOfQuestions = 10;
    const selectedQuestions: (IQuestionForFrontend & {
      lessonId: mongoose.Types.ObjectId;
    })[] = [];
    const questionsPool = [...allQuestions];

    for (let i = 0; i < numberOfQuestions && questionsPool.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * questionsPool.length);
      const question = questionsPool.splice(randomIndex, 1)[0];

      const { correctAnswer, ...questionForFrontend } = question;

      selectedQuestions.push({
        _id: questionForFrontend._id.toString(),
        question: questionForFrontend.question,
        options: questionForFrontend.options,
        lessonId: questionForFrontend.lessonId.toString(),
        type: questionForFrontend.type,
      } as IQuestionForFrontend & { lessonId: mongoose.Types.ObjectId });
    }

    if (selectedQuestions.length === 0) {
      res.status(404);
      throw new Error("Could not select enough questions for the timed quiz.");
    }

    res.status(200).json({ success: true, questions: selectedQuestions });
  }
);

export const checkDailyQuizAnswer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    const { questionId, selectedAnswer } = req.body;

    if (!questionId || !selectedAnswer) {
      res.status(400);
      throw new Error("Question ID and selected answer are required.");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found.");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (user.lastDailyQuestionAnswered) {
      const lastAnsweredDate = new Date(user.lastDailyQuestionAnswered);
      lastAnsweredDate.setHours(0, 0, 0, 0);
      if (lastAnsweredDate.getTime() === today.getTime()) {
        res.status(403);
        throw new Error("Daily question already answered today.");
      }
    }

    const lesson = await Lesson.findOne({ "exercises._id": questionId });
    if (!lesson) {
      res.status(404);
      throw new Error("Question not found.");
    }

    const exercise = lesson.exercises.find(
      (ex) => ex._id?.toString() === questionId
    );
    if (!exercise) {
      res.status(404);
      throw new Error("Exercise not found within the lesson.");
    }

    const isCorrect = exercise.correctAnswer.includes(selectedAnswer);
    let explanation = "Bu sorunun cevabı hakkında ek bilgi...";

    if (isCorrect) {
      user.globalScore = (user.globalScore || 0) + 10; // Örnek puan: 10
      user.lastDailyQuestionAnswered = new Date();
    } else {
      user.lastDailyQuestionAnswered = new Date();
    }

    await user.save();
    res.status(200).json({
      success: true,
      isCorrect,
      explanation: explanation,
      pointsEarned: isCorrect ? 10 : 0,
      message: isCorrect
        ? "Doğru cevap! Puanınız güncellendi."
        : "Yanlış cevap.",
    });
  }
);

export const checkAnswer = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { questionId, selectedAnswer } = req.body;
    if (!req.user) {
      res.status(401);
      throw new Error("User not authenticated.");
    }

    if (
      !questionId ||
      selectedAnswer === undefined ||
      selectedAnswer === null
    ) {
      res.status(400);
      throw new Error("Question ID and selected answer are required.");
    }

    const lesson = await Lesson.findOne({ "exercises._id": questionId });

    if (!lesson) {
      res.status(404);
      throw new Error("Question not found within any lesson.");
    }

    const question: IQuestionInLesson | undefined = lesson.exercises.find(
      (ex) => ex._id.toString() === questionId
    );

    if (!question) {
      res.status(404);
      throw new Error("Question not found within the identified lesson.");
    }

    let isCorrect = false;
    let pointsEarned = 0;
    let explanation = question.explanation || "Açıklama mevcut değil.";

    if (question.type === "multipleChoice") {
      isCorrect = question.correctAnswer.some(
        (ans) =>
          ans.toLowerCase().trim() === selectedAnswer.toLowerCase().trim()
      );
    } else if (
      question.type === "text" ||
      question.type === "fillInTheBlanks"
    ) {
      if (question.correctAnswer.length > 0) {
        isCorrect =
          question.correctAnswer[0].toLowerCase().trim() ===
          selectedAnswer.toLowerCase().trim();
      }
    } else {
      res.status(400);
      throw new Error("Unsupported question type for checking answer.");
    }

    if (isCorrect) {
      pointsEarned = 10;
      const user = await User.findById(req.user._id);
      if (user) {
        user.globalScore = (user.globalScore || 0) + pointsEarned;
        await user.save();
      }
    } else {
      explanation =
        question.explanation ||
        `Doğru cevap: "${question.correctAnswer.join(", ")}" idi.`;
    }

    res.status(200).json({
      isCorrect,
      explanation,
      pointsEarned,
      message: isCorrect ? "Cevap doğru!" : "Cevap yanlış.",
    });
  }
);
