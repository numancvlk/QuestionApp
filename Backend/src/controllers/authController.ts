//LIBRARY
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

//MY SCRIPTS
import User from "../models/User";

dotenv.config();

interface CustomError extends Error {
  statusCode?: number;
}

const generateToken = async (id: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "1h",
  });
};

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      const error: CustomError = new Error("Please fill in all fields.");
      error.statusCode = 400;
      return next(error);
    }

    if (password.length < 6) {
      const error: CustomError = new Error(
        "Password must be at least 6 characters."
      );
      error.statusCode = 400;
      return next(error);
    }

    if (!/[A-Z]/.test(password)) {
      const error: CustomError = new Error(
        "The password must contain at least one uppercase letter."
      );
      error.statusCode = 400;
      return next(error);
    }
    if (!/[a-z]/.test(password)) {
      const error: CustomError = new Error(
        "The password must contain at least one lowercase letter."
      );
      error.statusCode = 400;
      return next(error);
    }
    if (!/[0-9]/.test(password)) {
      const error: CustomError = new Error(
        "The password must contain at least one number."
      );
      error.statusCode = 400;
      return next(error);
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      const error: CustomError = new Error(
        "The password must contain at least one special character."
      );
      error.statusCode = 400;
      return next(error);
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      const error: CustomError = new Error(
        "The username or email address is already in use."
      );
      error.statusCode = 400;
      return next(error);
    }

    const newUser = new User({
      username,
      email,
      passwordHash: password,
    });

    await newUser.save();

    const token = await generateToken(newUser._id!.toString());

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        globalScore: newUser.globalScore,
        dailyStreak: newUser.dailyStreak,
        selectedLanguageId: newUser.selectedLanguageId || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      const error: CustomError = new Error("Please fill in all fields.");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      const error: CustomError = new Error("Username or password is incorrect");
      error.statusCode = 400;
      return next(error);
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      const error: CustomError = new Error("Username or password is incorrect");
      error.statusCode = 400;
      return next(error);
    }

    const token = await generateToken(user._id!.toString());

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        globalScore: user.globalScore,
        dailyStreak: user.dailyStreak,
        selectedLanguageId: user.selectedLanguageId || null,
      },
    });
  } catch (error) {
    next(error);
  }
};
