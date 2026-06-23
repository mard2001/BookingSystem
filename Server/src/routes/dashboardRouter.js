import express from "express";
import { dashboardStats, getBookingMonthlyRevenue, getSportRevenue, getUpcomingReservations } from "../controller/dashboardController.js";

const dashboardRouter = express.Router();

dashboardRouter.get('/get/statistics', dashboardStats);
dashboardRouter.get('/get/upcoming/reservations', getUpcomingReservations);
dashboardRouter.get('/get/statistics/booking-revenue', getBookingMonthlyRevenue);
dashboardRouter.get('/get/statistics/sport-revenue', getSportRevenue);

export default dashboardRouter;