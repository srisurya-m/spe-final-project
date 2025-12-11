import { NextFunction, Request, Response } from "express";
import { User } from "../modals/User";
import ErrorHandler from "../utils/utility-class";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/features";

export const newUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { name, email, phoneNumber, pincode, photo } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      if (
        photo &&
        (user.photo.includes("googleusercontent.com") ||
          user.photo.includes("thumb_15951118880user_oihuo6.png"))
      ) {
        user.photo = photo;
        await user.save();
      }

      return res.status(200).json({
        success: true,
        message: `Welcome, ${user.name}`,
        user,
      });
    }

    if (!name || !email || !phoneNumber || !pincode)
      return next(new ErrorHandler("Please add all fields", 400));

    user = await User.create({
      name,
      email,
      phoneNumber,
      pincode,
    });

    return res.status(201).json({
      success: true,
      message: `Welcome ${user.name}`,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.log(error);
  }
};

export const changeRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { role, email } = req.body;

    // Find the user whose role is being changed
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user exists with this email",
      });
    }

    const conflictingUser = await User.findOne({
      pincode: user.pincode,
      role: { $in: ["admin", "distributor"] },
      email: { $ne: email },
    });

    if (conflictingUser) {
      return res.status(200).json({
        success: false,
        message: `Role cannot be changed. Pincode ${user.pincode} already has a user with the role of ${conflictingUser.role}.`,
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: `${updatedUser?.name}'s role changed to ${updatedUser?.role}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.query;
    const { targetId } = req.body;

    if (!id || !targetId) {
      return res.status(400).json({
        success: false,
        message: "Distributor or User not found",
      });
    }

    const distributor = await User.findById(id);
    if (!distributor) {
      return res.status(404).json({
        success: false,
        message: "Distributor not found",
      });
    }

    const targetUser = await User.findById(targetId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (distributor.pincode == targetUser.pincode) {
      await User.findByIdAndDelete(targetId);
      return res.status(200).json({
        success: true,
        message: "User has been deleted",
      });
    } else {
      return res.status(200).json({
        success: false,
        message: "You are Unauthorized distributor for this user",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const updateUserProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.query;
    const { name, email, phoneNumber, pincode, photo } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID must be provided",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }

    if (photo && user.photo && user.photo.includes("cloudinary.com")) {
      const publicId = user.photo.split("/").pop()?.split(".")[0];
      if (publicId) {
        await deleteFromCloudinary([publicId]);
      }
    }

    let newPhotoUrl = user.photo;

    if (photo) {
      const photoBase64 = photo.split(",")[1];
      if (photoBase64) {
        const uploadedPhoto = await uploadToCloudinary([
          {
            buffer: Buffer.from(photoBase64, "base64"),
            mimetype: photo.split(";")[0].split(":")[1],
          },
        ]);
        newPhotoUrl = uploadedPhoto[0].url;
      }
    }

    // Update user details
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (pincode) user.pincode = pincode;
    if (newPhotoUrl) user.photo = newPhotoUrl;

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getAllUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.query;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    let users;

    if (user.role === "admin") {
      users = await User.find();
    } else {
      users = await User.find({ pincode: user.pincode });
    }
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.log("Error retrieving users:", error);
  }
};
