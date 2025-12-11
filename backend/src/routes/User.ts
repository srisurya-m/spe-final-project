import express from "express";
import {
  changeRoleController,
  deleteUserController,
  getAllUsersController,
  getUserController,
  newUserController,
  updateUserProfileController,
} from "../controllers/User";
import { adminOnly, adminOrDistributorOnly } from "../middlewares/auth";

const app = express.Router();

app.post("/new", newUserController);
app.put("/change-role", adminOnly, changeRoleController);
app.post("/delete-user", adminOrDistributorOnly, deleteUserController);
app.put("/update-user-profile", updateUserProfileController);
app.get("/get-all-users", adminOrDistributorOnly, getAllUsersController);
app.get("/:id", getUserController);

export default app;
