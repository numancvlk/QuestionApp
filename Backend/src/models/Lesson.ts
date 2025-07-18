//LIBRARY
import mongoose, { Document, Schema } from "mongoose";

export interface IExercise {
  type: "text" | "multipleChoice" | "fillInTheBlanks";
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

export interface ILesson extends Document {
  title: string;
  description?: string;
  language: mongoose.Schema.Types.ObjectId;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  order: number;
  exercises: IExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema: Schema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["text", "multipleChoice", "fillInTheBlanks"],
    },
    question: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: Schema.Types.Mixed,
    explanation: { type: String },
  },
  { _id: true }
);

const LessonSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    language: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Language",
      required: true,
    },
    level: {
      type: String,
      required: true,
      enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"],
    },
    order: { type: Number, required: true, min: 0 },
    exercises: [ExerciseSchema],
  },
  { timestamps: true }
);

const Lesson = mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;
