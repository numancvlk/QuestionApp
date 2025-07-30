import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import LeaderboardEntry, {
  ILeaderboardEntry,
} from "../models/LeaderboardEntry";
import { IUser } from "../models/User";
import { format, subMonths } from "date-fns";
import { Types, Document } from "mongoose";

interface LeaderboardPublicEntry {
  rank: number;
  userId: string;
  username: string;
  profileImageUri: string | null;
  score: number;
}

interface PastLeaderboardData {
  month: string;
  year: number;
  data: LeaderboardPublicEntry[];
}

interface AuthRequest extends Request {
  user?: IUser;
}

function isPopulatedUser(
  doc: Types.ObjectId | (IUser & Document)
): doc is IUser & Document {
  return (
    !(doc instanceof Types.ObjectId) &&
    doc !== null &&
    typeof doc === "object" &&
    "_id" in doc
  );
}

export const getCurrentLeaderboard = asyncHandler(
  async (req: Request, res: Response<LeaderboardPublicEntry[]>) => {
    const currentMonthYear = format(new Date(), "yyyy-MM");

    const leaderboard = await LeaderboardEntry.find({
      monthYear: currentMonthYear,
    })
      .sort({ score: -1 })
      .limit(100)
      .populate<{ userId: IUser & Document }>(
        "userId",
        "username profileImage"
      );

    const rankedLeaderboard: LeaderboardPublicEntry[] = leaderboard.map(
      (entry, index) => {
        if (!isPopulatedUser(entry.userId)) {
          const unpopulatedUserId = entry.userId as Types.ObjectId;
          console.warn(
            `User ID ${unpopulatedUserId.toString()} was not populated for leaderboard entry.`
          );
          return {
            rank: index + 1,
            userId: unpopulatedUserId.toString(),
            username: "Unknown User",
            profileImageUri: null,
            score: entry.score,
          };
        }

        const user = entry.userId;

        return {
          rank: index + 1,
          userId: user._id.toString(),
          username: user.username,
          profileImageUri: user.profileImage || null,
          score: entry.score,
        };
      }
    );

    res.status(200).json(rankedLeaderboard);
  }
);

export const getPastLeaderboards = asyncHandler(
  async (req: Request, res: Response<PastLeaderboardData | null>) => {
    const today = new Date();
    const lastMonthDate = subMonths(today, 1);
    const monthYearFormat = format(lastMonthDate, "yyyy-MM");
    const monthDisplayName = format(lastMonthDate, "MMMM yyyy");

    const leaderboard = await LeaderboardEntry.find({
      monthYear: monthYearFormat,
    })
      .sort({ score: -1 })
      .limit(100)
      .populate<{ userId: IUser & Document }>(
        "userId",
        "username profileImage"
      );

    const rankedLeaderboard: LeaderboardPublicEntry[] = leaderboard.map(
      (entry, index) => {
        if (!isPopulatedUser(entry.userId)) {
          const unpopulatedUserId = entry.userId as Types.ObjectId;
          console.warn(
            `User ID ${unpopulatedUserId.toString()} was not populated for past leaderboard entry.`
          );
          return {
            rank: index + 1,
            userId: unpopulatedUserId.toString(),
            username: "Unknown User",
            profileImageUri: null,
            score: entry.score,
          };
        }
        const user = entry.userId;

        return {
          rank: index + 1,
          userId: user._id.toString(),
          username: user.username,
          profileImageUri: user.profileImage || null,
          score: entry.score,
        };
      }
    );

    if (rankedLeaderboard.length > 0) {
      res.status(200).json({
        month: monthDisplayName,
        year: lastMonthDate.getFullYear(),
        data: rankedLeaderboard,
      });
    } else {
      res.status(200).json(null);
    }
  }
);

//ALTTAKİ İKİLİYİ KULLANIRMIYIM KULLANMAZMIYIM BİLEMİYORUM ŞİMDİLİK KALSINLAR
export const updateLeaderboardScore = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      res.status(401);
      throw new Error(
        "Not authorized, user not found from authentication middleware."
      );
    }

    const currentScore = authenticatedUser.globalScore;

    const currentMonthYear = format(new Date(), "yyyy-MM");

    let leaderboardEntry: ILeaderboardEntry | null =
      await LeaderboardEntry.findOne({
        userId: authenticatedUser._id,
        monthYear: currentMonthYear,
      });

    const userProfileImageUri = authenticatedUser.profileImage || null;

    if (leaderboardEntry) {
      if (currentScore > leaderboardEntry.score) {
        leaderboardEntry.score = currentScore;
        leaderboardEntry.lastUpdated = new Date();
        leaderboardEntry.username = authenticatedUser.username;
        leaderboardEntry.profileImageUri = userProfileImageUri;
        await leaderboardEntry.save();
        res.status(200).json({
          message: "Leaderboard score updated successfully.",
          entry: leaderboardEntry,
        });
      } else {
        res.status(200).json({
          message: "New score is lower or equal, no update performed.",
        });
      }
    } else {
      leaderboardEntry = await LeaderboardEntry.create({
        userId: authenticatedUser._id,
        username: authenticatedUser.username,
        profileImageUri: userProfileImageUri,
        score: currentScore,
        monthYear: currentMonthYear,
      });
      res.status(201).json({
        message: "New entry added to leaderboard.",
        entry: leaderboardEntry,
      });
    }
  }
);

export const resetMonthlyScores = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      res.status(403);
      throw new Error(
        "Not authorized to perform this action. Admin access required."
      );
    }

    console.log(
      `Leaderboard reset process triggered for ${format(
        new Date(),
        "MMMM yyyy"
      )}.`
    );
    res.status(200).json({
      message: "Leaderboard reset process triggered successfully (logical).",
    });
  }
);
