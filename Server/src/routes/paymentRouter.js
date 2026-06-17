import express from "express";
import { getPaymentStatus, handleWebhook, handleWebhookTEST, initiatePayment } from "../controller/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.post('/initiate', express.json(), initiatePayment);
paymentRouter.get('/status/:intentId', getPaymentStatus);
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), handleWebhookTEST);

export default paymentRouter;