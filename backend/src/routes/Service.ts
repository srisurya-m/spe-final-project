import express from "express";
import {
  deleteDistributorServiceController,
  deleteServiceController,
  getAllServicesController,
  getDistributorServicesController,
  getUserDistributorServicesController,
  newServiceController,
  searchServicesController,
} from "../controllers/Service";
import { adminOnly, adminOrDistributorOnly } from "../middlewares/auth";

const app = express.Router();

app.post("/new", adminOrDistributorOnly, newServiceController); // /api/v1/service/new?id
app.get(
  "/all-distributor-services",
  adminOrDistributorOnly,
  getDistributorServicesController
); // /api/v1/service/all-distributor-services?id
app.post(
  "/all-user-distributor-services",
  getUserDistributorServicesController
); // /api/v1/service/all-user-distributor-services
app.get("/all-services", adminOnly, getAllServicesController); // /api/v1/service/all-user-distributor-services
app.get("/search", searchServicesController); // /api/v1/service/search
app.put("/:id", adminOrDistributorOnly, deleteDistributorServiceController); // /api/v1/service/:id
app.delete("/:id", adminOnly, deleteServiceController); // /api/v1/service/:id

export default app;
