import express from "express";
import {
  changeOrderStatusController,
  deleteOrderController,
  getDistributorOrdersController,
  getUserOrdersController,
  newOrderController,
} from "../controllers/Order";
import { adminOrDistributorOnly } from "../middlewares/auth";

const app = express.Router();

app.get(
  "/all-distributor-orders",
  adminOrDistributorOnly,
  getDistributorOrdersController
); // /api/vi/order/all-distributor-orders?:id
app.get("/all-user-orders", getUserOrdersController); // /api/vi/order/all-user-orders?:id
app.post("/new/:id", newOrderController); // /api/vi/order/new/:id
app.post(
  "/change-order-status",
  adminOrDistributorOnly,
  changeOrderStatusController
); // /api/vi/order/new/:id
app.delete("/:id", adminOrDistributorOnly, deleteOrderController); // /api/vi/order/new/:id

export default app;
