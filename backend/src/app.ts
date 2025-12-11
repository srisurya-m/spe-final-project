import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import express from "express";
import { connectDB } from "./utils/features";

//importing routes
import userRoute from "./routes/User";
import serviceRoute from "./routes/Service";
import orderRoute from "./routes/Order";

config({
  path: "./.env",
});

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const port = process.env.PORT || 4000;
const app = express();
app.use(express.json());
app.use(cors());

connectDB(process.env.MONGO_URI as string);

app.get("/", (req, res) => {
  res.send("API working with /api/v1");
});

//using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/service", serviceRoute);
app.use("/api/v1/order", orderRoute);

app.listen(Number(port), "0.0.0.0", () => {
  console.log(`server is running on http://0.0.0.0:${port}`);
});
