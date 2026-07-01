import express from "express";
import { cancelBooking, cancelRegularAllBooking, checkAvailability, confirmBooking, createRecurringSched, getAvailableSlots, getBookings, getCalendarBookings, getCourtSlots, getHistoricalBookings, getRecurringBookingData, getRegularUser, getUpcomingBookings, updateBookingBookerDetails, updateBookingStatus } from "../controller/bookingController.js";
import { authenticate } from "../middleware/authenticate.js";

const bookingRouter = express.Router();


bookingRouter.get('/getall', authenticate, getBookings);
bookingRouter.get('/get/calendar-data', getCalendarBookings);
bookingRouter.get('/get/availableslots/:courtID/slots', getAvailableSlots);
bookingRouter.get('/get/upcoming/:accountID', getUpcomingBookings);
bookingRouter.get('/get/previous/:accountID', getHistoricalBookings);
bookingRouter.get('/getall/recurring-schedule', getRegularUser);
bookingRouter.get('/get/slots/:courtID', getCourtSlots);
bookingRouter.get('/get/regular-booking-data/:scheduleID', getRecurringBookingData);
bookingRouter.post('/check/availability', checkAvailability);
bookingRouter.post('/confirmbooking', confirmBooking);
bookingRouter.post('/regularbooking', createRecurringSched);
bookingRouter.put('/update/:bookingID/status', updateBookingStatus);
bookingRouter.put('/update/:bookingID/booker-details', updateBookingBookerDetails);
bookingRouter.put('/cancel/:bookingID/:paymentIntent', cancelBooking);
bookingRouter.put('/cancel-regular-schedule/:scheduleID', cancelRegularAllBooking);





export default bookingRouter;