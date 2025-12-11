import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryResponse } from "../types/types";
import { createTransport } from "nodemailer";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri)
    .then((c) => console.log(`DB connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

export const getBase64 = (file: Express.Multer.File) => {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

export const uploadToCloudinary = async (
  files: { buffer: Buffer; mimetype: string }[]
) => {
  const promises = files.map((file) => {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const base64String = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      cloudinary.uploader.upload(base64String, (error, result) => {
        if (error) return reject(error);
        resolve(result!);
      });
    });
  });

  const result = await Promise.all(promises);
  return result.map((i) => ({
    public_id: i.public_id,
    url: i.secure_url,
  }));
};

export const deleteFromCloudinary = async (publicIds: string[]) => {
  const promises = publicIds.map((id) => {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(id, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  });

  await Promise.all(promises);
};

export const sendMailOrderDetailsClient = (
  name: string,
  email: string,
  services: string[],
  distributorPhoneNumber: number,
  subject: string,
  text: string
) => {
  let config = {
    service: "gmail",
    auth: {
      user: process.env.COMPANY_EMAIL,
      pass: process.env.COMPANY_PASS,
    },
  };
  let transporter = createTransport(config);
  const servicesList = services.join("\n");
  let message = {
    from: process.env.COMPANY_EMAIL,
    to: email,
    subject: subject,
    text: text
      .replace("name", name)
      .replace("[Services_List]", servicesList)
      .replace(
        "[support email/phone number]",
        distributorPhoneNumber.toString()
      )
      .replace(/\\n/g, "\n"),
  };
  transporter.sendMail(message);
};
export const sendMailOrderDetailsDistributor = (
  name: string,
  address: string,
  email: string,
  services: string[],
  customerPhoneNumber: number,
  subject: string,
  text: string
) => {
  let config = {
    service: "gmail",
    auth: {
      user: process.env.COMPANY_EMAIL,
      pass: process.env.COMPANY_PASS,
    },
  };
  let transporter = createTransport(config);
  const servicesList = services.join("\n");
  let message = {
    from: process.env.COMPANY_EMAIL,
    to: email,
    subject: subject.replace("[customerName]", name),
    text: text
      .replace(/\[customerName]/g, name)
      .replace("[Services_List]", servicesList)
      .replace("[customerPhoneNumber]", customerPhoneNumber.toString())
      .replace("[customerAddress]", address)
      .replace(/\\n/g, "\n"),
  };
  transporter.sendMail(message);
};
