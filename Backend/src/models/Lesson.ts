//LIBRARY
import mongoose, { Document, Schema } from "mongoose";

export interface IQuestionInLesson {
  _id: mongoose.Types.ObjectId;
  question: string;
  options: string[];
  correctAnswer: string[];
  type: "multipleChoice" | "text" | "fillInTheBlanks";
  explanation?: string;
}

export interface ILesson extends Document {
  title: string;
  description?: string;
  language: mongoose.Types.ObjectId;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  order: number;
  exercises: IQuestionInLesson[];
}

const LessonSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    language: { type: Schema.Types.ObjectId, ref: "Language", required: true },
    level: {
      type: String,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
      required: true,
    },
    order: { type: Number, required: true },
    exercises: [
      {
        question: { type: String, required: true },
        options: { type: [String], required: true },
        correctAnswer: { type: [String], required: true },
        type: {
          type: String,
          required: true,
          enum: ["multipleChoice", "text", "fillInTheBlanks"],
        },
      },
    ],
  },
  { timestamps: true }
);

const Lesson = mongoose.model<ILesson>("Lesson", LessonSchema);
export default Lesson;
