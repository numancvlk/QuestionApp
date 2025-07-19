//LIBRARY
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

//MY SCRIPTS
import User, { IUser } from "../models/User";

dotenv.config();

interface CustomError extends Error {
  statusCode?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    const error: CustomError = new Error("No token, authorization denied.");
    error.statusCode = 401;
    return next(error);
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is not defined in environment variables for token verification."
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      const error: CustomError = new Error("User not found.");
      error.statusCode = 404;
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    const err: CustomError = new Error("Token is not valid or expired.");
    err.statusCode = 401;
    next(err);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error: CustomError = new Error(
        `Role (${req.user?.role}) is not authorized to access this route.`
      );
      error.statusCode = 403;
      return next(error);
    }
    next();
  };
};
