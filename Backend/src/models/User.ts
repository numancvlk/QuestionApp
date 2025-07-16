//LIBRARY
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends mongoose.Document {
  username: string;
  email: string;
  passwordHash: string;
  globalScore: number;
  dailyStreak: number;
  lastActiveDate: Date;
  selectedLanguageId?: string;
  languageProgress: Map<
    string,
    { completedTestIds: string[]; currentMapNodeId: string }
  >;
  achievements: string[];
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username field cannot be empty."],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email field cannot be empty."],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address.",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password field cannot be empty."],
    },
    globalScore: {
      type: Number,
      default: 0,
    },
    dailyStreak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    selectedLanguageId: {
      type: String,
      ref: "Language",
      default: null,
    },
    languageProgress: {
      type: Map,
      of: new mongoose.Schema(
        {
          completedTestIds: {
            type: [String],
            default: [],
          },
          currentMapNodeId: {
            type: String,
            default: null,
          },
        },
        { _id: false }
      ),
      default: {},
    },
    achievements: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
