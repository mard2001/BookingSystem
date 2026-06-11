import express from "express";
import { checkAvailability, confirmBooking, getAvailableSlots, getBookings, getCalendarBookings, getHistoricalBookings, getUpcomingBookings, updateBookingBookerDetails, updateBookingStatus } from "../controller/bookingController.js";
import { authenticate } from "../middleware/authenticate.js";

const bookingRouter = express.Router();


bookingRouter.get('/getall', authenticate, getBookings);
bookingRouter.get('/get/calendar-data', getCalendarBookings);
bookingRouter.get('/get/availableslots/:courtID/slots', getAvailableSlots);
bookingRouter.get('/get/upcoming/:userID', getUpcomingBookings);
bookingRouter.get('/get/previous/:userID', getHistoricalBookings);
bookingRouter.post('/check/availability', checkAvailability);
bookingRouter.post('/confirmbooking', confirmBooking);
bookingRouter.put('/update/:bookingID/status', updateBookingStatus);
bookingRouter.put('/update/:bookingID/booker-details', updateBookingBookerDetails);




export default bookingRouter;