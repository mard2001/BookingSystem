import cookieParser from 'cookie-parser';
import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import courtRouter from './src/routes/courtRouter.js';
import authRouter from './src/routes/authRouter.js';
import bookingRouter from './src/routes/bookingRouter.js';

const app = express();
app.use(cors({
    origin: [
        'http://localhost:5173',
        "https://ylayasmashrally.netlify.app"
    ], 
    credentials: true,              
}));
app.use(cookieParser()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/courts", courtRouter);
app.use("/api/v1/users", authRouter);
app.use("/api/v1/bookings", bookingRouter);


app.listen(process.env.SERVER_PORT, () => {
    console.log('SERVER WORKING AND LISTENING TO PORT: ' + process.env.SERVER_PORT)
})



