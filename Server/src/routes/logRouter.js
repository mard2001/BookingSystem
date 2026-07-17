import express from "express";
import { getActivityLogs, getAllActivityLogs, logActivity } from "../controller/logController.js";

const logRouter = express.Router();

logRouter.get('/getall', getAllActivityLogs);
logRouter.get('/get-logs', getActivityLogs);


export default logRouter;