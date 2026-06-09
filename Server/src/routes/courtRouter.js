import express from "express";
import { createNewCourt, deleteCourt, externalInsertDefaultTimeSlots, getAllCourts, getAvailableCourts, getCountAvailableCourts, getCountMaintenanceCourts, getCountTotalCourts, getCountUnavailableCourts, updateCourt } from "../controller/courtController.js";


const courtRouter = express.Router();

courtRouter.get('/getall', getAllCourts);
courtRouter.get('/getall/available', getAvailableCourts);
courtRouter.get('/getcount/all', getCountTotalCourts);
courtRouter.get('/getcount/available', getCountAvailableCourts);
courtRouter.get('/getcount/unavailable', getCountUnavailableCourts);
courtRouter.get('/getcount/undermaintenance', getCountMaintenanceCourts);

courtRouter.post('/add/new', createNewCourt);
courtRouter.post('/add/new/timeslot/:courtID', externalInsertDefaultTimeSlots);
courtRouter.put('/update/:courtID', updateCourt);
courtRouter.put('/delete/:courtID', deleteCourt);

export default courtRouter;

