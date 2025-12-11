import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter Name"],
      unique: [true, "this service already exits"],
    },
    photo: {
      type: String,
      required: [true, "Please enter url"],
    },
    description: {
      type: String,
      required: [true, "Please enter Description"],
    },
  },
  {
    timestamps: true,
  }
);

export const Service = mongoose.model("Service", schema);
