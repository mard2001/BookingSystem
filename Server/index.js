import cookieParser from 'cookie-parser';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import courtRouter from './src/routes/courtRouter.js';
import authRouter from './src/routes/authRouter.js';
import bookingRouter from './src/routes/bookingRouter.js';
import paymentRouter from './src/routes/paymentRouter.js';
import dashboardRouter from './src/routes/dashboardRouter.js';
import { expireOverduePayments } from './src/jobs/cron/expirePayments.js';

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173',
        "https://ylayasmashrally.netlify.app"
    ], 
    credentials: true,              
}));


app.use(cookieParser()); 
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/payments/webhook", express.raw({ type: 'application/json' }));

app.use(express.json());

app.use("/api/v1/users", authRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/courts", courtRouter);
app.use("/api/v1/dashboard", dashboardRouter);
app.use("/api/v1/payments", paymentRouter);


app.listen(process.env.SERVER_PORT, () => {
    console.log('SERVER WORKING AND LISTENING TO PORT: ' + process.env.SERVER_PORT)
})


cron.schedule('*/2 * * * *', async () => {
  try {
    await expireOverduePayments();
  } catch (err) {
    console.error('[CRON] Unexpected error:', err);
  }
});
