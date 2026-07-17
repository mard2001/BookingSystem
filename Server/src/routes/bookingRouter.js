import express from "express";
import { cancelBooking, cancelBookingViaEWallet, cancelRegularAllBooking, checkAvailability, confirmBooking, confirmBookingViaEWallet, createRecurringSched, getAvailableSlots, getBookings, getCalendarBookings, getCourtSlots, getHistoricalBookings, getRecurringBookingData, getRegularUser, getUpcomingBookings, updateBookingBookerDetails, updateBookingStatus, updateRecurringBookingData } from "../controller/bookingController.js";
import { authenticate, genericMiddleware } from "../middleware/authenticate.js";

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
bookingRouter.post('/confirmbooking', genericMiddleware, confirmBooking);
bookingRouter.post('/confirmbooking-viaewallet/:bookingID', genericMiddleware, confirmBookingViaEWallet);
bookingRouter.post('/regularbooking', genericMiddleware, createRecurringSched);
bookingRouter.put('/update/:bookingID/status', genericMiddleware, updateBookingStatus);
bookingRouter.put('/update/:bookingID/booker-details', genericMiddleware, updateBookingBookerDetails);
bookingRouter.put('/cancel/:bookingID/:paymentIntent', cancelBooking);
bookingRouter.put('/cancel-ewallet-booking/:bookingID', cancelBookingViaEWallet);
bookingRouter.put('/cancel-regular-schedule/:scheduleID', genericMiddleware, cancelRegularAllBooking);
bookingRouter.put('/update-regular-schedule', updateRecurringBookingData);





export default bookingRouter;