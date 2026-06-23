import express from "express";
import { dashboardStats, getUpcomingReservations } from "../controller/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get('/get/statistics', dashboardStats);
dashboardRouter.get('/get/upcoming/reservations', getUpcomingReservations);

export default dashboardRouter;