import mongoose, { Document, Schema, Types } from "mongoose";
import { PopulatedDoc } from "mongoose";
import { IUser } from "./User";

export interface ILeaderboardEntry extends Document {
  userId: PopulatedDoc<IUser & mongoose.Document, Types.ObjectId>;
  username: string;
  profileImageUri: string | null;
  score: number;
  monthYear: string;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const leaderboardEntrySchema: Schema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    profileImageUri: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    monthYear: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

leaderboardEntrySchema.index({ userId: 1, monthYear: 1 }, { unique: true });

const LeaderboardEntry = mongoose.model<ILeaderboardEntry>(
  "LeaderboardEntry",
  leaderboardEntrySchema
);

export default LeaderboardEntry;
