import { NextFunction, Request, Response } from "express";
import { User } from "../modals/User.js";
import ErrorHandler from "../utils/utility-class.js";

export const adminOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.query;
  if (!id) {
    return next(new ErrorHandler("Please make sure you are logged in", 401));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("Spam user detected", 401));
  }
  if (user.role !== "admin") {
    return next(
      new ErrorHandler("You are currently unauthorized to proceed", 403)
    );
  }

  next();
};

export const adminOrDistributorOnly = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.query;
  if (!id) {
    return next(new ErrorHandler("Please make sure you are logged in", 401));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new ErrorHandler("Spam user detected", 401));
  }
  if (user.role !== "admin" && user.role !== "distributor") {
    return next(
      new ErrorHandler("You are currently unauthorized to proceed", 403)
    );
  }

  next();
};
