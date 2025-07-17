//LIBRARY
import { Request, Response } from "express";

//MY SCRIPTS
import Language, { ILanguage } from "../models/Language";

export const getLanguages = async (req: Request, res: Response) => {
  try {
    const languages: ILanguage[] = await Language.find({});
    res.json(languages);
  } catch (error) {
    res.status(500).json({ message: "Server error while fetching languages." });
  }
};

export const getLearningPath = async (req: Request, res: Response) => {
  try {
    const { languageId } = req.params;
    const language: ILanguage | null = await Language.findById(languageId);

    if (!language) {
      return res.status(404).json({ message: "Language not found." });
    }

    const learningPath = [
      {
        id: "mod1",
        title: `${language.name} - Module 1: Basics`,
        lessons: [{ id: "lesson1", title: "Variables" }],
      },
      {
        id: "mod2",
        title: `${language.name} - Module 2: Functions`,
        lessons: [{ id: "lesson2", title: "Arrow Functions" }],
      },
    ];

    res.json(learningPath);
  } catch (error) {
    console.error("Error fetching learning path");
    res
      .status(500)
      .json({ message: "Server error while fetching learning path." });
  }
};
