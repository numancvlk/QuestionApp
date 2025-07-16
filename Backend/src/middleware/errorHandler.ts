import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "Unexpected Server Error";
  }

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  } else {
    console.error(`ERROR ${statusCode}: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: message,
  });
};

export default errorHandler;
