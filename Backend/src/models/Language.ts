//LIBRARY
import mongoose, { Document, Schema } from "mongoose";

export interface ILanguage extends Document {
  name: string;
  displayName: string;
  iconUrl?: string;
  description?: string;
}

const LanguageSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    displayName: { type: String, required: true, trim: true },
    iconUrl: { type: String },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

const Language = mongoose.model<ILanguage>("Language", LanguageSchema);
export default Language;
