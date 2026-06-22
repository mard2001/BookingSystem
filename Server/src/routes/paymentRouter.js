import express from "express";
import { getPaymentStatus, handleWebhook, handleWebhookTEST, initiatePayment } from "../controller/paymentController.js";
import { authenticate } from "../middleware/authenticate.js";

const paymentRouter = express.Router();

paymentRouter.post('/initiate', express.json(), initiatePayment);
paymentRouter.get('/status/:intentId', getPaymentStatus);
paymentRouter.post('/webhook', express.raw({ type: 'application/json' }), handleWebhookTEST);
paymentRouter.get('/payment-status/:intentId', getPaymentStatus);

export default paymentRouter;