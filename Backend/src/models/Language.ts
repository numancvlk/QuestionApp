//LIBRARY
import mongoose, { Schema, Document as MoongoseDocument } from "mongoose";

export interface ILanguage extends MoongoseDocument {
  name: string;
  description?: string;
}

const LanguageSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const Language = mongoose.model<ILanguage>("Language", LanguageSchema);
export default Language;
