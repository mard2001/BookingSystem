import express from "express";
import { getPaymentStatus, handleWebhook, initiatePayment } from "../controller/paymentController";

const paymentRouter = express.Router();

paymentRouter.post('/initiate', express.json(), initiatePayment);
paymentRouter.get('/status/:intentId', getPaymentStatus);
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

export default paymentRouter;